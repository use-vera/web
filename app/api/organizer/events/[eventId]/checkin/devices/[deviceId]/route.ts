import { proxy } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; deviceId: string }> },
) {
  const { eventId, deviceId } = await params;
  return proxy(
    request,
    "delete",
    `/events/${eventId}/checkin/devices/${deviceId}`,
  );
}
