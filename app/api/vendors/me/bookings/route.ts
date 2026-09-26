import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return proxy(request, "get", "/vendors/me/bookings", { forwardQuery: true });
}

export async function POST(request: NextRequest) {
  return proxy(request, "post", "/vendors/me/bookings", {
    body: await readBody(request),
  });
}
