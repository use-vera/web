import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

/** The backend cancels with PATCH; the browser-facing verb stays POST. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  return proxy(request, "patch", `/events/${eventId}/cancel`, {
    body: await readBody(request),
  });
}
