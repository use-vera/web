import clientHttp from "@/lib/api/client-http";
import { type PaginatedResponse } from "@/lib/types/event";
import { type CheckoutSessionResponse } from "@/lib/types/money";
import {
  type CreateResalePayload,
  type EventTicketApi,
  type TicketResaleBidApi,
} from "@/lib/types/organizer";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export const resaleService = {
  listMarketplace: async (
    eventId: string,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<EventTicketApi>> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<PaginatedResponse<EventTicketApi>>>(
        `/events/${eventId}/resale-marketplace`,
        { params: query },
      ),
    ),

  listTicket: async (
    ticketId: string,
    payload: CreateResalePayload,
  ): Promise<EventTicketApi> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<EventTicketApi>>(
        `/tickets/${ticketId}/resale`,
        payload,
      ),
    ),

  cancelListing: async (ticketId: string): Promise<EventTicketApi> =>
    unwrap(
      await clientHttp.delete<ApiEnvelope<EventTicketApi>>(
        `/tickets/${ticketId}/resale`,
      ),
    ),

  listBids: async (
    ticketId: string,
  ): Promise<PaginatedResponse<TicketResaleBidApi>> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<PaginatedResponse<TicketResaleBidApi>>>(
        `/tickets/${ticketId}/resale-bids`,
      ),
    ),

  placeBid: async (
    ticketId: string,
    amountNaira: number,
  ): Promise<TicketResaleBidApi> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<TicketResaleBidApi>>(
        `/tickets/${ticketId}/resale-bids`,
        { amountNaira },
      ),
    ),

  respondToBid: async (
    ticketId: string,
    bidId: string,
    action: "accept" | "reject",
  ): Promise<TicketResaleBidApi> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<TicketResaleBidApi>>(
        `/tickets/${ticketId}/resale-bids/${bidId}/${action}`,
        {},
      ),
    ),

  initializePurchase: async (
    ticketId: string,
    callbackUrl?: string,
  ): Promise<CheckoutSessionResponse> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<CheckoutSessionResponse>>(
        `/tickets/${ticketId}/resale-purchase/initialize`,
        { callbackUrl },
      ),
    ),

  verifyPurchase: async (
    ticketId: string,
    payload: { reference?: string; paymentAttemptId?: string },
  ): Promise<{ ticket: EventTicketApi }> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<{ ticket: EventTicketApi }>>(
        `/tickets/${ticketId}/resale-purchase/verify`,
        payload,
      ),
    ),
};
