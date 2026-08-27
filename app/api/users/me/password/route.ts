import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
  return proxy(request, "patch", "/users/me/password", {
    body: await readBody(request),
  });
}
