import axios from "axios";
import { NextResponse } from "next/server";

interface BackendEnvelope {
  success: boolean;
  message: string;
  data?: unknown;
  details?: unknown;
}

/**
 * Every real-backend error already comes back as { success, message, details }
 * (see backend/src/middlewares/error.middleware.js) — forward it as-is so the
 * browser sees the same status code and message the backend produced.
 */
export const forwardBackendError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response) {
    const body = error.response.data as BackendEnvelope | undefined;

    return NextResponse.json(
      {
        success: false,
        message: body?.message ?? "Something went wrong",
        details: body?.details ?? null,
      },
      { status: error.response.status },
    );
  }

  return NextResponse.json(
    { success: false, message: "Unable to reach the server", details: null },
    { status: 502 },
  );
};

export const unauthorizedResponse = () =>
  NextResponse.json(
    { success: false, message: "Sign in required", details: null },
    { status: 401 },
  );
