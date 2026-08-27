"use client";

import "leaflet/dist/leaflet.css";
import type { Circle, Map as LeafletMap, Marker } from "leaflet";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface LocationMapProps {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  onChange?: (next: { latitude: number; longitude: number }) => void;
  /** Read-only preview: no dragging, no click-to-move, no zoom controls. */
  interactive?: boolean;
  className?: string;
}

/**
 * OpenStreetMap tiles via Leaflet, matching the mobile app's OSM map. The pin
 * is draggable and a click anywhere moves it; the circle shows the geofence
 * the door scanner checks against, so its size is a real setting rather than
 * decoration.
 *
 * Leaflet is loaded lazily because it touches `window` at import time and
 * would break the server render.
 */
export const LocationMap = ({
  latitude,
  longitude,
  radiusMeters,
  onChange,
  interactive = true,
  className,
}: LocationMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const circleRef = useRef<Circle | null>(null);
  const onChangeRef = useRef(onChange);
  const interactiveRef = useRef(interactive);

  /* The map is mounted once; keeping the latest callback in a ref lets its
     handlers stay bound without tearing the map down on every render. */
  useEffect(() => {
    onChangeRef.current = onChange;
    interactiveRef.current = interactive;
  }, [onChange, interactive]);

  useEffect(() => {
    let cancelled = false;

    const mount = async () => {
      const leaflet = await import("leaflet");

      if (cancelled || !containerRef.current || mapRef.current) {
        return;
      }

      const map = leaflet.map(containerRef.current, {
        center: [latitude, longitude],
        zoom: 15,
        attributionControl: true,
        dragging: interactiveRef.current,
        scrollWheelZoom: interactiveRef.current,
        doubleClickZoom: interactiveRef.current,
        boxZoom: interactiveRef.current,
        keyboard: interactiveRef.current,
        zoomControl: interactiveRef.current,
        touchZoom: interactiveRef.current,
      });

      leaflet
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "&copy; OpenStreetMap contributors",
        })
        .addTo(map);

      /* The default marker asset is resolved from a bundler-relative URL that
         Next cannot serve, so the pin is drawn as inline SVG instead. */
      const icon = leaflet.divIcon({
        className: "",
        html:
          '<svg width="30" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="#0fb26e" stroke="#16150f" stroke-width="1.5"/>' +
          '<circle cx="12" cy="10" r="3" fill="#16150f"/></svg>',
        iconSize: [30, 38],
        iconAnchor: [15, 38],
      });

      const marker = leaflet
        .marker([latitude, longitude], {
          draggable: interactiveRef.current,
          icon,
        })
        .addTo(map);

      const circle = leaflet
        .circle([latitude, longitude], {
          radius: radiusMeters,
          color: "#0fb26e",
          weight: 1.5,
          fillColor: "#0fb26e",
          fillOpacity: 0.12,
        })
        .addTo(map);

      marker.on("dragend", () => {
        const { lat, lng } = marker.getLatLng();
        onChangeRef.current?.({ latitude: lat, longitude: lng });
      });

      map.on("click", (event) => {
        if (!interactiveRef.current) {
          return;
        }

        const { lat, lng } = event.latlng;
        marker.setLatLng([lat, lng]);
        circle.setLatLng([lat, lng]);
        onChangeRef.current?.({ latitude: lat, longitude: lng });
      });

      mapRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    };

    void mount();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Keep the pin and circle in step when the coordinates change from
     elsewhere — a venue picked from search, or "use my location". */
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !circleRef.current) {
      return;
    }

    markerRef.current.setLatLng([latitude, longitude]);
    circleRef.current.setLatLng([latitude, longitude]);
    mapRef.current.setView([latitude, longitude], mapRef.current.getZoom());
  }, [latitude, longitude]);

  useEffect(() => {
    circleRef.current?.setRadius(radiusMeters);
  }, [radiusMeters]);

  return (
    <div
      ref={containerRef}
      role={interactive ? "application" : "img"}
      aria-label={
        interactive
          ? "Map. Click or drag the pin to set where the event happens."
          : "Map showing where the event happens."
      }
      className={cn(
        // `isolate` is load-bearing: Leaflet's panes and controls carry
        // z-index 400–800 of their own, which would otherwise paint over
        // anything lower in the same stacking context — dialogs (z-50) and
        // the sticky header included. Isolating the container traps those
        // z-indices inside it.
        "isolate w-full overflow-hidden rounded-md border border-border [&_.leaflet-container]:font-sans",
        className ?? "h-[320px]",
      )}
    />
  );
};
