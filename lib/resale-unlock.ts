import {
  type EventTicketCategoryApi,
  type PublicEventApi,
} from "@/lib/types/event";

export interface ResaleUnlock {
  unlocked: boolean;
  /** Empty when unlocked. Written for the seller, not the developer. */
  reason: string;
}

const tierOf = (
  event: PublicEventApi,
  ticketCategoryId?: string | null,
): EventTicketCategoryApi | null =>
  ticketCategoryId
    ? ((event.ticketCategories ?? []).find(
        (category) => category._id === ticketCategoryId,
      ) ?? null)
    : null;

/**
 * Mirrors `resolveResaleUnlock` on the server so the seller is told before
 * they fill in a price, not after a 409. The server is still the authority;
 * this only decides what the screen says.
 */
export const getResaleUnlock = (
  event: PublicEventApi | null | undefined,
  ticketCategoryId?: string | null,
): ResaleUnlock => {
  if (!event) {
    return { unlocked: false, reason: "" };
  }

  const tier = tierOf(event, ticketCategoryId);

  if (tier) {
    if (tier.availabilityState === "closed" || tier.soldOut) {
      return { unlocked: true, reason: "" };
    }

    /* Undefined means the response never carried the count, so the screen
       stays quiet and lets the server answer. */
    if (tier.soldOut === undefined || tier.soldOut === null) {
      return { unlocked: false, reason: "" };
    }

    return {
      unlocked: false,
      reason: `${tier.name} is still on sale from the organizer. You can resell this ticket once that tier sells out or its sale window closes.`,
    };
  }

  if ((event.remainingTickets ?? 0) <= 0) {
    return { unlocked: true, reason: "" };
  }

  return {
    unlocked: false,
    reason:
      "Tickets are still on sale from the organizer. You can resell this ticket once the event sells out or sales close.",
  };
};
