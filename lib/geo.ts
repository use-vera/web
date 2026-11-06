const EARTH_RADIUS_KM = 6371;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export interface LatLng {
  latitude: number;
  longitude: number;
}

/** Straight-line distance in km (haversine). */
export const distanceKm = (from: LatLng, to: LatLng) => {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
};

/** "800 m", "4.1 km", "18 km". */
export const formatDistance = (km: number) => {
  if (km < 1) return `${Math.max(100, Math.round((km * 1000) / 100) * 100)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
};

/*
 * A rough drive time: Lagos traffic averages somewhere near 20 km/h across a
 * day, plus a few minutes to get going. Always shown with "≈" because it's an
 * estimate from distance alone, the same approach the app takes.
 */
const CITY_KMH = 20;
const START_MINUTES = 4;
export const roughDriveMinutes = (km: number) => Math.max(5, Math.round((km / CITY_KMH) * 60 + START_MINUTES));
