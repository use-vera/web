import { organizerService } from "@/lib/services/organizer.service";
import {
  type CreateEventExportPayload,
  type CreateEventPayload,
  type EventTicketsQuery,
  type MyEventsQuery,
  type TicketCheckInPayload,
} from "@/lib/types/organizer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const organizerKeys = {
  events: (query: MyEventsQuery) => ["organizer", "events", query] as const,
  event: (eventId: string) => ["organizer", "event", eventId] as const,
  tickets: (eventId: string, query: EventTicketsQuery) =>
    ["organizer", "tickets", eventId, query] as const,
  ratings: (eventId: string) => ["organizer", "ratings", eventId] as const,
  exports: (eventId: string) => ["organizer", "exports", eventId] as const,
  exportPreview: (eventId: string, exportId: string) =>
    ["organizer", "export-preview", eventId, exportId] as const,
  featureAvailability: (startDate: string, days: number) =>
    ["organizer", "feature-availability", startDate, days] as const,
};

const normalizeEventsQuery = (query?: MyEventsQuery) => ({
  page: query?.page ?? 1,
  limit: query?.limit ?? 20,
  search: query?.search ?? "",
  status: query?.status ?? ("all" as const),
});

export const useMyEvents = (query?: MyEventsQuery) => {
  const normalized = normalizeEventsQuery(query);

  return useQuery({
    queryKey: organizerKeys.events(normalized),
    queryFn: () => organizerService.listMyEvents(normalized),
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventPayload) =>
      organizerService.createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer", "events"] });
    },
  });
};

export const useCancelEvent = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason?: string) =>
      organizerService.cancelEvent(eventId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer"] });
    },
  });
};

const normalizeTicketsQuery = (query?: EventTicketsQuery) => ({
  page: query?.page ?? 1,
  limit: query?.limit ?? 20,
  search: query?.search ?? "",
  status: query?.status ?? ("all" as const),
});

export const useEventTickets = (eventId: string, query?: EventTicketsQuery) => {
  const normalized = normalizeTicketsQuery(query);

  return useQuery({
    queryKey: organizerKeys.tickets(eventId, normalized),
    queryFn: () => organizerService.listEventTickets(eventId, normalized),
    enabled: Boolean(eventId),
  });
};

export const useOrganizerSales = (query?: EventTicketsQuery) => {
  const normalized = normalizeTicketsQuery(query);

  return useQuery({
    queryKey: ["organizer", "sales", normalized],
    queryFn: () => organizerService.listSales(normalized),
  });
};

export const useRefundTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, reason }: { ticketId: string; reason?: string }) =>
      organizerService.refundTicket(ticketId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer", "tickets"] });
    },
  });
};

/**
 * Door scanning. Deliberately not invalidating the whole attendee list on every
 * scan — a busy door would refetch hundreds of rows per second. The check-in
 * screen keeps its own running tally from each response instead.
 */
export const useCheckInTicket = () =>
  useMutation({
    mutationFn: (payload: TicketCheckInPayload) =>
      organizerService.checkInTicket(payload),
  });

export const useEventCenterSearch = (
  query: string,
  near?: { latitude: number; longitude: number },
) =>
  useQuery({
    queryKey: ["organizer", "centers", query, near?.latitude, near?.longitude],
    queryFn: () => organizerService.searchEventCenters(query, near),
    enabled: query.trim().length >= 2,
    staleTime: 60 * 1000,
  });

export const useGeocodeSearch = (query: string) =>
  useQuery({
    queryKey: ["geocode", "search", query],
    queryFn: () => organizerService.geocodeSearch(query),
    enabled: query.trim().length >= 3,
    staleTime: 5 * 60 * 1000,
  });

export const useReverseGeocode = () =>
  useMutation({
    mutationFn: ({
      latitude,
      longitude,
    }: {
      latitude: number;
      longitude: number;
    }) => organizerService.reverseGeocode(latitude, longitude),
  });

export const useUploadImage = () =>
  useMutation({
    mutationFn: (dataUri: string) => organizerService.uploadImage(dataUri),
  });

export const useEventRatings = (eventId: string, limit = 20) =>
  useQuery({
    queryKey: organizerKeys.ratings(eventId),
    queryFn: () => organizerService.listEventRatings(eventId, { limit }),
    enabled: Boolean(eventId),
  });

export const useEventExports = (eventId: string, page = 1) =>
  useQuery({
    queryKey: [...organizerKeys.exports(eventId), page],
    queryFn: () => organizerService.listEventExports(eventId, { page, limit: 10 }),
    enabled: Boolean(eventId),
  });

export const useOrganizerEvent = (eventId: string) =>
  useQuery({
    queryKey: organizerKeys.event(eventId),
    queryFn: () => organizerService.getEvent(eventId),
    enabled: Boolean(eventId),
  });

export const useCreateEventExport = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventExportPayload) =>
      organizerService.createEventExport(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: organizerKeys.exports(eventId),
      });
    },
  });
};

export const useEventExportPreview = (
  eventId: string,
  exportId: string | null,
) =>
  useQuery({
    queryKey: organizerKeys.exportPreview(eventId, exportId ?? ""),
    queryFn: () =>
      organizerService.getEventExportPreview(eventId, exportId as string),
    enabled: Boolean(eventId && exportId),
  });

export const useFeatureAvailability = (startDate: string, days: number) =>
  useQuery({
    queryKey: organizerKeys.featureAvailability(startDate, days),
    queryFn: () => organizerService.getFeatureAvailability({ startDate, days }),
    enabled: Boolean(startDate && days > 0),
  });

export const useInitializeEventFeature = (eventId: string) =>
  useMutation({
    mutationFn: (payload: {
      startDate: string;
      days: number;
      callbackUrl?: string;
    }) => organizerService.initializeEventFeature(eventId, payload),
  });
