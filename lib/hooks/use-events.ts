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
  state: query?.state ?? "",
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
