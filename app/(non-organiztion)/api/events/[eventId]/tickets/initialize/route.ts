import serverHttp from "@/lib/api/server-http";
import { forwardBackendError, unauthorizedResponse } from "@/lib/api/route-helpers";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/events/[eventId]/tickets/initialize">,
) {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { eventId } = await ctx.params;
  const body = await request.json();

  try {
    const response = await serverHttp.post(
      `/events/${eventId}/tickets/initialize`,
      body,
      { headers: { Authorization: `Bearer ${session.token}` } },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}
