import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ ticketId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { ticketId } = await params;
  return proxy(request, "post", `/events/tickets/${ticketId}/upgrade/initialize`, {
    body: await readBody(request),
  });
}
