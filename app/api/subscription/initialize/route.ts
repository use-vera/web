import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return proxy(request, "post", "/subscriptions/premium/initialize", {
    body: await readBody(request),
  });
}
