import serverHttp from "@/lib/api/server-http";
import { forwardBackendError, unauthorizedResponse } from "@/lib/api/route-helpers";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/tickets/[ticketId]/verify">,
) {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { ticketId } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  try {
    const response = await serverHttp.post(
      `/events/tickets/${ticketId}/verify`,
      body,
      { headers: { Authorization: `Bearer ${session.token}` } },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}
