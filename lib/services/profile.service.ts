import clientHttp from "@/lib/api/client-http";
import { type AuthUser } from "@/lib/types/auth";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProfileApi extends AuthUser {
  phoneNumber?: string;
  title?: string;
  bio?: string;
  state?: string;
}

export interface UpdateProfilePayload {
  fullName?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  title?: string;
  bio?: string;
  state?: string;
}

export const profileService = {
  getProfile: async (): Promise<ProfileApi> => {
    const response =
      await clientHttp.get<ApiEnvelope<{ user: ProfileApi } | ProfileApi>>(
        "/users/me",
      );
    const data = response.data.data;

    return "user" in data ? data.user : data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<ProfileApi> => {
    const response = await clientHttp.patch<
      ApiEnvelope<{ user: ProfileApi } | ProfileApi>
    >("/users/me", payload);
    const data = response.data.data;

    return "user" in data ? data.user : data;
  },

  changePassword: async (payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await clientHttp.patch("/users/me/password", payload);
  },
};
