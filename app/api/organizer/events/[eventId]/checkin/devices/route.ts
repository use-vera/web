import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ eventId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return proxy(request, "get", `/events/${eventId}/checkin/devices`);
}

export async function POST(request: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return proxy(request, "post", `/events/${eventId}/checkin/devices`, {
    body: await readBody(request),
  });
}
