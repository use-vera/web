import { type PublicEventApi } from "@/lib/types/event";

/**
 * Wallet amounts are stored and returned in KOBO (backend: nairaToKobo =
 * naira * 100). Convert at the display boundary with koboToNaira — never
 * render a *Kobo field directly.
 */
export const koboToNaira = (kobo: number) => Math.round((kobo || 0) / 100);
export const nairaToKobo = (naira: number) => Math.round((naira || 0) * 100);

export interface OrganizerWalletApi {
  _id: string;
  organizerUserId: string;
  pendingBalanceKobo: number;
  availableBalanceKobo: number;
  reservedBalanceKobo: number;
  owingBalanceKobo: number;
  lifetimeGrossSalesKobo: number;
  lifetimePlatformFeesKobo: number;
  lifetimeWithdrawnKobo: number;
  lifetimeRefundedKobo: number;
  currency: "NGN";
  createdAt: string;
  updatedAt: string;
}

export type WalletTransactionType =
  | "ticket_sale"
  | "platform_fee"
  | "refund"
  | "chargeback"
  | "settlement"
  | "withdrawal"
  | "withdrawal_reversal"
  | "adjustment";

export interface WalletTransactionApi {
  _id: string;
  walletId: string;
  type: WalletTransactionType;
  amountKobo: number;
  bucket: "pending" | "available";
  status:
    | "pending_settlement"
    | "settled"
    | "reversed"
    | "completed"
    | "failed";
  settlementEligibleAt?: string | null;
  eventId?: string | Pick<PublicEventApi, "_id" | "name"> | null;
  ticketId?: string | { _id: string; ticketCode?: string } | null;
  description: string;
  createdAt: string;
}

export interface PayoutAccountApi {
  _id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  kycStatus: "unverified" | "pending" | "verified" | "rejected";
  verifiedAt?: string | null;
}

export interface PayoutAccountPreviewApi {
  accountName: string;
  bankName: string;
}

export interface NigerianBankApi {
  name: string;
  code: string;
}

export interface WithdrawalApi {
  _id: string;
  payoutAccountId: string;
  amountKobo: number;
  status: "reserved" | "processing" | "completed" | "failed" | "reversed";
  failureReason?: string;
  createdAt: string;
}

/* --- subscription --- */

export interface SubscriptionStateApi {
  subscriptionTier: "free" | "premium";
  subscriptionStatus: "inactive" | "active" | "expired";
  premiumActivatedAt?: string | null;
  premiumExpiresAt?: string | null;
  premiumPriceNaira: number;
}

export interface CheckoutSessionResponse {
  requiresPayment: boolean;
  payment: {
    reference: string;
    authorizationUrl: string;
    accessCode?: string;
  } | null;
  paymentAttemptId: string | null;
  kind: "ticket_purchase" | "ticket_resale_purchase" | "premium_subscription";
}

export interface PremiumCheckoutResponse extends CheckoutSessionResponse {
  subscription: SubscriptionStateApi;
}

/* --- payment attempts --- */

export type PaymentAttemptKind =
  | "ticket_purchase"
  | "ticket_resale_purchase"
  | "premium_subscription";

export type PaymentAttemptStatus =
  | "initialized"
  | "success"
  | "failed"
  | "abandoned"
  | "expired";

export interface PaymentAttemptApi {
  _id: string;
  reference: string;
  provider: "paystack";
  kind: PaymentAttemptKind;
  status: PaymentAttemptStatus;
  eventId?: string | Pick<PublicEventApi, "_id" | "name"> | null;
  currency: "NGN";
  amountKobo: number;
  fulfillmentStatus: "pending" | "done" | "failed";
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}
