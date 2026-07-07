import serverHttp from "@/lib/api/server-http";
import { forwardBackendError } from "@/lib/api/route-helpers";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/events/[eventId]">,
) {
  const { eventId } = await ctx.params;

  try {
    const response = await serverHttp.get(`/public/events/${eventId}`);

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}
