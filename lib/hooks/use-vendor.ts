import {
  vendorOrderService,
  vendorService,
} from "@/lib/services/vendor.service";
import {
  type CreateVendorItemPayload,
  type CreateVendorPayload,
  type UpdateVendorItemPayload,
  type UpdateVendorPayload,
} from "@/lib/types/vendor";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const VENDOR_KEY = ["vendor", "me"];
const MENU_KEY = ["vendor", "me", "menu"];

/** The fixed category list. It never changes between renders, so cache it hard. */
export const useVendorCategories = () =>
  useQuery({
    queryKey: ["vendor", "categories"],
    queryFn: vendorService.listCategories,
    staleTime: 60 * 60 * 1000,
  });

export const useMyVendor = (enabled = true) =>
  useQuery({
    queryKey: VENDOR_KEY,
    queryFn: vendorService.getMine,
    staleTime: 30 * 1000,
    enabled,
  });

export const useMyVendorLimits = () =>
  useQuery({
    queryKey: ["vendor", "me", "limits"],
    queryFn: vendorService.getMyLimits,
  });

export const useSubmitVerification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { bvn?: string; cacNumber?: string }) =>
      vendorService.submitVerification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_KEY });
      queryClient.invalidateQueries({ queryKey: ["vendor", "me", "limits"] });
    },
  });
};

export const useMyVendorMenu = (enabled = true) =>
  useQuery({
    queryKey: MENU_KEY,
    queryFn: vendorService.getMyMenu,
    enabled,
  });

/**
 * Menu writes all land back on the same two reads, so they share one
 * invalidation rather than each hook inventing its own.
 */
const useMenuMutation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_KEY });
      queryClient.invalidateQueries({ queryKey: MENU_KEY });
    },
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateVendorPayload) => vendorService.create(payload),
    onSuccess: (vendor) => {
      queryClient.setQueryData(VENDOR_KEY, vendor);
    },
  });
};

export const useUpdateVendor = () =>
  useMenuMutation((payload: UpdateVendorPayload) =>
    vendorService.update(payload),
  );

export const useAddVendorSection = () =>
  useMenuMutation((name: string) => vendorService.addSection(name));

export const useRenameVendorSection = () =>
  useMenuMutation((variables: { sectionId: string; name: string }) =>
    vendorService.renameSection(variables.sectionId, variables.name),
  );

export const useDeleteVendorSection = () =>
  useMenuMutation((sectionId: string) => vendorService.deleteSection(sectionId));

export const useCreateVendorItem = () =>
  useMenuMutation((payload: CreateVendorItemPayload) =>
    vendorService.createItem(payload),
  );

export const useUpdateVendorItem = () =>
  useMenuMutation((variables: { itemId: string; payload: UpdateVendorItemPayload }) =>
    vendorService.updateItem(variables.itemId, variables.payload),
  );

export const useDeleteVendorItem = () =>
  useMenuMutation((itemId: string) => vendorService.deleteItem(itemId));

export const useUploadVendorImage = () =>
  useMutation({ mutationFn: (dataUri: string) => vendorService.uploadImage(dataUri) });

/* ---------------------------------------------------------------- bookings */

const BOOKINGS_KEY = ["vendor", "me", "bookings"];

export const useMyBookings = () =>
  useQuery({
    queryKey: BOOKINGS_KEY,
    queryFn: vendorService.listMyBookings,
  });

export const useOpenEventsForVendor = () =>
  useQuery({
    queryKey: ["vendor", "me", "open-events"],
    queryFn: vendorService.listOpenEvents,
  });

/** Applying and answering both change the same two lists. */
const useBookingMutation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY });
      queryClient.invalidateQueries({ queryKey: ["vendor", "me", "open-events"] });
    },
  });
};

export const useApplyToEvent = () =>
  useBookingMutation((variables: { eventId: string; message?: string }) =>
    vendorService.applyToEvent(variables.eventId, variables.message),
  );

export const useVerifyStallFee = () =>
  useBookingMutation((variables: { bookingId: string; reference?: string }) =>
    vendorService.verifyStallFee(variables.bookingId, variables.reference),
  );

export const useRespondToInvite = () =>
  useBookingMutation(
    (variables: {
      bookingId: string;
      accept: boolean;
      note?: string;
      callbackUrl?: string;
    }) =>
      vendorService.respondToInvite(
        variables.bookingId,
        variables.accept,
        variables.note,
        variables.callbackUrl,
      ),
  );

/* -------------------------------------------------------------- the queue */

/* Exported so the realtime listener can invalidate exactly what the queue
   screens read. */
export const VENDOR_QUEUE_KEY = ["vendor", "me", "orders"];

const QUEUE_KEY = VENDOR_QUEUE_KEY;

/**
 * The live order queue.
 *
 * Pushed, not polled: useVendorOrderRealtime() invalidates this key when the
 * server says an order changed. Refetch-on-focus stays underneath as the
 * fallback for a stall whose connection dropped.
 */
export const useVendorQueue = (eventId?: string) =>
  useQuery({
    queryKey: [...QUEUE_KEY, eventId ?? "all"],
    queryFn: () => vendorOrderService.listQueue({ eventId }),
    /* Never asked before the event is known. Without this the first call
       goes out unfiltered, fills the board with every event's orders, and
       then empties it a moment later when the real query lands. */
    enabled: Boolean(eventId),
    refetchOnWindowFocus: true,
  });

/**
 * Every live order across every event, used only to count what is waiting
 * where. One call for the whole picker beats one per event.
 */
export const useVendorQueueAcrossEvents = () =>
  useQuery({
    queryKey: [...QUEUE_KEY, "all-events"],
    queryFn: () => vendorOrderService.listQueue({}),
    refetchOnWindowFocus: true,
  });

const useQueueMutation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY });
    },
  });
};

export const useAdvanceOrder = () =>
  useQueueMutation((variables: { orderId: string; status: "preparing" | "ready" }) =>
    vendorOrderService.advance(variables.orderId, variables.status),
  );

export const useCollectOrder = () =>
  useQueueMutation((variables: { orderId: string; code: string }) =>
    vendorOrderService.collect(variables.orderId, variables.code),
  );

export const useCancelVendorOrder = () =>
  useQueueMutation((variables: { orderId: string; reason?: string }) =>
    vendorOrderService.cancel(variables.orderId, variables.reason),
  );

export const useSetServiceState = () =>
  useQueueMutation(
    (variables: {
      bookingId: string;
      payload: { acceptingOrders?: boolean; prepMinutes?: number | null };
    }) => vendorOrderService.setServiceState(variables.bookingId, variables.payload),
  );
