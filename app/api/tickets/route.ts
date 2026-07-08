import serverHttp from "@/lib/api/server-http";
import { forwardBackendError, unauthorizedResponse } from "@/lib/api/route-helpers";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { searchParams } = request.nextUrl;

  try {
    const response = await serverHttp.get("/events/tickets/me", {
      params: Object.fromEntries(searchParams.entries()),
      headers: { Authorization: `Bearer ${session.token}` },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}
