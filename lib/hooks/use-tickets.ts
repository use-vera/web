import { ticketService } from "@/lib/services/ticket.service";
import { type MyTicketsQuery, type TicketPurchasePayload } from "@/lib/types/event";
import { useMutation, useQuery } from "@tanstack/react-query";

const normalizeMyTicketsQuery = (query?: MyTicketsQuery) => ({
  page: query?.page ?? 1,
  limit: query?.limit ?? 50,
  search: query?.search ?? "",
  status: query?.status ?? "all",
});

export const useMyTickets = (query?: MyTicketsQuery) => {
  const normalized = normalizeMyTicketsQuery(query);

  return useQuery({
    queryKey: ["tickets", "mine", normalized],
    queryFn: () => ticketService.listMyTickets(normalized),
  });
};

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
