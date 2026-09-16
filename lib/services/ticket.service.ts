import clientHttp from "@/lib/api/client-http";
import {
  type MyTicketApi,
  type MyTicketsQuery,
  type PaginatedResponse,
  type TicketPurchasePayload,
  type TicketUpgradeOptionsApi,
  type TicketPurchaseResponse,
  type VerifyTicketResponse,
} from "@/lib/types/event";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const ticketService = {
  initializePurchase: async (
    eventId: string,
    payload: TicketPurchasePayload,
  ): Promise<TicketPurchaseResponse> => {
    const response = await clientHttp.post<ApiEnvelope<TicketPurchaseResponse>>(
      `/events/${eventId}/tickets/initialize`,
      payload,
    );

    return response.data.data;
  },

  verifyPayment: async (
    ticketId: string,
    reference?: string,
  ): Promise<VerifyTicketResponse> => {
    const response = await clientHttp.post<ApiEnvelope<VerifyTicketResponse>>(
      `/tickets/${ticketId}/verify`,
      { reference },
    );

    return response.data.data;
  },

  getUpgradeOptions: async (
    ticketId: string,
  ): Promise<TicketUpgradeOptionsApi> => {
    const response = await clientHttp.get<ApiEnvelope<TicketUpgradeOptionsApi>>(
      `/tickets/${ticketId}/upgrade-options`,
    );

    return response.data.data;
  },
  initializeUpgrade: async (
    ticketId: string,
    payload: { ticketCategoryId: string; callbackUrl?: string },
  ): Promise<TicketPurchaseResponse> => {
    const response = await clientHttp.post<ApiEnvelope<TicketPurchaseResponse>>(
      `/tickets/${ticketId}/upgrade/initialize`,
      payload,
    );

    return response.data.data;
  },
  listMyTickets: async (
    query: MyTicketsQuery,
  ): Promise<PaginatedResponse<MyTicketApi>> => {
    const response = await clientHttp.get<ApiEnvelope<PaginatedResponse<MyTicketApi>>>(
      "/tickets",
      { params: query },
    );

    return response.data.data;
  },
};
