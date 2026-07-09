import serverHttp from "@/lib/api/server-http";
import { forwardBackendError, unauthorizedResponse } from "@/lib/api/route-helpers";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/workspaces/[workspaceId]/api-keys/[keyId]/upgrade-to-live">,
) {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { workspaceId, keyId } = await ctx.params;

  try {
    const response = await serverHttp.post(
      `/workspaces/${workspaceId}/api-keys/${keyId}/upgrade-to-live`,
      undefined,
      { headers: { Authorization: `Bearer ${session.token}` } },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}
