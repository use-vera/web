import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ eventId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return proxy(request, "get", `/events/${eventId}/page`);
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return proxy(request, "put", `/events/${eventId}/page`, {
    body: await readBody(request),
  });
}
