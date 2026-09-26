import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

/* The shared upload endpoint. Vendors use it for logos and item photos; it is
   not organizer-specific, so it lives under /api/files like the backend's. */
export async function POST(request: NextRequest) {
  return proxy(request, "post", "/files/upload", {
    body: await readBody(request),
  });
}
