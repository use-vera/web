import { proxy } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  return proxy(request, "get", `/events/${eventId}/checkin/roster`, {
    forwardQuery: true,
  });
}
