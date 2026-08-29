import { eventPageService, type SavePagePayload } from "@/lib/services/event-page.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const key = (eventId: string) => ["event-page", eventId] as const;

export const useEventPage = (eventId: string) =>
  useQuery({
    queryKey: key(eventId),
    queryFn: () => eventPageService.get(eventId),
    enabled: Boolean(eventId),
  });

export const useSaveEventPage = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SavePagePayload) =>
      eventPageService.save(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(eventId) });
    },
  });
};

export const useSetPageStatus = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: "draft" | "published") =>
      eventPageService.setStatus(eventId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(eventId) });
    },
  });
};

/** Debounce at the call site. This fires per keystroke otherwise. */
export const useSlugCheck = (eventId: string, slug: string) =>
  useQuery({
    queryKey: ["event-page", eventId, "slug", slug],
    queryFn: () => eventPageService.checkSlug(eventId, slug),
    enabled: Boolean(eventId && slug && slug.length >= 3),
    staleTime: 30_000,
  });
