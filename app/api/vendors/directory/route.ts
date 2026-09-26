import { proxy } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

/* The vendor directory organizers search when inviting. Named "directory" so
   it does not collide with /api/vendors/me on the same segment. */
export async function GET(request: NextRequest) {
  return proxy(request, "get", "/vendors", { forwardQuery: true });
}
