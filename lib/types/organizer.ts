import {
  type EventRatingApi,
  type PaginatedResponse,
  type PublicEventApi,
} from "@/lib/types/event";
import { type AuthUser } from "@/lib/types/auth";

/**
 * Organizer-side shapes. These mirror the real backend contracts the mobile
 * app already consumes (see shared/services/types.ts) rather than a
 * web-specific reinterpretation of them. The same endpoints serve both.
 */

export type OrganizerEventApi = PublicEventApi;

export interface OrganizerEventDetails {
  event: OrganizerEventApi;
  ratings: {
    averageRating: number;
    ratingsCount: number;
    items: EventRatingApi[];
  };
}

export type EventStatusFilter = "all" | "draft" | "published" | "cancelled";

export interface MyEventsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: EventStatusFilter;
}

export type TicketStatus =
  | "pending"
  | "paid"
  | "cancelled"
  | "used"
  | "expired"
  | "refunded";

export type TicketStatusFilter = "all" | TicketStatus;

export interface EventTicketsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatusFilter;
}

export interface EventTicketApi {
  _id: string;
  eventId: string | OrganizerEventApi;
  organizerUserId: string | AuthUser;
  buyerUserId: string | AuthUser;
  quantity: number;
  ticketCategoryId?: string | null;
  ticketCategoryName?: string;
  unitPriceNaira: number;
  totalPriceNaira: number;
  currency: "NGN";
  status: TicketStatus;
  paymentProvider: "none" | "paystack";
  paymentReference?: string | null;
  attendeeName: string;
  attendeeEmail: string;
  ticketCode: string;
  barcodeValue: string;
  paidAt?: string | null;
  usedAt?: string | null;
  cancelledAt?: string | null;
  resaleStatus?: "none" | "listed" | "offer-accepted";
  resalePriceNaira?: number | null;
  resaleQuantity?: number | null;
  resaleAllowBids?: boolean;
  resaleListedAt?: string | null;
  acceptedBidExpiresAt?: string | null;
  openBidsCount?: number;
  highestBidNaira?: number;
  myBid?: {
    amountNaira: number;
    status: "open" | "accepted" | "rejected" | "expired" | "paid" | "withdrawn";
    expiresAt?: string | null;
  } | null;
  lastTransferredAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/* --- exports --- */

export type ExportKind = "tickets" | "attendees" | "finance";
export type ExportFormat = "csv" | "json";

export interface EventExportSummaryApi {
  totalTicketsSold: number;
  totalAttendeesCheckedIn: number;
  freeTickets: number;
  paidTickets: number;
  grossRevenueNaira: number;
  checkInRate: number;
  topTicketType: string;
}

export interface EventExportApi {
  _id: string;
  eventId: string | OrganizerEventApi;
  kind: ExportKind;
  format: ExportFormat;
  status: "ready" | "failed";
  fileName: string;
  mimeType: string;
  rowCount: number;
  generatedAt: string;
  dateRangeFrom?: string | null;
  dateRangeTo?: string | null;
  columns?: string[];
  previewRows?: Array<Record<string, unknown>>;
  summary?: EventExportSummaryApi;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventExportPreviewApi {
  _id: string;
  fileName: string;
  format: ExportFormat;
  mimeType: string;
  rowCount: number;
  generatedAt: string;
  columns: string[];
  previewRows: Array<Record<string, unknown>>;
  summary: EventExportSummaryApi;
}

export interface CreateEventExportPayload {
  kind: ExportKind;
  format?: ExportFormat;
  from?: string;
  to?: string;
}

/* --- ratings / insights --- */

export interface EventRatingsResponse extends PaginatedResponse<EventRatingApi> {
  averageRating: number;
  ratingsCount: number;
  myRating: { rating: number; review?: string; updatedAt: string } | null;
}

/* --- featuring (promote) --- */

export interface FeatureAvailabilityDay {
  date: string;
  reserved: number;
  remaining: number;
}

export interface FeatureAvailabilityResponse {
  availability: FeatureAvailabilityDay[];
  allAvailable: boolean;
  feePerDayNaira: number;
  totalNaira: number;
}

export interface InitializeEventFeatureResponse {
  requiresPayment: boolean;
  payment: {
    reference: string;
    authorizationUrl: string;
    accessCode: string;
  } | null;
  paymentAttemptId: string | null;
  dates: string[];
  feePerDayNaira: number;
  totalNaira: number;
  slotIds: string[];
}

/* --- door check-in --- */

export interface TicketCheckInPayload {
  code: string;
  eventId?: string;
  override?: boolean;
}

export interface TicketCheckInResponse {
  ticket: EventTicketApi;
  alreadyUsed: boolean;
  checkedInAt?: string | null;
}

/* --- create / cancel --- */

export interface EventTicketCategoryPayload {
  name: string;
  description?: string;
  quantity: number;
  priceNaira?: number;
  /** Empty string means "no bound". Converted to null on the way out. */
  availableFrom?: string | null;
  availableUntil?: string | null;
}

export interface EventRecurrencePayload {
  type: "none" | "weekly" | "monthly-day" | "monthly-weekday";
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endsOn?: string;
}

export interface EventSalesPayload {
  startsAt?: string | null;
  presaleEnabled?: boolean;
  presaleStartsAt?: string | null;
  presaleEndsAt?: string | null;
  presaleQuantity?: number;
  presalePriceNaira?: number;
}

export interface EventCenterSuggestion {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  verified?: boolean;
  usageCount?: number;
  successfulEventsCount?: number;
}

export interface GeocodeResult {
  label: string;
  name: string;
  latitude: number;
  longitude: number;
  state: string;
  country: string;
}

export interface UploadedAsset {
  url: string;
  publicId?: string;
  resourceType?: string;
}

export interface CreateEventPayload {
  name: string;
  description?: string;
  imageUrl?: string;
  address: string;
  state?: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters?: number;
  categoryIds?: string[];
  startsAt: string;
  endsAt: string;
  timezone?: string;
  isPaid?: boolean;
  feeMode?: "absorbed_by_organizer" | "passed_to_attendee";
  ticketPriceNaira?: number;
  expectedTickets: number;
  ticketCategories?: EventTicketCategoryPayload[];
  resale?: {
    enabled: boolean;
    allowBids: boolean;
    maxMarkupPercent: number;
    bidWindowHours: number;
  };
  recurrence?: EventRecurrencePayload;
  sales?: EventSalesPayload;
  eventCenterId?: string;
  status?: "draft" | "published";
}

export interface CancelEventResponse {
  event: OrganizerEventApi;
  affectedTicketCount: number;
  totalRefundNaira: number;
}

/* --- resale --- */

export interface TicketResaleBidApi {
  _id: string;
  ticketId: string;
  eventId: string;
  sellerUserId: string | AuthUser;
  bidderUserId: string | AuthUser;
  amountNaira: number;
  status: "open" | "accepted" | "rejected" | "expired" | "paid" | "withdrawn";
  respondedAt?: string | null;
  expiresAt?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface CreateResalePayload {
  priceNaira: number;
  quantity?: number;
  allowBids?: boolean;
}
