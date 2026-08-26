import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return proxy(request, "get", "/events/mine", { forwardQuery: true });
}

export async function POST(request: NextRequest) {
  return proxy(request, "post", "/events", { body: await readBody(request) });
}
