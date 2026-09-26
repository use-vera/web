import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

type Params = { params: Promise<{ bookingId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { bookingId } = await params;

  return proxy(
    request,
    "post",
    `/vendors/me/bookings/${bookingId}/stall-fee/verify`,
    { body: await readBody(request) },
  );
}
