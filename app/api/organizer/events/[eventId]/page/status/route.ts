import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  return proxy(request, "patch", `/events/${eventId}/page/status`, {
    body: await readBody(request),
  });
}
