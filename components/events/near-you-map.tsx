"use client";

import "leaflet/dist/leaflet.css";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import { type LatLng } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import Supercluster from "supercluster";

export interface NearYouPin {
  id: string;
  /* "1"–"4" for the cards beside the map; other pins are plain dots. */
  label: string | null;
  latitude: number;
  longitude: number;
  /* Poster tone, so each pin matches its card. */
  background: string;
  foreground: string;
}

interface NearYouMapProps {
  origin: LatLng;
  pins: NearYouPin[];
  /* One id for a single pin; several when a group sits on one spot. */
  selectedIds: string[] | null;
  onSelect: (ids: string[] | null) => void;
  className?: string;
}

type Leaflet = typeof import("leaflet");
type PinIndex = Supercluster<{ pinIndex: number }>;

const INK = "#16150F";
/* Leaflet's deepest zoom. Clustering runs all the way down, so events at one address stay one group. */
const MAX_ZOOM = 19;
/* ~1 m: closer than this is "the same place". */
const SAME_SPOT_DEGREES = 0.00001;

/* Only colours and counts go into these strings, never event text, so there is nothing to escape. */
const pinHtml = (pin: NearYouPin, selected: boolean) => {
  const size = pin.label ? 34 : 18;
  const ring = selected ? `box-shadow:0 0 0 4px ${INK};` : "";
  return `<span style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:9999px;border:3px solid ${INK};background:${pin.background};color:${pin.foreground};font-weight:800;font-size:13px;cursor:pointer;${ring}">${pin.label ?? ""}</span>`;
};

const clusterHtml = (count: number) =>
  `<span style="display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:9999px;border:3px solid #F5F3EF;background:${INK};color:#F5F3EF;font-weight:800;font-size:14px;cursor:pointer;">${count}</span>`;

const YOU_HTML = `<span style="display:block;width:20px;height:20px;border-radius:9999px;border:3px solid #F5F3EF;background:#0FB26E;box-shadow:0 0 0 2px ${INK};"></span>`;

/**
 * OpenStreetMap tiles via Leaflet (the same setup as `LocationMap`): you in
 * green, events as pins in their card colours, grouped into a count when they
 * would overlap at the current zoom, the way the app's map does it. The map is
 * created once; pins and selection are redrawn on top of it, so typing
 * elsewhere on the page never resets the view.
 */
const NearYouMap = ({ origin, pins, selectedIds, onSelect, className }: NearYouMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<Leaflet | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const indexRef = useRef<PinIndex | null>(null);
  const pinsRef = useRef(pins);
  const selectedRef = useRef(selectedIds);
  const onSelectRef = useRef(onSelect);
  const originRef = useRef(origin);
  const fittedKeyRef = useRef("");

  /* Draws whatever the index says is visible at the current zoom. */
  const redrawRef = useRef(() => {
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    const index = indexRef.current;
    if (!leaflet || !map || !layer || !index) return;

    layer.clearLayers();
    const bounds = map.getBounds();
    const bbox: [number, number, number, number] = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];

    for (const feature of index.getClusters(bbox, Math.round(map.getZoom()))) {
      const [longitude, latitude] = feature.geometry.coordinates;

      if ("cluster" in feature.properties && feature.properties.cluster) {
        const clusterId = feature.properties.cluster_id;
        leaflet
          .marker([latitude, longitude], {
            icon: leaflet.divIcon({ className: "", html: clusterHtml(feature.properties.point_count), iconSize: [42, 42], iconAnchor: [21, 21] }),
            title: `${feature.properties.point_count} events`,
            keyboard: true,
          })
          .on("click", () => {
            const leaves = index.getLeaves(clusterId, Infinity).map((leaf) => pinsRef.current[leaf.properties.pinIndex]).filter(Boolean);
            const [first] = leaves;
            const oneSpot = leaves.every(
              (pin) => Math.abs(pin.latitude - first.latitude) < SAME_SPOT_DEGREES && Math.abs(pin.longitude - first.longitude) < SAME_SPOT_DEGREES,
            );
            /* Zooming can't separate events at the same address, so list them instead. */
            if (oneSpot) {
              onSelectRef.current(leaves.map((pin) => pin.id));
              return;
            }
            map.flyTo([latitude, longitude], Math.min(index.getClusterExpansionZoom(clusterId), MAX_ZOOM), { duration: 0.6 });
          })
          .addTo(layer);
        continue;
      }

      const pin = pinsRef.current[(feature.properties as { pinIndex: number }).pinIndex];
      if (!pin) continue;
      const size = pin.label ? 34 : 18;
      const selected = selectedRef.current?.includes(pin.id) ?? false;
      leaflet
        .marker([pin.latitude, pin.longitude], {
          icon: leaflet.divIcon({ className: "", html: pinHtml(pin, selected), iconSize: [size, size], iconAnchor: [size / 2, size / 2] }),
          keyboard: true,
          zIndexOffset: selected ? 900 : pin.label ? 500 : 0,
        })
        .on("click", () => onSelectRef.current([pin.id]))
        .addTo(layer);
    }
  });

  /* The latest props, for handlers bound once at mount. */
  useEffect(() => {
    onSelectRef.current = onSelect;
    originRef.current = origin;
  }, [onSelect, origin]);

  /* Rebuild the grouping when the events change, and reframe only when the set of events is new. */
  const setPinsRef = useRef(() => {
    const map = mapRef.current;
    const leaflet = leafletRef.current;
    if (!map || !leaflet) return;

    const current = pinsRef.current;
    const index: PinIndex = new Supercluster({ radius: 60, maxZoom: MAX_ZOOM });
    index.load(
      current.map((pin, pinIndex) => ({
        type: "Feature" as const,
        properties: { pinIndex },
        geometry: { type: "Point" as const, coordinates: [pin.longitude, pin.latitude] },
      })),
    );
    indexRef.current = index;

    const key = current.map((pin) => pin.id).join(",");
    if (key !== fittedKeyRef.current) {
      fittedKeyRef.current = key;
      const points = [leaflet.latLng(originRef.current.latitude, originRef.current.longitude), ...current.map((pin) => leaflet.latLng(pin.latitude, pin.longitude))];
      map.fitBounds(leaflet.latLngBounds(points), { padding: [48, 48], maxZoom: 15 });
    }

    redrawRef.current();
  });

  /* Create the map once. Leaflet is imported lazily because it touches `window`. */
  useEffect(() => {
    let cancelled = false;

    const mount = async () => {
      const leaflet = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const map = leaflet.map(containerRef.current, {
        center: [originRef.current.latitude, originRef.current.longitude],
        zoom: 13,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: MAX_ZOOM,
          attribution: "&copy; OpenStreetMap contributors",
        })
        .addTo(map);

      leaflet
        .marker([originRef.current.latitude, originRef.current.longitude], {
          icon: leaflet.divIcon({ className: "", html: YOU_HTML, iconSize: [20, 20], iconAnchor: [10, 10] }),
          title: "You",
          zIndexOffset: 1000,
          interactive: false,
        })
        .addTo(map);

      leafletRef.current = leaflet;
      mapRef.current = map;
      layerRef.current = leaflet.layerGroup().addTo(map);

      map.on("moveend", () => redrawRef.current());
      /* A click on empty map closes the preview. */
      map.on("click", () => onSelectRef.current(null));

      setPinsRef.current();
    };

    void mount();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    pinsRef.current = pins;
    setPinsRef.current();
  }, [pins]);

  useEffect(() => {
    selectedRef.current = selectedIds;
    redrawRef.current();
  }, [selectedIds]);

  return (
    <div
      ref={containerRef}
      aria-label="Map of events near you"
      // `isolate` traps Leaflet's own z-indices (400–800) so the map can't paint over the sticky header.
      className={cn("isolate overflow-hidden [&_.leaflet-container]:font-sans", className)}
    />
  );
};

export default NearYouMap;
