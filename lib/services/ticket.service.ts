import clientHttp from "@/lib/api/client-http";
import {
  type TicketPurchasePayload,
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
};
