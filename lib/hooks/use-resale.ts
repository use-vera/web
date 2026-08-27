import { resaleService } from "@/lib/services/resale.service";
import { type CreateResalePayload } from "@/lib/types/organizer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useResaleMarketplace = (eventId: string, page = 1) =>
  useQuery({
    queryKey: ["resale", "marketplace", eventId, page],
    queryFn: () => resaleService.listMarketplace(eventId, { page, limit: 20 }),
    enabled: Boolean(eventId),
  });

export const useListTicketForResale = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateResalePayload) =>
      resaleService.listTicket(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["resale"] });
    },
  });
};

export const useCancelResaleListing = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => resaleService.cancelListing(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["resale"] });
    },
  });
};

export const useResaleBids = (ticketId: string, enabled = true) =>
  useQuery({
    queryKey: ["resale", "bids", ticketId],
    queryFn: () => resaleService.listBids(ticketId),
    enabled: Boolean(ticketId) && enabled,
  });

export const usePlaceBid = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (amountNaira: number) =>
      resaleService.placeBid(ticketId, amountNaira),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resale"] });
    },
  });
};

export const useRespondToBid = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bidId,
      action,
    }: {
      bidId: string;
      action: "accept" | "reject";
    }) => resaleService.respondToBid(ticketId, bidId, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resale"] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useInitializeResalePurchase = () =>
  useMutation({
    mutationFn: ({
      ticketId,
      callbackUrl,
    }: {
      ticketId: string;
      callbackUrl?: string;
    }) => resaleService.initializePurchase(ticketId, callbackUrl),
  });

export const useVerifyResalePurchase = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      reference,
      paymentAttemptId,
    }: {
      ticketId: string;
      reference?: string;
      paymentAttemptId?: string;
    }) =>
      resaleService.verifyPurchase(ticketId, { reference, paymentAttemptId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["resale"] });
    },
  });
};
