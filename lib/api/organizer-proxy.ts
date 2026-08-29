import serverHttp from "@/lib/api/server-http";
import { forwardBackendError, unauthorizedResponse } from "@/lib/api/route-helpers";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

/**
 * Every organizer route is the same shape: require a session, forward to the
 * real backend with the bearer token, pass the envelope straight through.
 * Keeping it in one place stops fourteen route handlers from drifting apart.
 */
export const proxy = async (
  request: NextRequest,
  method: "get" | "post" | "put" | "patch" | "delete",
  path: string,
  options: { forwardQuery?: boolean; body?: unknown } = {},
) => {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const headers = { Authorization: `Bearer ${session.token}` };
  const params = options.forwardQuery
    ? Object.fromEntries(request.nextUrl.searchParams.entries())
    : undefined;

  try {
    const response =
      method === "get" || method === "delete"
        ? await serverHttp[method](path, { params, headers })
        : await serverHttp[method](path, options.body ?? {}, { params, headers });

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
};

/** Reads a JSON body, tolerating an empty one (a bodyless POST is valid here). */
export const readBody = async (request: NextRequest) => {
  try {
    return await request.json();
  } catch {
    return {};
  }
};
