import serverHttp from "@/lib/api/server-http";
import { forwardBackendError, unauthorizedResponse } from "@/lib/api/route-helpers";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/events/[eventId]/promo-codes/preview">,
) {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { eventId } = await ctx.params;
  const body = await request.json();

  try {
    const response = await serverHttp.post(
      `/events/${eventId}/promo-codes/preview`,
      body,
      { headers: { Authorization: `Bearer ${session.token}` } },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}
