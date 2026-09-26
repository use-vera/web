import { proxy, readBody } from "@/lib/api/organizer-proxy";
import { NextRequest } from "next/server";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/vendors/me/sections/[sectionId]">,
) {
  const { sectionId } = await ctx.params;

  return proxy(request, "patch", `/vendors/me/sections/${sectionId}`, {
    body: await readBody(request),
  });
}

export async function DELETE(
  request: NextRequest,
  ctx: RouteContext<"/api/vendors/me/sections/[sectionId]">,
) {
  const { sectionId } = await ctx.params;

  return proxy(request, "delete", `/vendors/me/sections/${sectionId}`);
}
