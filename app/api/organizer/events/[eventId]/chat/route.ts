import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

/** Posts to the event's own channel. How attendees are told about changes. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  return proxy(request, "post", `/events/${eventId}/chat`, {
    body: await readBody(request),
  });
}
