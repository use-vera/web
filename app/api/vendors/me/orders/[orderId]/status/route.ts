import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ orderId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { orderId } = await params;
  return proxy(request, "patch", `/vendors/me/orders/${orderId}/status`, {
    body: await readBody(request),
  });
}
