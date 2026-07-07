import clientHttp from "@/lib/api/client-http";
import {
  type EventListQuery,
  type PaginatedResponse,
  type PublicEventApi,
  type PublicEventDetailsResponse,
} from "@/lib/types/event";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const eventService = {
  listEvents: async (
    query: EventListQuery,
  ): Promise<PaginatedResponse<PublicEventApi>> => {
    const response = await clientHttp.get<ApiEnvelope<PaginatedResponse<PublicEventApi>>>(
      "/events",
      { params: query },
    );

    return response.data.data;
  },

  getEventById: async (eventId: string): Promise<PublicEventDetailsResponse> => {
    const response = await clientHttp.get<ApiEnvelope<PublicEventDetailsResponse>>(
      `/events/${eventId}`,
    );

    return response.data.data;
  },
};
