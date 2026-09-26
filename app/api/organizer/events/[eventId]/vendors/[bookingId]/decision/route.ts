import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ eventId: string; bookingId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { eventId, bookingId } = await params;
  return proxy(
    request,
    "patch",
    `/events/${eventId}/vendors/${bookingId}/decision`,
    { body: await readBody(request) },
  );
}
