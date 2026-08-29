import { NIGERIAN_STATES } from "@/lib/nigerian-states";

/**
 * Countries Vera lists events in. The backend stores only `state`. There is
 * no country field on an event, so the country selection exists to pick the
 * right state list and to prefill from geolocation, not to be persisted.
 */
export const COUNTRIES = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
] as const;

const GHANA_REGIONS = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern",
  "Greater Accra", "North East", "Northern", "Oti", "Savannah",
  "Upper East", "Upper West", "Volta", "Western", "Western North",
];

const KENYA_COUNTIES = [
  "Mombasa", "Kwale", "Kilifi", "Nairobi", "Nakuru", "Kisumu", "Uasin Gishu",
  "Machakos", "Kiambu", "Kajiado", "Meru", "Nyeri", "Laikipia", "Kakamega",
];

const SOUTH_AFRICA_PROVINCES = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
  "Mpumalanga", "North West", "Northern Cape", "Western Cape",
];

/**
 * The administrative divisions we can offer as a picker. A country absent from
 * this map falls back to a free-text field rather than an incomplete list.
 * A half-populated dropdown is worse than typing.
 */
const SUBDIVISIONS: Record<string, string[]> = {
  Nigeria: NIGERIAN_STATES,
  Ghana: GHANA_REGIONS,
  Kenya: KENYA_COUNTIES,
  "South Africa": SOUTH_AFRICA_PROVINCES,
};

export const subdivisionsFor = (country: string): string[] | null =>
  SUBDIVISIONS[country] ?? null;

/** What the subdivision is called where the event is. Shown as the label. */
export const subdivisionLabel = (country: string) => {
  if (country === "Ghana") return "Region";
  if (country === "Kenya") return "County";
  if (country === "South Africa") return "Province";
  if (country === "United Kingdom") return "County or city";
  if (country === "United States") return "State";
  return "State";
};
