/** Vera's fixed list, as the API sends it. Labels come from the server too. */
export type VendorCategoryKey =
  | "food"
  | "drinks"
  | "snacks"
  | "desserts"
  | "clothing_merch"
  | "accessories"
  | "beauty_grooming"
  | "art_crafts"
  | "services"
  | "other";

export interface VendorCategory {
  key: VendorCategoryKey;
  label: string;
}

/** The vendor's own heading on their menu, not Vera's category. */
export interface VendorSection {
  _id: string;
  name: string;
  position: number;
}

export interface Vendor {
  _id: string;
  ownerUserId: string;
  businessName: string;
  slug: string;
  logoUrl: string;
  categories: VendorCategoryKey[];
  categoryLabels: string[];
  city: string;
  contactPhone: string;
  sections: VendorSection[];
  verificationLevel: VendorVerificationLevel;
  verification: {
    status: "none" | "pending" | "verified" | "rejected";
    bvnLast4: string;
    cacNumber: string;
    reviewNote: string;
    submittedAt: string | null;
  };
  payoutReady: boolean;
  status: "active" | "suspended";
  averageRating: number;
  ratingsCount: number;
  eventsWorkedCount: number;
  createdAt: string;
}

export type VendorVerificationLevel = "starter" | "verified" | "registered";

export interface VendorLimits {
  verificationLevel: VendorVerificationLevel;
  verification: Vendor["verification"];
  soldNaira: number;
  limitNaira: number | null;
  remainingNaira: number | null;
  next: { level: VendorVerificationLevel; needs: string } | null;
}

export interface VendorItem {
  _id: string;
  vendorId: string;
  name: string;
  description: string;
  imageUrl: string;
  priceNaira: number;
  category: VendorCategoryKey;
  categoryLabel: string;
  sectionId: string | null;
  position: number;
  available: boolean;
  ageRestricted: boolean;
  stock: number | null;
}

/** A menu already grouped the way it is shown. */
export interface VendorMenuSection {
  _id: string | null;
  name: string;
  items: VendorItem[];
}

export interface VendorMenu {
  vendor: Vendor;
  sections: VendorMenuSection[];
  itemCount: number;
}

export interface CreateVendorPayload {
  businessName: string;
  categories: VendorCategoryKey[];
  logoUrl?: string;
  city?: string;
  contactPhone?: string;
}

export type UpdateVendorPayload = Partial<CreateVendorPayload>;

export interface CreateVendorItemPayload {
  name: string;
  category: VendorCategoryKey;
  priceNaira: number;
  description?: string;
  imageUrl?: string;
  sectionId?: string | null;
  available?: boolean;
  ageRestricted?: boolean;
  stock?: number | null;
}

export type UpdateVendorItemPayload = Partial<CreateVendorItemPayload>;

/* ---------------------------------------------------------------- bookings */

export type BookingStatus =
  | "invited"
  | "applied"
  | "confirmed"
  | "declined"
  | "rejected"
  | "cancelled";

export interface BookingTerms {
  stallFeeNaira: number;
  stallLabel: string;
  setupFrom: string | null;
}

export interface VendorSummary {
  _id: string;
  businessName: string;
  slug: string;
  logoUrl: string;
  categories: VendorCategoryKey[];
  averageRating: number;
  ratingsCount: number;
  eventsWorkedCount: number;
}

export interface BookingEventSummary {
  _id: string;
  name: string;
  startsAt: string;
  address: string;
  imageUrl: string;
}

export interface VendorBooking {
  _id: string;
  eventId: string;
  vendorId: string;
  status: BookingStatus;
  origin: "invite" | "application";
  terms: BookingTerms;
  message: string;
  responseNote: string;
  respondedAt: string | null;
  stallFeePaid: boolean;
  /** When an unpaid hold on this spot runs out. Null once paid, or if free. */
  stallFeeDueAt: string | null;
  acceptingOrders: boolean;
  prepMinutes: number | null;
  createdAt: string;
  event?: BookingEventSummary;
  vendor?: VendorSummary;
}

/** Accepting a stall with a fee starts a payment, not a confirmation. */
export interface RespondToInviteResult {
  requiresPayment: boolean;
  booking: VendorBooking;
  payment: {
    reference: string;
    authorizationUrl: string;
    accessCode: string;
  } | null;
}

export interface EventVendorSettings {
  acceptingApplications: boolean;
  /* All an organizer charges a vendor. There is no share of sales on top. */
  stallFeeNaira: number;
  spots: number;
  setupFrom: string | null;
}

export interface EventVendorsResponse {
  vendorSettings: EventVendorSettings;
  items: VendorBooking[];
  counts: { confirmed: number; invited: number; applied: number };
}

export interface OpenEventForVendor {
  _id: string;
  name: string;
  startsAt: string;
  address: string;
  imageUrl: string;
  vendorSettings: EventVendorSettings;
}

/* ------------------------------------------------------------------ orders */

export type VendorOrderStatus =
  | "pending_payment"
  | "paid"
  | "preparing"
  | "ready"
  | "collected"
  | "cancelled"
  | "refunded";

export interface VendorOrderLine {
  itemId: string;
  name: string;
  unitPriceNaira: number;
  quantity: number;
  lineTotalNaira: number;
}

export interface VendorOrder {
  _id: string;
  eventId: string;
  vendorId: string;
  buyerUserId: string;
  pickupCode: string;
  status: VendorOrderStatus;
  lines: VendorOrderLine[];
  note: string;
  pricing: {
    subtotalNaira: number;
    serviceFeeNaira: number;
    totalChargedNaira: number;
    veraFeeNaira: number;
    vendorNetNaira: number;
  };
  paidAt: string | null;
  readyAt: string | null;
  collectedAt: string | null;
  cancelReason: string;
  createdAt: string;
  event?: { _id: string; name: string; startsAt: string };
  vendor?: { _id: string; businessName: string; logoUrl: string; slug: string };
}

export interface VendorOrderQueue {
  items: VendorOrder[];
  counts: { paid: number; preparing: number; ready: number };
}

export interface VendorServiceState {
  bookingId: string;
  acceptingOrders: boolean;
  prepMinutes: number | null;
}
