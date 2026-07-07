import { ticketService } from "@/lib/services/ticket.service";
import { type TicketPurchasePayload } from "@/lib/types/event";
import { useMutation } from "@tanstack/react-query";

export const useInitializeTicketPurchase = (eventId: string) =>
  useMutation({
    mutationFn: (payload: TicketPurchasePayload) =>
      ticketService.initializePurchase(eventId, payload),
  });

export const useVerifyTicketPayment = () =>
  useMutation({
    mutationFn: ({
      ticketId,
      reference,
    }: {
      ticketId: string;
      reference?: string;
    }) => ticketService.verifyPayment(ticketId, reference),
  });
