import { eventVendorService } from "@/lib/services/vendor.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const eventVendorsKey = (eventId: string) => ["organizer", "event", eventId, "vendors"];

export const useEventVendors = (eventId: string) =>
  useQuery({
    queryKey: eventVendorsKey(eventId),
    queryFn: () => eventVendorService.list(eventId),
    enabled: Boolean(eventId),
  });

/** Every write on this tab refreshes the same tab. */
const useEventVendorMutation = <TVariables, TData>(
  eventId: string,
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventVendorsKey(eventId) });
    },
  });
};

export const useUpdateEventVendorSettings = (eventId: string) =>
  useEventVendorMutation(
    eventId,
    (payload: Parameters<typeof eventVendorService.updateSettings>[1]) =>
      eventVendorService.updateSettings(eventId, payload),
  );

export const useInviteVendor = (eventId: string) =>
  useEventVendorMutation(
    eventId,
    (variables: { vendorId: string; stallLabel?: string }) =>
      eventVendorService.invite(eventId, variables.vendorId, {
        stallLabel: variables.stallLabel,
      }),
  );

export const useDecideVendorApplication = (eventId: string) =>
  useEventVendorMutation(
    eventId,
    (variables: { bookingId: string; accept: boolean }) =>
      eventVendorService.decide(eventId, variables.bookingId, variables.accept),
  );

export const useRemoveEventVendor = (eventId: string) =>
  useEventVendorMutation(eventId, (bookingId: string) =>
    eventVendorService.remove(eventId, bookingId),
  );

export const usePublicVendor = (slug: string) =>
  useQuery({
    queryKey: ["vendor", "public", slug],
    queryFn: () => eventVendorService.getPublicMenu(slug),
    enabled: Boolean(slug),
  });

export const useVendorDirectory = (query: { search?: string; category?: string }) =>
  useQuery({
    queryKey: ["vendor", "directory", query],
    queryFn: () => eventVendorService.search(query),
  });
