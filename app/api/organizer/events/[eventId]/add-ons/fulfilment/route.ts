import { proxy } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ eventId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return proxy(request, "get", `/events/${eventId}/add-ons/fulfilment`, {
    forwardQuery: true,
  });
}
