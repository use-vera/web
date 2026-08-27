import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return proxy(request, "get", "/users/me");
}

export async function PATCH(request: NextRequest) {
  return proxy(request, "patch", "/users/me", { body: await readBody(request) });
}
