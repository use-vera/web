import axios from "axios";

interface BackendEnvelope {
  success: boolean;
  message?: string;
}

/** Extracts the backend's human-readable message from a failed BFF call. */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as BackendEnvelope | undefined;
    return body?.message || fallback;
  }

  return fallback;
};
