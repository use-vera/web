interface MapTarget {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  /** Venue name, preferred over raw coordinates as the search label. */
  label?: string | null;
}

const hasCoordinates = (target: MapTarget) =>
  typeof target.latitude === "number" &&
  typeof target.longitude === "number" &&
  Number.isFinite(target.latitude) &&
  Number.isFinite(target.longitude);

/**
 * Google Maps' cross-platform URL scheme. The same https link opens the
 * native app on Android and iOS and the web map on desktop, so there is no
 * need to sniff the platform or maintain geo:/comgooglemaps: fallbacks.
 *
 * Directions are requested rather than a pin, because someone opening this
 * from a ticket wants to get there, not to look at it.
 */
export const googleMapsDirectionsUrl = (target: MapTarget) => {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");

  if (hasCoordinates(target)) {
    url.searchParams.set("destination", `${target.latitude},${target.longitude}`);
  } else if (target.address) {
    url.searchParams.set("destination", target.address);
  } else {
    return null;
  }

  return url.toString();
};

/** A pin rather than a route — for "where is this?" rather than "take me there". */
export const googleMapsSearchUrl = (target: MapTarget) => {
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");

  const query = hasCoordinates(target)
    ? `${target.latitude},${target.longitude}`
    : target.address;

  if (!query) {
    return null;
  }

  url.searchParams.set("query", query);

  return url.toString();
};
