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
  presaleEnabled: boolean;
  presaleStartsAt: string;
  presaleEndsAt: string;
  presaleQuantity: string;
  presalePriceNaira: string;
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

const toIso = (local: string) => (local ? new Date(local).toISOString() : null);

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
    ticketCategories: draft.tiers.map((tier) => ({
      name: tier.name.trim(),
      quantity: Number(tier.quantity) || 0,
      priceNaira: draft.isPaid ? Number(tier.priceNaira) || 0 : 0,
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
    sales: {
      startsAt: toIso(draft.salesStartsAt),
      presaleEnabled: draft.presaleEnabled,
      presaleStartsAt: draft.presaleEnabled
        ? toIso(draft.presaleStartsAt)
        : null,
      presaleEndsAt: draft.presaleEnabled ? toIso(draft.presaleEndsAt) : null,
      ...(draft.presaleEnabled && draft.presaleQuantity
        ? { presaleQuantity: Number(draft.presaleQuantity) }
        : {}),
      ...(draft.presaleEnabled && draft.presalePriceNaira
        ? { presalePriceNaira: Number(draft.presalePriceNaira) }
        : {}),
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

/** Which steps are complete enough to move past. */
export const validateStep = (draft: EventDraft, step: number) => {
  if (step === 0) {
    return draft.name.trim().length >= 2;
  }

  if (step === 1) {
    return (
      draft.location.address.trim().length >= 2 &&
      Number.isFinite(draft.location.latitude) &&
      Number.isFinite(draft.location.longitude)
    );
  }

  if (step === 2) {
    if (!draft.startsAt || !draft.endsAt) {
      return false;
    }

    if (new Date(draft.endsAt) <= new Date(draft.startsAt)) {
      return false;
    }

    return !(draft.recurrenceType === "weekly" && draft.recurrenceDays.length === 0);
  }

  if (step === 3) {
    return (
      capacityOf(draft) > 0 &&
      draft.tiers.every((tier) => tier.name.trim().length >= 1) &&
      (!draft.isPaid || draft.tiers.some((tier) => (tier.priceNaira ?? 0) > 0))
    );
  }

  return true;
};
