import { doorService } from "@/lib/services/door.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCheckInDevices = (eventId: string) =>
  useQuery({
    queryKey: ["checkin", "devices", eventId],
    queryFn: () => doorService.listDevices(eventId),
    enabled: Boolean(eventId),
  });

export const useRegisterDevice = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (label: string) => doorService.registerDevice(eventId, label),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkin", "devices", eventId] });
    },
  });
};

export const useRevokeDevice = (eventId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deviceId: string) => doorService.revokeDevice(eventId, deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkin", "devices", eventId] });
    },
  });
};

/**
 * Duplicates found on sync. Refetched after a drain, since that is the only
 * moment new conflicts can appear.
 */
export const useCheckInConflicts = (eventId: string) =>
  useQuery({
    queryKey: ["checkin", "conflicts", eventId],
    queryFn: () => doorService.listConflicts(eventId),
    enabled: Boolean(eventId),
  });
