import clientHttp from "@/lib/api/client-http";
import { type RosterResponse } from "@/lib/checkin/types";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BatchResult {
  clientSeq: number;
  result: string;
  replayed?: boolean;
  firstCheckedInAt?: string;
  firstDeviceLabel?: string | null;
  message?: string;
}

export interface CheckInDeviceApi {
  _id: string;
  label: string;
  lastSeenAt: string | null;
  revokedAt: string | null;
  admitted: number;
}

export interface CheckInConflict {
  ticketCode: string;
  attendeeName: string;
  tier: string;
  admittedAt: string | null;
  admittedLane: string | null;
  rescannedAt: string;
  rescannedLane: string | null;
}

export const doorService = {
  registerDevice: async (eventId: string, label: string): Promise<CheckInDeviceApi> => {
    const response = await clientHttp.post<ApiEnvelope<CheckInDeviceApi>>(
      `/organizer/events/${eventId}/checkin/devices`,
      { label },
    );

    return response.data.data;
  },

  listDevices: async (eventId: string): Promise<{ items: CheckInDeviceApi[] }> => {
    const response = await clientHttp.get<ApiEnvelope<{ items: CheckInDeviceApi[] }>>(
      `/organizer/events/${eventId}/checkin/devices`,
    );

    return response.data.data;
  },

  revokeDevice: async (eventId: string, deviceId: string) => {
    await clientHttp.delete(
      `/organizer/events/${eventId}/checkin/devices/${deviceId}`,
    );
  },

  listConflicts: async (
    eventId: string,
  ): Promise<{ items: CheckInConflict[]; totalItems: number }> => {
    const response = await clientHttp.get<
      ApiEnvelope<{ items: CheckInConflict[]; totalItems: number }>
    >(`/organizer/events/${eventId}/checkin/conflicts`);

    return response.data.data;
  },

  getRoster: async (eventId: string, since?: string | null): Promise<RosterResponse> => {
    const response = await clientHttp.get<ApiEnvelope<RosterResponse>>(
      `/organizer/events/${eventId}/checkin/roster`,
      { params: since ? { since } : undefined },
    );

    return response.data.data;
  },

  syncBatch: async (
    eventId: string,
    payload: {
      deviceId?: string;
      entries: {
        clientSeq: number;
        code: string;
        scannedAt: string;
        override: boolean;
      }[];
    },
  ): Promise<{ results: BatchResult[]; accepted: number; duplicates: number; rejected: number }> => {
    const response = await clientHttp.post<
      ApiEnvelope<{
        results: BatchResult[];
        accepted: number;
        duplicates: number;
        rejected: number;
      }>
    >(`/organizer/events/${eventId}/checkin/batch`, payload);

    return response.data.data;
  },
};
