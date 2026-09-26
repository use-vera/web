import { proxy } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ eventId: string; bookingId: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  const { eventId, bookingId } = await params;
  return proxy(request, "delete", `/events/${eventId}/vendors/${bookingId}`);
}
