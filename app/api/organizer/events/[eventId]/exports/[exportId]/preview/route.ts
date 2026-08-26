import { proxy } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; exportId: string }> },
) {
  const { eventId, exportId } = await params;
  return proxy(request, "get", `/events/${eventId}/exports/${exportId}/preview`);
}
