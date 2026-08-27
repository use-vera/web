import { moneyService } from "@/lib/services/money.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useWallet = () =>
  useQuery({ queryKey: ["wallet"], queryFn: moneyService.getWallet });

export const useWalletTransactions = (page = 1, type = "all") =>
  useQuery({
    queryKey: ["wallet", "transactions", page, type],
    queryFn: () =>
      moneyService.listTransactions({
        page,
        limit: 20,
        ...(type === "all" ? {} : { type }),
      }),
  });

export const useBanks = () =>
  useQuery({
    queryKey: ["wallet", "banks"],
    queryFn: moneyService.listBanks,
    staleTime: 24 * 60 * 60 * 1000,
  });

export const usePayoutAccount = () =>
  useQuery({
    queryKey: ["wallet", "payout-account"],
    queryFn: moneyService.getPayoutAccount,
  });

export const usePreviewPayoutAccount = () =>
  useMutation({
    mutationFn: (payload: { bankCode: string; accountNumber: string }) =>
      moneyService.previewPayoutAccount(payload),
  });

export const useSavePayoutAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { bankCode: string; accountNumber: string }) =>
      moneyService.savePayoutAccount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
};

export const useRequestWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amountKobo: number) =>
      moneyService.requestWithdrawal(amountKobo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
};

export const useWithdrawals = (page = 1) =>
  useQuery({
    queryKey: ["wallet", "withdrawals", page],
    queryFn: () => moneyService.listWithdrawals({ page, limit: 10 }),
  });

export const useSubscription = () =>
  useQuery({
    queryKey: ["subscription"],
    queryFn: moneyService.getSubscription,
  });

export const useInitializePremium = () =>
  useMutation({
    mutationFn: (callbackUrl?: string) =>
      moneyService.initializePremium(callbackUrl),
  });

export const useVerifyPremium = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { reference?: string; paymentAttemptId?: string }) =>
      moneyService.verifyPremium(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
};

export const useRestorePremium = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => moneyService.restorePremium(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    },
  });
};

export const usePaymentAttempts = (page = 1, kind = "all") =>
  useQuery({
    queryKey: ["payments", "attempts", page, kind],
    queryFn: () =>
      moneyService.listPaymentAttempts({
        page,
        limit: 20,
        ...(kind === "all" ? {} : { kind }),
      }),
  });
