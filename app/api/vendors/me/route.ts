import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return proxy(request, "get", "/vendors/me");
}

export async function POST(request: NextRequest) {
  return proxy(request, "post", "/vendors/me", {
    body: await readBody(request),
  });
}

export async function PATCH(request: NextRequest) {
  return proxy(request, "patch", "/vendors/me", {
    body: await readBody(request),
  });
}
