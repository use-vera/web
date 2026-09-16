import { proxy } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ ticketId: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { ticketId } = await params;
  return proxy(request, "get", `/events/tickets/${ticketId}/upgrade-options`);
}
