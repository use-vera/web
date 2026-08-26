import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ eventId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return proxy(request, "get", `/events/${eventId}`);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return proxy(request, "patch", `/events/${eventId}`, {
    body: await readBody(request),
  });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return proxy(request, "delete", `/events/${eventId}`);
}
