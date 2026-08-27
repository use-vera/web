import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return proxy(request, "post", "/wallet/payout-account/preview", {
    body: await readBody(request),
  });
}
