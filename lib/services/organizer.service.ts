import clientHttp from "@/lib/api/client-http";
import { type PaginatedResponse } from "@/lib/types/event";
import {
  type CancelEventResponse,
  type CreateEventExportPayload,
  type CreateEventPayload,
  type EventCenterSuggestion,
  type GeocodeResult,
  type UploadedAsset,
  type EventExportApi,
  type EventExportPreviewApi,
  type EventRatingsResponse,
  type EventTicketApi,
  type EventTicketsQuery,
  type FeatureAvailabilityResponse,
  type InitializeEventFeatureResponse,
  type MyEventsQuery,
  type OrganizerEventApi,
  type OrganizerEventDetails,
  type TicketCheckInPayload,
  type TicketCheckInResponse,
} from "@/lib/types/organizer";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => response.data.data;

export const organizerService = {
  /* --- events --- */

  listMyEvents: async (
    query: MyEventsQuery,
  ): Promise<PaginatedResponse<OrganizerEventApi>> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<PaginatedResponse<OrganizerEventApi>>>(
        "/organizer/events",
        { params: query },
      ),
    ),

  /**
   * The organizer's own view of one event. Goes through the authenticated
   * route rather than the public one so drafts and cancelled events, which
   * the public endpoint hides. Still resolve for their owner.
   */
  getEvent: async (eventId: string): Promise<OrganizerEventDetails> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<OrganizerEventDetails>>(
        `/organizer/events/${eventId}`,
      ),
    ),

  createEvent: async (payload: CreateEventPayload): Promise<OrganizerEventApi> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<OrganizerEventApi>>(
        "/organizer/events",
        payload,
      ),
    ),

  updateEvent: async (
    eventId: string,
    payload: Partial<CreateEventPayload>,
  ): Promise<OrganizerEventApi> =>
    unwrap(
      await clientHttp.patch<ApiEnvelope<OrganizerEventApi>>(
        `/organizer/events/${eventId}`,
        payload,
      ),
    ),

  cancelEvent: async (
    eventId: string,
    reason?: string,
  ): Promise<CancelEventResponse> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<CancelEventResponse>>(
        `/organizer/events/${eventId}/cancel`,
        { reason },
      ),
    ),

  /** Ticket sales across every event this organizer runs. */
  listSales: async (
    query: EventTicketsQuery,
  ): Promise<PaginatedResponse<EventTicketApi>> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<PaginatedResponse<EventTicketApi>>>(
        "/organizer/tickets/sales",
        { params: query },
      ),
    ),

  deleteEvent: async (eventId: string): Promise<{ deleted: boolean }> =>
    unwrap(
      await clientHttp.delete<ApiEnvelope<{ deleted: boolean }>>(
        `/organizer/events/${eventId}`,
      ),
    ),

  /** Announces a change in the event's channel, where ticket holders see it. */
  postEventMessage: async (eventId: string, message: string): Promise<void> => {
    await clientHttp.post(`/organizer/events/${eventId}/chat`, { message });
  },

  /* --- attendees --- */

  listEventTickets: async (
    eventId: string,
    query: EventTicketsQuery,
  ): Promise<PaginatedResponse<EventTicketApi>> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<PaginatedResponse<EventTicketApi>>>(
        `/organizer/events/${eventId}/tickets`,
        { params: query },
      ),
    ),

  refundTicket: async (
    ticketId: string,
    reason?: string,
  ): Promise<EventTicketApi> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<EventTicketApi>>(
        `/organizer/tickets/${ticketId}/refund`,
        { reason },
      ),
    ),

  /* --- door --- */

  checkInTicket: async (
    payload: TicketCheckInPayload,
  ): Promise<TicketCheckInResponse> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<TicketCheckInResponse>>(
        "/organizer/tickets/check-in",
        payload,
      ),
    ),

  /* --- insights --- */

  listEventRatings: async (
    eventId: string,
    query: { page?: number; limit?: number },
  ): Promise<EventRatingsResponse> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<EventRatingsResponse>>(
        `/organizer/events/${eventId}/ratings`,
        { params: query },
      ),
    ),

  /* --- exports --- */

  listEventExports: async (
    eventId: string,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResponse<EventExportApi>> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<PaginatedResponse<EventExportApi>>>(
        `/organizer/events/${eventId}/exports`,
        { params: query },
      ),
    ),

  createEventExport: async (
    eventId: string,
    payload: CreateEventExportPayload,
  ): Promise<EventExportApi> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<EventExportApi>>(
        `/organizer/events/${eventId}/exports`,
        payload,
      ),
    ),

  getEventExportPreview: async (
    eventId: string,
    exportId: string,
  ): Promise<EventExportPreviewApi> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<EventExportPreviewApi>>(
        `/organizer/events/${eventId}/exports/${exportId}/preview`,
      ),
    ),

  /**
   * The download itself streams a file, so it is fetched as a blob through the
   * BFF rather than unwrapped as JSON. The caller owns the object URL.
   */
  downloadExport: async (eventId: string, exportId: string): Promise<Blob> => {
    const response = await clientHttp.get(
      `/organizer/events/${eventId}/exports/${exportId}/download`,
      { responseType: "blob" },
    );

    return response.data as Blob;
  },

  /* --- location & media --- */

  searchEventCenters: async (
    query: string,
    near?: { latitude: number; longitude: number },
  ): Promise<{ items: EventCenterSuggestion[] }> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<{ items: EventCenterSuggestion[] }>>(
        "/organizer/centers/search",
        { params: { query, limit: 6, ...near } },
      ),
    ),

  geocodeSearch: async (query: string): Promise<GeocodeResult[]> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<GeocodeResult[]>>("/geocode/search", {
        params: { q: query },
      }),
    ),

  reverseGeocode: async (
    latitude: number,
    longitude: number,
  ): Promise<GeocodeResult | null> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<GeocodeResult | null>>(
        "/geocode/reverse",
        { params: { lat: latitude, lng: longitude } },
      ),
    ),

  uploadImage: async (dataUri: string): Promise<UploadedAsset> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<UploadedAsset>>("/organizer/upload", {
        dataUri,
        folder: "events",
        resourceType: "image",
      }),
    ),

  /* --- promote --- */

  getFeatureAvailability: async (query: {
    startDate: string;
    days?: number;
  }): Promise<FeatureAvailabilityResponse> =>
    unwrap(
      await clientHttp.get<ApiEnvelope<FeatureAvailabilityResponse>>(
        "/organizer/feature-availability",
        { params: query },
      ),
    ),

  initializeEventFeature: async (
    eventId: string,
    payload: { startDate: string; days: number; callbackUrl?: string },
  ): Promise<InitializeEventFeatureResponse> =>
    unwrap(
      await clientHttp.post<ApiEnvelope<InitializeEventFeatureResponse>>(
        `/organizer/events/${eventId}/feature/initialize`,
        payload,
      ),
    ),
};
