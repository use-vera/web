import serverHttp from "@/lib/api/server-http";
import { forwardBackendError, unauthorizedResponse } from "@/lib/api/route-helpers";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

/**
 * The origin the browser opens its socket against, derived from the backend
 * URL this server already has rather than a second public variable that
 * could drift away from it.
 */
const socketOrigin = () => {
  const base = process.env.BACKEND_API_URL ?? "";

  try {
    const parsed = new URL(base);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return base.replace(/\/api\/?$/i, "");
  }
};

/**
 * Hands the browser a short-lived, socket-only token.
 *
 * The session's real bearer token stays in the httpOnly cookie and never
 * crosses into client JavaScript. What comes back here expires in minutes
 * and the backend refuses it on the HTTP API.
 */
export async function POST() {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const response = await serverHttp.post(
      "/auth/realtime-token",
      {},
      { headers: { Authorization: `Bearer ${session.token}` } },
    );

    return NextResponse.json({
      ...response.data,
      data: { ...response.data.data, url: socketOrigin() },
    });
  } catch (error) {
    return forwardBackendError(error);
  }
}
