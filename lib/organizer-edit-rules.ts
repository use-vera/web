import { type PublicEventApi } from "@/lib/types/event";

/**
 * What an organizer may still change, and what the backend will refuse.
 *
 * The server locks the whole pricing shape. IsPaid, feeMode, ticketPriceNaira,
 * ticketCategories and the sales window. The moment any ticket exists in
 * pending/paid/used (see updateEvent in backend/src/services/event.service.js,
 * which answers 409 "Ticket pricing, paid/free mode, and categories lock after
 * tickets are issued"). Mirroring that here means the UI disables those fields
 * instead of letting someone fill a form that cannot save.
 */
export interface EditPermissions {
  hasIssuedTickets: boolean;
  canEditPricing: boolean;
  canDelete: boolean;
  /** Changing these after tickets are sold needs attendees told. */
  notifiableFields: readonly ["location", "schedule"];
}

export const getEditPermissions = (issuedTickets: number): EditPermissions => ({
  hasIssuedTickets: issuedTickets > 0,
  canEditPricing: issuedTickets === 0,
  /* Delete is refused with active tickets; cancelling refunds them instead. */
  canDelete: issuedTickets === 0,
  notifiableFields: ["location", "schedule"],
});

export interface ChangeSummary {
  locationChanged: boolean;
  scheduleChanged: boolean;
  changedLabels: string[];
}

const sameTime = (a: string, b: string) =>
  new Date(a).getTime() === new Date(b).getTime();

export const summariseChanges = (
  original: PublicEventApi,
  next: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    startsAt: string;
    endsAt: string;
    imageUrl?: string;
  },
): ChangeSummary => {
  const locationChanged =
    original.address !== next.address ||
    Math.abs((original.latitude ?? 0) - next.latitude) > 0.00001 ||
    Math.abs((original.longitude ?? 0) - next.longitude) > 0.00001;

  const scheduleChanged =
    !sameTime(original.startsAt, next.startsAt) ||
    !sameTime(original.endsAt, next.endsAt);

  const changedLabels: string[] = [];

  if (original.name !== next.name) changedLabels.push("name");
  if (locationChanged) changedLabels.push("location");
  if (scheduleChanged) changedLabels.push("date or time");
  if ((original.imageUrl ?? "") !== (next.imageUrl ?? ""))
    changedLabels.push("cover image");

  return { locationChanged, scheduleChanged, changedLabels };
};

/** The message posted to the event channel when something material moves. */
export const buildChangeAnnouncement = (
  event: PublicEventApi,
  change: ChangeSummary,
  next: { address: string; startsAt: string },
) => {
  const parts: string[] = [];

  if (change.scheduleChanged) {
    parts.push(
      `the new start time is ${new Intl.DateTimeFormat("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(next.startsAt))}`,
    );
  }

  if (change.locationChanged) {
    parts.push(`it now happens at ${next.address}`);
  }

  if (parts.length === 0) {
    return null;
  }

  return `Update to ${event.name}: ${parts.join(", and ")}. Your ticket is still valid. Nothing to re-book.`;
};
