import axios from "axios";

interface ValidationIssue {
  path: string;
  message: string;
}

interface BackendEnvelope {
  success: boolean;
  message?: string;
  details?: {
    source?: string;
    errors?: ValidationIssue[];
  } | null;
}

/**
 * Field paths as the API names them, in the words the form uses. Without this
 * a rejected create reads "latitude: Required" instead of "Location".
 */
const FIELD_LABELS: Record<string, string> = {
  name: "Event name",
  description: "Description",
  imageUrl: "Cover image",
  address: "Address",
  state: "State",
  latitude: "Location",
  longitude: "Location",
  geofenceRadiusMeters: "Check-in radius",
  startsAt: "Start time",
  endsAt: "End time",
  timezone: "Timezone",
  categoryIds: "Categories",
  isPaid: "Free or paid",
  feeMode: "Who covers the fee",
  ticketPriceNaira: "Ticket price",
  expectedTickets: "Capacity",
  ticketCategories: "Ticket tiers",
  recurrence: "Repeat rule",
  sales: "Sale window",
  resale: "Resale policy",
  amountKobo: "Amount",
  priceNaira: "Price",
  amountNaira: "Amount",
  quantity: "Quantity",
};

/** "ticketCategories.0.priceNaira" -> "Ticket tier 1 price". */
const labelForPath = (path: string) => {
  if (!path) {
    return "";
  }

  const segments = path.split(".");
  const [head, maybeIndex, ...rest] = segments;

  if (head === "ticketCategories" && maybeIndex !== undefined) {
    const index = Number(maybeIndex);
    const leaf = rest[rest.length - 1];
    const leafLabel = leaf ? (FIELD_LABELS[leaf] ?? leaf) : "";

    return Number.isFinite(index)
      ? `Ticket tier ${index + 1}${leafLabel ? ` ${leafLabel.toLowerCase()}` : ""}`
      : "Ticket tiers";
  }

  return FIELD_LABELS[head] ?? head;
};

/** The field-level problems the API reported, if it reported any. */
export const getValidationIssues = (error: unknown): ValidationIssue[] => {
  if (!axios.isAxiosError(error)) {
    return [];
  }

  const body = error.response?.data as BackendEnvelope | undefined;

  return body?.details?.errors ?? [];
};

/**
 * Extracts the backend's human-readable message from a failed BFF call. When
 * the failure is a validation error, the individual field problems are spelled
 * out. "Validation error" on its own tells nobody what to fix.
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const body = error.response?.data as BackendEnvelope | undefined;
  const issues = body?.details?.errors ?? [];

  if (issues.length > 0) {
    const lines = issues
      .slice(0, 4)
      .map((issue) => {
        const label = labelForPath(issue.path);
        return label ? `${label}: ${issue.message}` : issue.message;
      })
      .join("\n");

    const extra = issues.length > 4 ? `\n…and ${issues.length - 4} more` : "";

    return `${lines}${extra}`;
  }

  return body?.message || fallback;
};
