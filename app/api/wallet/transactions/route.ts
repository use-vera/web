import { proxy } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return proxy(request, "get", "/wallet/transactions", { forwardQuery: true });
}
