import { eventService } from "@/lib/services/event.service";
import { type EventListQuery } from "@/lib/types/event";
import { useQuery } from "@tanstack/react-query";

const normalizeQuery = (query?: EventListQuery) => ({
  page: query?.page ?? 1,
  limit: query?.limit ?? 20,
  search: query?.search ?? "",
  sort: query?.sort ?? "dateAsc",
  filter: query?.filter ?? "upcoming",
  ticketType: query?.ticketType ?? "all",
  country: query?.country ?? "",
  // category is a strict ObjectId regex on the backend (unlike country's
  // permissive free-text string) — undefined omits the param entirely,
  // where an empty string would be sent as `category=` and fail validation.
  category: query?.category || undefined,
  nearLat: query?.nearLat ?? undefined,
  nearLng: query?.nearLng ?? undefined,
  nearRadiusKm: query?.nearRadiusKm ?? undefined,
  // from/to are dateStringSchema on the backend — same empty-string-fails
  // reasoning as category above.
  from: query?.from || undefined,
  to: query?.to || undefined,
});

export const useEvents = (query?: EventListQuery) => {
  const normalized = normalizeQuery(query);

  return useQuery({
    queryKey: ["events", "list", normalized],
    queryFn: () => eventService.listEvents(normalized),
  });
};

export const useEvent = (eventId: string | null) =>
  useQuery({
    queryKey: ["events", "details", eventId],
    queryFn: () => eventService.getEventById(eventId as string),
    enabled: Boolean(eventId),
  });

export const useEventCountries = () =>
  useQuery({
    queryKey: ["events", "countries"],
    queryFn: eventService.listEventCountries,
    staleTime: 5 * 60 * 1000,
  });
