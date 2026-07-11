import { ticketService } from "@/lib/services/ticket.service";
import { type MyTicketsQuery, type TicketPurchasePayload } from "@/lib/types/event";
import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

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

/**
 * Paginated (not capped at a single page like useMyTickets) — accumulates
 * pages via TanStack Query's own cache rather than a manual
 * useEffect+setState merge, since this repo's lint rules disallow setting
 * state synchronously inside an effect.
 */
export const useMyTicketsInfinite = (
  query?: Omit<MyTicketsQuery, "page">,
) => {
  const limit = query?.limit ?? 20;
  const search = query?.search ?? "";
  const status = query?.status ?? "all";

  return useInfiniteQuery({
    queryKey: ["tickets", "mine", "infinite", { limit, search, status }],
    queryFn: ({ pageParam }) =>
      ticketService.listMyTickets({ page: pageParam, limit, search, status }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
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
