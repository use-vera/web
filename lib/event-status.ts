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

/** Strictly future — excludes events that have already started (unlike "live"). */
export const isEventStrictlyUpcoming = (event: PublicEventApi) => {
  const startsAtMs = Date.parse(event.nextOccurrenceAt || event.startsAt || "");
  return Number.isFinite(startsAtMs) && startsAtMs > Date.now();
};
