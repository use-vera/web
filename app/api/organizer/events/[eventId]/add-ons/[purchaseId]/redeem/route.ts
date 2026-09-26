import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ eventId: string; purchaseId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { eventId, purchaseId } = await params;

  return proxy(request, "post", `/events/${eventId}/add-ons/${purchaseId}/redeem`, {
    body: await readBody(request),
  });
}
