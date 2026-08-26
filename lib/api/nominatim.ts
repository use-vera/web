import { type GeocodeResult } from "@/lib/types/organizer";

/**
 * OpenStreetMap's geocoder. Called from Route Handlers only — never the
 * browser — so the identifying User-Agent their usage policy requires is
 * actually sent, and so a viewer's coordinates reach OSM from our server
 * rather than from their IP.
 */
const NOMINATIM = "https://nominatim.openstreetmap.org";

const USER_AGENT =
  process.env.NOMINATIM_USER_AGENT ?? "VeraEvents/1.0 (organizer dashboard)";

interface NominatimAddress {
  state?: string;
  region?: string;
  country?: string;
  city?: string;
  town?: string;
  suburb?: string;
  road?: string;
}

interface NominatimPlace {
  display_name?: string;
  name?: string;
  lat?: string;
  lon?: string;
  address?: NominatimAddress;
}

const toResult = (place: NominatimPlace): GeocodeResult | null => {
  const latitude = Number(place.lat);
  const longitude = Number(place.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const address = place.address ?? {};

  return {
    label: place.display_name ?? "",
    name:
      place.name ||
      [address.road, address.suburb, address.city ?? address.town]
        .filter(Boolean)
        .join(", ") ||
      place.display_name ||
      "Dropped pin",
    latitude,
    longitude,
    state: (address.state ?? address.region ?? "").replace(/\s+State$/i, ""),
    country: address.country ?? "",
  };
};

const call = async (path: string, params: Record<string, string>) => {
  const url = new URL(`${NOMINATIM}${path}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Nominatim responded ${response.status}`);
  }

  return response.json();
};

export const geocodeSearch = async (
  query: string,
  countryCodes?: string,
): Promise<GeocodeResult[]> => {
  const places = (await call("/search", {
    q: query,
    limit: "6",
    ...(countryCodes ? { countrycodes: countryCodes } : {}),
  })) as NominatimPlace[];

  return places.map(toResult).filter((item): item is GeocodeResult => item !== null);
};

export const geocodeReverse = async (
  latitude: number,
  longitude: number,
): Promise<GeocodeResult | null> => {
  const place = (await call("/reverse", {
    lat: String(latitude),
    lon: String(longitude),
  })) as NominatimPlace;

  return toResult(place);
};
