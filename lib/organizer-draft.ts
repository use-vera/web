import {
  type CreateEventPayload,
  type EventTicketCategoryPayload,
} from "@/lib/types/organizer";
import { type EventLocation } from "@/components/organizer/location-picker";

export const PLATFORM_FEE_PERCENT = 5;

export interface EventDraft {
  name: string;
  description: string;
  imageUrl?: string;
  categoryIds: string[];
  location: EventLocation;
  startsAt: string;
  endsAt: string;
  timezone: string;
  recurrenceType: "none" | "weekly" | "monthly-day";
  recurrenceInterval: number;
  recurrenceDays: number[];
  recurrenceEndsOn: string;
  isPaid: boolean;
  feeMode: "absorbed_by_organizer" | "passed_to_attendee";
  tiers: EventTicketCategoryPayload[];
  salesStartsAt: string;
  resaleEnabled: boolean;
  resaleAllowBids: boolean;
  resaleMaxMarkupPercent: number;
  resaleBidWindowHours: number;
}

export const capacityOf = (draft: EventDraft) =>
  draft.tiers.reduce((sum, tier) => sum + (Number(tier.quantity) || 0), 0);

export const grossIfSoldOut = (draft: EventDraft) =>
  draft.isPaid
    ? draft.tiers.reduce(
        (sum, tier) =>
          sum + (Number(tier.quantity) || 0) * (Number(tier.priceNaira) || 0),
        0,
      )
    : 0;

const toIso = (local: string | null | undefined) =>
  local ? new Date(local).toISOString() : null;

/** Turns the form's local-time strings and blanks into the API's payload shape. */
export const draftToPayload = (
  draft: EventDraft,
  status: "draft" | "published",
): CreateEventPayload => {
  const leadPrice = Number(draft.tiers[0]?.priceNaira) || 0;

  return {
    name: draft.name.trim(),
    description: draft.description.trim() || undefined,
    imageUrl: draft.imageUrl || undefined,
    categoryIds: draft.categoryIds.length > 0 ? draft.categoryIds : undefined,
    address: draft.location.address.trim(),
    state: draft.location.state.trim() || undefined,
    latitude: draft.location.latitude,
    longitude: draft.location.longitude,
    geofenceRadiusMeters: draft.location.geofenceRadiusMeters,
    eventCenterId: draft.location.eventCenterId,
    startsAt: new Date(draft.startsAt).toISOString(),
    endsAt: new Date(draft.endsAt).toISOString(),
    timezone: draft.timezone,
    isPaid: draft.isPaid,
    feeMode: draft.feeMode,
    ticketPriceNaira: draft.isPaid ? leadPrice : 0,
    expectedTickets: capacityOf(draft),
    /*
     * A presale is stored as ONE quantity and ONE price on the event, with no
     * field tying it to a tier, so the backend rejects presale alongside
     * ticket categories. A single tier is conceptually the same thing as base
     * pricing, so it is sent that way to keep presale usable; more than one
     * tier is a genuine conflict and is caught in getStepIssues.
     */
    ticketCategories: draft.tiers.map((tier) => ({
      name: tier.name.trim(),
      quantity: Number(tier.quantity) || 0,
      priceNaira: draft.isPaid ? Number(tier.priceNaira) || 0 : 0,
      availableFrom: toIso(tier.availableFrom),
      availableUntil: toIso(tier.availableUntil),
    })),
    recurrence:
      draft.recurrenceType === "none"
        ? { type: "none" }
        : {
            type: draft.recurrenceType,
            interval: draft.recurrenceInterval,
            daysOfWeek:
              draft.recurrenceType === "weekly" ? draft.recurrenceDays : [],
            ...(draft.recurrenceType === "monthly-day"
              ? { dayOfMonth: new Date(draft.startsAt).getDate() }
              : {}),
            ...(draft.recurrenceEndsOn
              ? { endsOn: new Date(draft.recurrenceEndsOn).toISOString() }
              : {}),
          },
    /* Early access is expressed per tier now, so the event-level presale
       block stays off for anything created here. */
    sales: {
      startsAt: toIso(draft.salesStartsAt),
      presaleEnabled: false,
    },
    resale: {
      enabled: draft.resaleEnabled,
      allowBids: draft.resaleAllowBids,
      maxMarkupPercent: draft.resaleMaxMarkupPercent,
      bidWindowHours: draft.resaleBidWindowHours,
    },
    status,
  };
};

export interface DraftIssue {
  /** Matches the form field key so the message can render beside its input. */
  field: string;
  message: string;
}

/**
 * Every problem on a step, not just whether it passes. Returning the issues
 * lets the form say what is wrong beside the field instead of silently
 * disabling Continue and leaving the organizer to guess.
 *
 * These mirror createEventSchema so the browser catches what the server would.
 */
export const getStepIssues = (
  draft: EventDraft,
  step: number,
): DraftIssue[] => {
  const issues: DraftIssue[] = [];

  if (step === 0) {
    const name = draft.name.trim();

    if (name.length === 0) {
      issues.push({ field: "name", message: "Give the event a name." });
    } else if (name.length < 2) {
      issues.push({ field: "name", message: "Needs at least 2 characters." });
    }
  }

  if (step === 1) {
    if (draft.location.address.trim().length < 2) {
      issues.push({
        field: "address",
        message: "Search a venue, use your location, or drop a pin.",
      });
    }

    if (
      !Number.isFinite(draft.location.latitude) ||
      !Number.isFinite(draft.location.longitude)
    ) {
      issues.push({
        field: "location",
        message: "Pick a point on the map so tickets can scan at the door.",
      });
    }
  }

  if (step === 2) {
    if (!draft.startsAt) {
      issues.push({ field: "startsAt", message: "Set when doors open." });
    }

    if (!draft.endsAt) {
      issues.push({ field: "endsAt", message: "Set when it ends." });
    }

    if (
      draft.startsAt &&
      draft.endsAt &&
      new Date(draft.endsAt) <= new Date(draft.startsAt)
    ) {
      issues.push({
        field: "endsAt",
        message: "The end time has to be after the start time.",
      });
    }

    if (draft.recurrenceType === "weekly" && draft.recurrenceDays.length === 0) {
      issues.push({
        field: "recurrenceDays",
        message: "Pick at least one day for a weekly event.",
      });
    }
  }

  if (step === 3) {
    draft.tiers.forEach((tier, index) => {
      if (tier.name.trim().length === 0) {
        issues.push({
          field: `tier.${index}.name`,
          message: "Name this tier.",
        });
      }

      if (!Number(tier.quantity)) {
        issues.push({
          field: `tier.${index}.quantity`,
          message: "How many tickets are in this tier?",
        });
      }
    });

    if (capacityOf(draft) === 0 && draft.tiers.length > 0) {
      issues.push({
        field: "capacity",
        message: "Total capacity cannot be zero.",
      });
    }

    if (draft.isPaid && !draft.tiers.some((tier) => (tier.priceNaira ?? 0) > 0)) {
      issues.push({
        field: "tier.0.priceNaira",
        message: "A paid event needs at least one tier priced above zero.",
      });
    }

    draft.tiers.forEach((tier, index) => {
      if (
        tier.availableFrom &&
        tier.availableUntil &&
        new Date(tier.availableUntil) <= new Date(tier.availableFrom)
      ) {
        issues.push({
          field: `tier.${index}.availableUntil`,
          message: `"${tier.name || `Tier ${index + 1}`}" must close after it opens.`,
        });
      }
    });

    /* Every tier opening later would mean nothing is ever on sale. */
    if (
      draft.tiers.length > 0 &&
      draft.tiers.every((tier) => Boolean(tier.availableFrom)) &&
      draft.startsAt &&
      draft.tiers.every(
        (tier) => new Date(tier.availableFrom as string) >= new Date(draft.startsAt),
      )
    ) {
      issues.push({
        field: "tierWindows",
        message:
          "Every tier opens at or after the event starts, so nothing would ever be on sale.",
      });
    }
  }

  return issues;
};

/** Which steps are complete enough to move past. */
export const validateStep = (draft: EventDraft, step: number) =>
  getStepIssues(draft, step).length === 0;
