import { eventService } from "@/lib/services/event.service";
import { type EventListQuery } from "@/lib/types/event";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

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

export const useEvents = (query?: EventListQuery, enabled = true) => {
  const normalized = normalizeQuery(query);

  return useQuery({
    queryKey: ["events", "list", normalized],
    queryFn: () => eventService.listEvents(normalized),
    enabled,
  });
};

// Paginated "Load more" browsing — TanStack Query owns the accumulated
// pages itself (via `pages`/`fetchNextPage`), so callers never need to
// hand-roll a merged-rows state or a "reset page on filter change" effect;
// changing `query` changes the cache key, which resets to page 1 for free.
export const useInfiniteEvents = (query?: Omit<EventListQuery, "page">) => {
  const normalized = normalizeQuery(query);

  return useInfiniteQuery({
    queryKey: ["events", "list", "infinite", normalized],
    queryFn: ({ pageParam }) =>
      eventService.listEvents({ ...normalized, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
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

export const useFeaturedEvents = (limit?: number) =>
  useQuery({
    queryKey: ["events", "featured", limit ?? null],
    queryFn: () => eventService.listFeaturedEvents(limit),
    staleTime: 60 * 1000,
  });
