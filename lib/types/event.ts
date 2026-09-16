export interface EventOrganizerSummary {
  _id: string;
  fullName: string;
  avatarUrl?: string;
  title?: string;
  verificationBadge?: string;
}

export interface EventCenterSummary {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  verified?: boolean;
  successfulEventsCount?: number;
  usageCount?: number;
  verifiedAt?: string | null;
}

export interface EventTicketCategoryApi {
  _id: string;
  name: string;
  description?: string;
  priceNaira: number;
  quantity: number;
  /** Per-tier sale window. Null on a side means no bound. */
  availableFrom?: string | null;
  availableUntil?: string | null;
  /** Derived server-side so clients don't re-implement the window rules. */
  onSale?: boolean;
  availabilityState?: "open" | "upcoming" | "closed";
  /** Null on list responses, which do not pay for the per-tier aggregate. */
  soldCount?: number | null;
  remaining?: number | null;
  soldOut?: boolean | null;
}

export interface CategoryApi {
  _id: string;
  name: string;
  slug: string;
  iconKey: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export interface EventSalesPolicyApi {
  startsAt: string | null;
  presaleEnabled: boolean;
  presaleStartsAt: string | null;
  presaleEndsAt: string | null;
  presaleQuantity: number;
  presalePriceNaira: number;
}

export interface PublicEventApi {
  _id: string;
  organizerUserId: EventOrganizerSummary | string;
  eventCenterId?: EventCenterSummary | string | null;
  categoryIds?: (string | CategoryApi)[];
  name: string;
  description: string;
  imageUrl?: string;
  address: string;
  state?: string;
  status?: "draft" | "published" | "cancelled";
  startsAt: string;
  endsAt: string;
  timezone: string;
  isPaid: boolean;
  ticketPriceNaira: number;
  currentTicketPriceNaira?: number;
  currency: "NGN";
  expectedTickets: number;
  ticketCategories?: EventTicketCategoryApi[];
  addOns?: EventAddOnApi[];
  salePhase?: "upcoming" | "presale" | "main";
  sales?: EventSalesPolicyApi;
  nextOccurrenceAt: string;
  nextOccurrenceEndsAt: string;
  soldTickets: number;
  remainingTickets: number;
  averageRating: number;
  ratingsCount: number;
  organizerBadge?: {
    verified: boolean;
    tier: "trusted" | "elite" | null;
  } | null;
  /* The detail endpoint spreads the whole event document, so these come
     through on a single event even though the list projection is thinner. */
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number;
  eventCenter?: EventCenterSummary | null;
  friendsGoingCount?: number;
  recurrence?: {
    type: "none" | "weekly" | "monthly-day" | "monthly-weekday";
    interval?: number;
    daysOfWeek?: number[];
    endsOn?: string | null;
  };
  resale?: {
    enabled: boolean;
    allowBids: boolean;
    maxMarkupPercent: number;
    bidWindowHours: number;
  };
}

export interface EventRatingApi {
  _id: string;
  eventId: string;
  userId: EventOrganizerSummary | string;
  rating: number;
  review?: string;
  createdAt: string;
}

export interface PublicEventDetailsResponse {
  event: PublicEventApi;
  ratings: {
    averageRating: number;
    ratingsCount: number;
    items: EventRatingApi[];
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface EventListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: "dateAsc" | "newest";
  filter?: "upcoming" | "this-week" | "this-month" | "all";
  ticketType?: "all" | "free" | "paid";
  country?: string;
  category?: string;
  nearLat?: number;
  nearLng?: number;
  nearRadiusKm?: number;
  from?: string;
  to?: string;
}

export interface EventCountryApi {
  country: string;
  count: number;
}

/** One option on an add-on, with the stock a merch desk actually needs. */
export interface EventAddOnVariantApi {
  name: string;
  released: number;
  remaining: number;
  soldOut: boolean;
}

export interface EventAddOnApi {
  _id: string;
  name: string;
  description?: string;
  priceNaira: number;
  /** Decides which staff surface hands it over. */
  redemption: "door" | "desk" | "none";
  location?: string;
  maxPerTicket: number;
  transfersOnResale: boolean;
  /** Live counts, present on a single event's detail response. */
  variants?: EventAddOnVariantApi[];
  remaining?: number;
  soldOut?: boolean;
}

/** One add-on a ticket holds, and how much is still to collect. */
export interface EventAddOnPurchaseApi {
  _id: string;
  ticketId: string;
  addOnId: string;
  name: string;
  variantName?: string;
  redemption: "door" | "desk" | "none";
  location?: string;
  unitPriceNaira: number;
  quantity: number;
  redeemedQuantity: number;
  status: "pending" | "paid" | "redeemed" | "cancelled" | "refunded";
  redeemedAt?: string | null;
}

export interface SelectedAddOnPayload {
  addOnId: string;
  variantName?: string;
  quantity: number;
}

/** One tier a held ticket could move up to. */
export interface TicketUpgradeOptionApi {
  _id: string;
  name: string;
  priceNaira: number;
  isCurrent: boolean;
  remaining: number;
  soldOut: boolean;
  onSale: boolean;
  /** Already multiplied by the ticket's quantity. */
  differenceNaira: number;
  upgradable: boolean;
}

export interface TicketUpgradeOptionsApi {
  ticketId: string;
  quantity: number;
  paidNaira: number;
  currentTierName: string;
  options: TicketUpgradeOptionApi[];
}

export interface TicketPurchasePayload {
  quantity?: number;
  ticketCategoryId?: string;
  email?: string;
  attendeeName?: string;
  callbackUrl?: string;
  addOns?: SelectedAddOnPayload[];
}

export interface TicketPurchaseResponse {
  requiresPayment: boolean;
  ticket: {
    _id: string;
    ticketCode: string;
    barcodeValue: string;
    status: "pending" | "paid" | "cancelled" | "used" | "expired";
  };
  // Every ticket created in this purchase (quantity > 1 issues one row.
  // And one distinct scannable code. Per seat, not one row with a
  // quantity field). Combined with purchaseBatchId, lets the UI fetch and
  // show every code, not just this primary one.
  ticketIds: string[];
  purchaseBatchId: string | null;
  payment: {
    reference: string;
    authorizationUrl: string;
    accessCode: string;
  } | null;
  pricingBreakdown: {
    basePriceNaira: number;
    veraFeeNaira: number;
    totalCheckoutNaira: number;
    organizerNetNaira: number;
    platformFeePercent: number;
    feeMode: "absorbed_by_organizer" | "passed_to_attendee";
  };
}

export interface VerifyTicketResponse {
  ticket: {
    _id: string;
    ticketCode: string;
    barcodeValue: string;
    status: "pending" | "paid" | "cancelled" | "used" | "expired";
  };
  paymentStatus: string;
  alreadyVerified: boolean;
  purchaseBatchId: string | null;
}

export interface TicketEventSummaryApi {
  _id: string;
  organizerUserId: EventOrganizerSummary | string;
  name: string;
  imageUrl?: string;
  address: string;
  state?: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
  isPaid: boolean;
  ticketPriceNaira: number;
  currency: "NGN";
  nextOccurrenceAt: string;
  nextOccurrenceEndsAt: string;
}

export interface MyTicketApi {
  _id: string;
  eventId: TicketEventSummaryApi | string;
  quantity: number;
  /** A plain id: this ref is never populated on the tickets endpoint. */
  ticketCategoryId?: string | null;
  addOns?: EventAddOnPurchaseApi[];
  addOnSummary?: { count: number; quantity: number; outstanding: number } | null;
  ticketCategoryName?: string;
  unitPriceNaira: number;
  totalPriceNaira: number;
  currency: "NGN";
  status: "pending" | "paid" | "cancelled" | "used" | "expired" | "refunded";
  attendeeName: string;
  attendeeEmail: string;
  ticketCode: string;
  barcodeValue: string;
  paidAt?: string | null;
  usedAt?: string | null;
  cancelledAt?: string | null;
  /* Resale fields. /events/tickets/me returns whole ticket documents, so
     these are present on a ticket the owner has listed. */
  resaleStatus?: "none" | "listed" | "offer-accepted";
  resalePriceNaira?: number | null;
  resaleQuantity?: number | null;
  resaleAllowBids?: boolean;
  openBidsCount?: number;
  highestBidNaira?: number;
  createdAt: string;
}

export interface MyTicketsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?:
    | "all"
    | "pending"
    | "paid"
    | "cancelled"
    | "used"
    | "expired"
    | "refunded";
  purchaseBatchId?: string;
}
