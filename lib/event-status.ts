import { type PublicEventApi } from "@/lib/types/event";

/**
 * Mirrors the mobile app's purchasability + reason logic (app/events/[id].tsx)
 * so "can't buy this ticket" reads the same way on both platforms.
 */
export const getEventPurchasability = (event: PublicEventApi) => {
  const nextOccurrenceStartMs = Date.parse(
    event.nextOccurrenceAt || event.startsAt || "",
  );
  const presaleStartsAtMs = Date.parse(event.sales?.presaleStartsAt || "");
  const salesStartsAtMs = Date.parse(event.sales?.startsAt || "");
  const blockedUntilPresaleStarts = Boolean(
    event.sales?.presaleEnabled &&
      Number.isFinite(presaleStartsAtMs) &&
      Date.now() < presaleStartsAtMs &&
      (!Number.isFinite(salesStartsAtMs) || Date.now() < salesStartsAtMs),
  );
  const salesClosedByTime =
    Number.isFinite(nextOccurrenceStartMs) &&
    nextOccurrenceStartMs <= Date.now();

  const purchasable = Boolean(
    (!event.status || event.status === "published") &&
      event.salePhase !== "upcoming" &&
      Number(event.remainingTickets || 0) > 0 &&
      !blockedUntilPresaleStarts &&
      !salesClosedByTime,
  );

  if (purchasable) {
    return { purchasable, reason: null as string | null };
  }

  const reason =
    event.status === "draft"
      ? "This event is still a draft. Publish it before attendees can reserve tickets."
      : event.salePhase === "upcoming"
        ? "Ticket sales have not opened yet. Check the sales schedule on this event."
        : salesClosedByTime
          ? "Ticket sales are closed for this event."
          : event.status === "cancelled"
            ? "This event is cancelled and no longer accepts ticket purchases."
            : Number(event.remainingTickets || 0) <= 0
              ? "No tickets are available for this event."
              : "Tickets are currently unavailable for this event.";

  return { purchasable, reason };
};

/** An event is "live" once its next occurrence has started and hasn't ended yet. */
export const isEventLive = (event: PublicEventApi) => {
  const startsAtMs = Date.parse(event.nextOccurrenceAt || event.startsAt || "");
  const endsAtMs = Date.parse(
    event.nextOccurrenceEndsAt || event.endsAt || "",
  );

  if (!Number.isFinite(startsAtMs) || !Number.isFinite(endsAtMs)) {
    return false;
  }

  const now = Date.now();
  return startsAtMs <= now && now < endsAtMs;
};

/** Strictly future. Excludes events that have already started (unlike "live"). */
export const isEventStrictlyUpcoming = (event: PublicEventApi) => {
  const startsAtMs = Date.parse(event.nextOccurrenceAt || event.startsAt || "");
  return Number.isFinite(startsAtMs) && startsAtMs > Date.now();
};

export type OrganizerEventBadge =
  | "draft"
  | "cancelled"
  | "ended"
  | "sold-out"
  | "live"
  | "scheduled"
  | "on-sale";

/**
 * What the organizer's own list should call an event. Only draft/published/
 * cancelled are stored, so "ended" and "sold out" are derived here rather than
 * read off the record, and the clock reads stay out of component render, as
 * with the other helpers in this file.
 */
export const getOrganizerEventBadge = (
  event: PublicEventApi,
): OrganizerEventBadge => {
  if (event.status === "draft") {
    return "draft";
  }

  if (event.status === "cancelled") {
    return "cancelled";
  }

  const endsAtMs = Date.parse(event.nextOccurrenceEndsAt || event.endsAt || "");

  if (Number.isFinite(endsAtMs) && endsAtMs < Date.now()) {
    return "ended";
  }

  /* "Live" means the doors are open right now. Not merely published. A
     published event that starts next month is "On sale", and one whose sale
     window has not opened is "Scheduled". */
  if (isEventLive(event)) {
    return "live";
  }

  if (Number(event.remainingTickets || 0) <= 0) {
    return "sold-out";
  }

  return event.salePhase === "upcoming" ? "scheduled" : "on-sale";
};

/** Whole days from now until `iso`, rounded up. Negative once it has passed. */
export const daysUntil = (iso: string) => {
  const targetMs = Date.parse(iso);

  if (!Number.isFinite(targetMs)) {
    return 0;
  }

  return Math.ceil((targetMs - Date.now()) / (1000 * 60 * 60 * 24));
};

/** Wall-clock HH:MM, defaulting to now when a timestamp is missing. */
export const clockLabel = (iso?: string | null) =>
  new Intl.DateTimeFormat("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(iso ? new Date(iso) : new Date());
