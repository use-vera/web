import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ orderId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { orderId } = await params;
  return proxy(request, "post", `/vendors/me/orders/${orderId}/collect`, {
    body: await readBody(request),
  });
}
