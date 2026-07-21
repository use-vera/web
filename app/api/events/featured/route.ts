import serverHttp from "@/lib/api/server-http";
import { forwardBackendError } from "@/lib/api/route-helpers";
import { NextRequest, NextResponse } from "next/server";

// No auth required — mirrors app/api/events/route.ts's proxy-to-public
// pattern (backend/src/routes/public-event.routes.js has no authMiddleware).
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  try {
    const response = await serverHttp.get("/public/events/featured", {
      params: Object.fromEntries(searchParams.entries()),
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}
