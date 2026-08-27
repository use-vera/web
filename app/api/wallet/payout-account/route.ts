import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return proxy(request, "get", "/wallet/payout-account");
}

export async function POST(request: NextRequest) {
  return proxy(request, "post", "/wallet/payout-account", {
    body: await readBody(request),
  });
}

export async function DELETE(request: NextRequest) {
  return proxy(request, "delete", "/wallet/payout-account");
}
