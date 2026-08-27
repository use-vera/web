import clientHttp from "@/lib/api/client-http";
import { type PaginatedResponse } from "@/lib/types/event";
import {
  type NigerianBankApi,
  type OrganizerWalletApi,
  type PayoutAccountApi,
  type PayoutAccountPreviewApi,
  type PaymentAttemptApi,
  type PremiumCheckoutResponse,
  type SubscriptionStateApi,
  type WalletTransactionApi,
  type WithdrawalApi,
} from "@/lib/types/money";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export const moneyService = {
  /* --- wallet --- */

  getWallet: async (): Promise<OrganizerWalletApi> =>
    unwrap(await clientHttp.get<ApiEnvelope<OrganizerWalletApi>>("/wallet")),

  listTransactions: async (query: {
    page?: number;
    limit?: number;
    type?: string;
  }): Promise<PaginatedResponse<WalletTransactionApi>> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<PaginatedResponse<WalletTransactionApi>>>(
        "/wallet/transactions",
        { params: query },
      ),
    ),

  listBanks: async (): Promise<NigerianBankApi[]> =>
    unwrap(await clientHttp.get<ApiEnvelope<NigerianBankApi[]>>("/wallet/banks")),

  getPayoutAccount: async (): Promise<PayoutAccountApi | null> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<PayoutAccountApi | null>>(
        "/wallet/payout-account",
      ),
    ),

  previewPayoutAccount: async (payload: {
    bankCode: string;
    accountNumber: string;
  }): Promise<PayoutAccountPreviewApi> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<PayoutAccountPreviewApi>>(
        "/wallet/payout-account/preview",
        payload,
      ),
    ),

  savePayoutAccount: async (payload: {
    bankCode: string;
    accountNumber: string;
  }): Promise<PayoutAccountApi> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<PayoutAccountApi>>(
        "/wallet/payout-account",
        payload,
      ),
    ),

  requestWithdrawal: async (amountKobo: number): Promise<WithdrawalApi> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<WithdrawalApi>>("/wallet/withdrawals", {
        amountKobo,
      }),
    ),

  listWithdrawals: async (query: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<WithdrawalApi>> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<PaginatedResponse<WithdrawalApi>>>(
        "/wallet/withdrawals",
        { params: query },
      ),
    ),

  /* --- premium --- */

  getSubscription: async (): Promise<SubscriptionStateApi> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<SubscriptionStateApi>>("/subscription"),
    ),

  initializePremium: async (
    callbackUrl?: string,
  ): Promise<PremiumCheckoutResponse> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<PremiumCheckoutResponse>>(
        "/subscription/initialize",
        { callbackUrl },
      ),
    ),

  verifyPremium: async (payload: {
    reference?: string;
    paymentAttemptId?: string;
  }): Promise<{ subscription: SubscriptionStateApi }> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<{ subscription: SubscriptionStateApi }>>(
        "/subscription/verify",
        payload,
      ),
    ),

  restorePremium: async (): Promise<SubscriptionStateApi> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<SubscriptionStateApi>>(
        "/subscription/restore",
        {},
      ),
    ),

  /* --- payment attempts --- */

  listPaymentAttempts: async (query: {
    page?: number;
    limit?: number;
    kind?: string;
  }): Promise<PaginatedResponse<PaymentAttemptApi>> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<PaginatedResponse<PaymentAttemptApi>>>(
        "/payments/attempts",
        { params: query },
      ),
    ),
};
