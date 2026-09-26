import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ eventId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { eventId } = await params;
  return proxy(request, "post", `/events/${eventId}/vendors/invites`, {
    body: await readBody(request),
  });
}
