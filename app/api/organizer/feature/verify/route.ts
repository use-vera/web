import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return proxy(request, "post", "/events/feature/verify", {
    body: await readBody(request),
  });
}
