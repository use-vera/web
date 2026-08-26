import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const { ticketId } = await params;
  return proxy(request, "post", `/events/tickets/${ticketId}/refund`, {
    body: await readBody(request),
  });
}
