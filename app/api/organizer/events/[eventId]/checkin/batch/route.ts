import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  return proxy(request, "post", `/events/${eventId}/checkin/batch`, {
    body: await readBody(request),
  });
}
