import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ eventId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return proxy(request, "patch", `/events/${eventId}/vendors/settings`, {
    body: await readBody(request),
  });
}
