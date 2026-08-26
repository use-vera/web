import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

/** Forwards a base64 data URI to the backend, which stores it on Cloudinary. */
export async function POST(request: NextRequest) {
  return proxy(request, "post", "/files/upload", {
    body: await readBody(request),
  });
}
