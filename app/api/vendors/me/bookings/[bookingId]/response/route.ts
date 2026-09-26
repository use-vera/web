import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ bookingId: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { bookingId } = await params;
  return proxy(request, "patch", `/vendors/me/bookings/${bookingId}/response`, {
    body: await readBody(request),
  });
}
