import { formatNairaCompact } from "@/lib/format-currency";
import { type PublicEventApi } from "@/lib/types/event";

/* The app's short forms, so the site and the app describe an event the same way. */

/** "Sat 8PM", in the viewer's own time. */
export const shortWhen = (iso?: string | null) => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const day = date.toLocaleDateString("en-NG", { weekday: "short" });
  const hour = date.getHours() % 12 || 12;
  const minutes = date.getMinutes();
  return `${day} ${hour}${minutes ? `:${String(minutes).padStart(2, "0")}` : ""}${date.getHours() < 12 ? "AM" : "PM"}`;
};

/** "Sat 31 Oct", for when the week day alone is ambiguous. */
export const dayLabel = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "short" }) : "";

/** The venue's name, else the first part of the address. */
export const placeOf = (event: Pick<PublicEventApi, "eventCenterId" | "address" | "state">) => {
  const venue = event.eventCenterId && typeof event.eventCenterId === "object" ? event.eventCenterId.name : "";
  return venue || String(event.address || "").split(",")[0]?.trim() || event.state || "";
};

export const hostOf = (event: Pick<PublicEventApi, "organizerUserId">) =>
  typeof event.organizerUserId === "object" ? event.organizerUserId.fullName : "";

/** "₦12K", "Free" or "Sold out": the pill on a card. */
export const priceTag = (event: Pick<PublicEventApi, "isPaid" | "ticketPriceNaira" | "currentTicketPriceNaira" | "remainingTickets" | "expectedTickets">) => {
  if (event.expectedTickets > 0 && event.remainingTickets <= 0) return "Sold out";
  if (!event.isPaid) return "Free";
  return formatNairaCompact(event.currentTicketPriceNaira ?? event.ticketPriceNaira);
};
