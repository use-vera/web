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
  priceNaira: number;
  quantity: number;
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

export interface TicketPurchasePayload {
  quantity?: number;
  ticketCategoryId?: string;
  email?: string;
  attendeeName?: string;
  callbackUrl?: string;
}

export interface TicketPurchaseResponse {
  requiresPayment: boolean;
  ticket: {
    _id: string;
    ticketCode: string;
    barcodeValue: string;
    status: "pending" | "paid" | "cancelled" | "used" | "expired";
  };
  // Every ticket created in this purchase (quantity > 1 issues one row —
  // and one distinct scannable code — per seat, not one row with a
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
  ticketCategoryName?: string;
  unitPriceNaira: number;
  totalPriceNaira: number;
  currency: "NGN";
  status: "pending" | "paid" | "cancelled" | "used" | "expired";
  attendeeName: string;
  attendeeEmail: string;
  ticketCode: string;
  barcodeValue: string;
  paidAt?: string | null;
  usedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
}

export interface MyTicketsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "pending" | "paid" | "cancelled" | "used" | "expired";
  purchaseBatchId?: string;
}
