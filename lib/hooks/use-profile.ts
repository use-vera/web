import {
  profileService,
  type UpdateProfilePayload,
} from "@/lib/services/profile.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useProfile = () =>
  useQuery({
    queryKey: ["profile", "me"],
    queryFn: profileService.getProfile,
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      profileService.updateProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] });
      /* The header reads the session, not the profile query. */
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
    },
  });
};

export const useChangePassword = () =>
  useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      profileService.changePassword(payload),
  });
