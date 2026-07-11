import serverHttp from "@/lib/api/server-http";
import { forwardBackendError } from "@/lib/api/route-helpers";
import { NextResponse } from "next/server";

// No auth required — mirrors app/api/categories/route.ts's proxy-to-public
// pattern, so the logged-out events page can render the location filter.
export async function GET() {
  try {
    const response = await serverHttp.get("/public/events/countries");

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}
