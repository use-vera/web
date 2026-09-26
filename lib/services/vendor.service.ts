import clientHttp from "@/lib/api/client-http";
import {
  type EventVendorsResponse,
  type OpenEventForVendor,
  type Vendor as VendorProfile,
  type VendorBooking,
  type CreateVendorItemPayload,
  type CreateVendorPayload,
  type UpdateVendorItemPayload,
  type UpdateVendorPayload,
  type Vendor,
  type VendorCategory,
  type VendorItem,
  type VendorLimits,
  type VendorMenu,
  type VendorOrder,
  type RespondToInviteResult,
  type VendorOrderQueue,
  type VendorServiceState,
} from "@/lib/types/vendor";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface UploadedAsset {
  url: string;
}

export const vendorService = {
  /** Reuses the shared upload endpoint; vendors get their own folder. */
  uploadImage: async (dataUri: string): Promise<string> => {
    const response = await clientHttp.post<ApiEnvelope<UploadedAsset>>(
      "/files/upload",
      { dataUri, folder: "vendors", resourceType: "image" },
    );

    return response.data.data.url;
  },

  listCategories: async (): Promise<VendorCategory[]> => {
    const response =
      await clientHttp.get<ApiEnvelope<{ items: VendorCategory[] }>>(
        "/vendors/categories",
      );

    return response.data.data.items;
  },

  /** Null when this account has no vendor yet, which is not an error. */
  getMine: async (): Promise<Vendor | null> => {
    const response =
      await clientHttp.get<ApiEnvelope<{ vendor: Vendor | null }>>(
        "/vendors/me",
      );

    return response.data.data.vendor;
  },

  create: async (payload: CreateVendorPayload): Promise<Vendor> => {
    const response = await clientHttp.post<ApiEnvelope<{ vendor: Vendor }>>(
      "/vendors/me",
      payload,
    );

    return response.data.data.vendor;
  },

  update: async (payload: UpdateVendorPayload): Promise<Vendor> => {
    const response = await clientHttp.patch<ApiEnvelope<{ vendor: Vendor }>>(
      "/vendors/me",
      payload,
    );

    return response.data.data.vendor;
  },

  getMyLimits: async (): Promise<VendorLimits> => {
    const response = await clientHttp.get<ApiEnvelope<VendorLimits>>(
      "/vendors/me/limits",
    );

    return response.data.data;
  },

  submitVerification: async (payload: {
    bvn?: string;
    cacNumber?: string;
  }): Promise<Vendor> => {
    const response = await clientHttp.post<ApiEnvelope<{ vendor: Vendor }>>(
      "/vendors/me/verification",
      payload,
    );

    return response.data.data.vendor;
  },

  getMyMenu: async (): Promise<VendorMenu> => {
    const response =
      await clientHttp.get<ApiEnvelope<VendorMenu>>("/vendors/me/menu");

    return response.data.data;
  },

  addSection: async (name: string): Promise<Vendor> => {
    const response = await clientHttp.post<ApiEnvelope<{ vendor: Vendor }>>(
      "/vendors/me/sections",
      { name },
    );

    return response.data.data.vendor;
  },

  renameSection: async (sectionId: string, name: string): Promise<Vendor> => {
    const response = await clientHttp.patch<ApiEnvelope<{ vendor: Vendor }>>(
      `/vendors/me/sections/${sectionId}`,
      { name },
    );

    return response.data.data.vendor;
  },

  deleteSection: async (sectionId: string): Promise<Vendor> => {
    const response = await clientHttp.delete<ApiEnvelope<{ vendor: Vendor }>>(
      `/vendors/me/sections/${sectionId}`,
    );

    return response.data.data.vendor;
  },

  createItem: async (payload: CreateVendorItemPayload): Promise<VendorItem> => {
    const response = await clientHttp.post<ApiEnvelope<{ item: VendorItem }>>(
      "/vendors/me/items",
      payload,
    );

    return response.data.data.item;
  },

  updateItem: async (
    itemId: string,
    payload: UpdateVendorItemPayload,
  ): Promise<VendorItem> => {
    const response = await clientHttp.patch<ApiEnvelope<{ item: VendorItem }>>(
      `/vendors/me/items/${itemId}`,
      payload,
    );

    return response.data.data.item;
  },

  deleteItem: async (itemId: string): Promise<void> => {
    await clientHttp.delete(`/vendors/me/items/${itemId}`);
  },

  /* --- events this vendor is booked for, or could be --- */

  listMyBookings: async (): Promise<VendorBooking[]> => {
    const response = await clientHttp.get<
      ApiEnvelope<{ items: VendorBooking[] }>
    >("/vendors/me/bookings");

    return response.data.data.items;
  },

  listOpenEvents: async (): Promise<OpenEventForVendor[]> => {
    const response = await clientHttp.get<
      ApiEnvelope<{ items: OpenEventForVendor[] }>
    >("/vendors/me/open-events");

    return response.data.data.items;
  },

  applyToEvent: async (eventId: string, message?: string): Promise<VendorBooking> => {
    const response = await clientHttp.post<
      ApiEnvelope<{ booking: VendorBooking }>
    >("/vendors/me/bookings", { eventId, message });

    return response.data.data.booking;
  },

  respondToInvite: async (
    bookingId: string,
    accept: boolean,
    note?: string,
    /* Where Paystack sends the popup once it is done. Without it the window
       stops on Paystack's own success page and never comes back. */
    callbackUrl?: string,
  ): Promise<RespondToInviteResult> => {
    const response = await clientHttp.patch<
      ApiEnvelope<RespondToInviteResult>
    >(`/vendors/me/bookings/${bookingId}/response`, {
      accept,
      note,
      callbackUrl,
    });

    return response.data.data;
  },

  /** Confirms a stall fee payment, which is what confirms the spot. */
  verifyStallFee: async (
    bookingId: string,
    reference?: string,
  ): Promise<VendorBooking> => {
    const response = await clientHttp.post<
      ApiEnvelope<{ booking: VendorBooking }>
    >(`/vendors/me/bookings/${bookingId}/stall-fee/verify`, { reference });

    return response.data.data.booking;
  },
};

/** Tonight's queue, from the vendor's side of the counter. */
export const vendorOrderService = {
  listQueue: async (query: {
    eventId?: string;
    status?: string;
  }): Promise<VendorOrderQueue> => {
    const response = await clientHttp.get<ApiEnvelope<VendorOrderQueue>>(
      "/vendors/me/orders",
      { params: query },
    );

    return response.data.data;
  },

  advance: async (
    orderId: string,
    status: "preparing" | "ready",
  ): Promise<VendorOrder> => {
    const response = await clientHttp.patch<
      ApiEnvelope<{ order: VendorOrder }>
    >(`/vendors/me/orders/${orderId}/status`, { status });

    return response.data.data.order;
  },

  /** The code is checked by the server; a mismatch is an error, not a no-op. */
  collect: async (orderId: string, code: string): Promise<VendorOrder> => {
    const response = await clientHttp.post<
      ApiEnvelope<{ order: VendorOrder }>
    >(`/vendors/me/orders/${orderId}/collect`, { code });

    return response.data.data.order;
  },

  cancel: async (orderId: string, reason?: string): Promise<VendorOrder> => {
    const response = await clientHttp.post<
      ApiEnvelope<{ order: VendorOrder }>
    >(`/vendors/me/orders/${orderId}/cancel`, { reason });

    return response.data.data.order;
  },

  setServiceState: async (
    bookingId: string,
    payload: { acceptingOrders?: boolean; prepMinutes?: number | null },
  ): Promise<VendorServiceState> => {
    const response = await clientHttp.patch<ApiEnvelope<VendorServiceState>>(
      `/vendors/me/bookings/${bookingId}/service`,
      payload,
    );

    return response.data.data;
  },
};

/** The organizer half of the same conversation, under their event. */
export const eventVendorService = {
  list: async (eventId: string): Promise<EventVendorsResponse> => {
    const response = await clientHttp.get<ApiEnvelope<EventVendorsResponse>>(
      `/organizer/events/${eventId}/vendors`,
    );

    return response.data.data;
  },

  updateSettings: async (
    eventId: string,
    payload: Partial<{
      acceptingApplications: boolean;
      stallFeeNaira: number;
      spots: number;
    }>,
  ): Promise<void> => {
    await clientHttp.patch(
      `/organizer/events/${eventId}/vendors/settings`,
      payload,
    );
  },

  invite: async (
    eventId: string,
    vendorId: string,
    terms?: { stallLabel?: string },
  ): Promise<VendorBooking> => {
    const response = await clientHttp.post<
      ApiEnvelope<{ booking: VendorBooking }>
    >(`/organizer/events/${eventId}/vendors/invites`, { vendorId, terms });

    return response.data.data.booking;
  },

  decide: async (
    eventId: string,
    bookingId: string,
    accept: boolean,
  ): Promise<VendorBooking> => {
    const response = await clientHttp.patch<
      ApiEnvelope<{ booking: VendorBooking }>
    >(`/organizer/events/${eventId}/vendors/${bookingId}/decision`, { accept });

    return response.data.data.booking;
  },

  remove: async (eventId: string, bookingId: string): Promise<void> => {
    await clientHttp.delete(
      `/organizer/events/${eventId}/vendors/${bookingId}`,
    );
  },

  /** One vendor's public page: their menu as buyers see it. */
  getPublicMenu: async (slug: string): Promise<VendorMenu> => {
    const response = await clientHttp.get<ApiEnvelope<VendorMenu>>(
      `/vendors/${slug}`,
    );

    return response.data.data;
  },

  /** Search the directory when picking someone to invite. */
  search: async (query: {
    search?: string;
    category?: string;
  }): Promise<VendorProfile[]> => {
    const response = await clientHttp.get<
      ApiEnvelope<{ items: VendorProfile[] }>
    >("/vendors/directory", { params: query });

    return response.data.data.items;
  },
};
