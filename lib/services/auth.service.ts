import clientHttp from "@/lib/api/client-http";
import {
  type AuthResponse,
  type LoginPayload,
  type RegisterPayload,
} from "@/lib/types/auth";

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authService = {
  getSession: async (): Promise<AuthResponse> => {
    const response = await clientHttp.get<ApiEnvelope<AuthResponse>>("/auth/me");

    return response.data.data;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await clientHttp.post<ApiEnvelope<AuthResponse>>(
      "/auth/login",
      payload,
    );

    return response.data.data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const response = await clientHttp.post<ApiEnvelope<AuthResponse>>(
      "/auth/register",
      payload,
    );

    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await clientHttp.post("/auth/logout");
  },
};
