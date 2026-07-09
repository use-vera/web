import serverHttp from "@/lib/api/server-http";
import { forwardBackendError, unauthorizedResponse } from "@/lib/api/route-helpers";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/workspaces/[workspaceId]/api-keys/[keyId]">,
) {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { workspaceId, keyId } = await ctx.params;
  const body = await request.json();

  try {
    const response = await serverHttp.patch(
      `/workspaces/${workspaceId}/api-keys/${keyId}`,
      body,
      { headers: { Authorization: `Bearer ${session.token}` } },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/workspaces/[workspaceId]/api-keys/[keyId]">,
) {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { workspaceId, keyId } = await ctx.params;

  try {
    const response = await serverHttp.delete(
      `/workspaces/${workspaceId}/api-keys/${keyId}`,
      { headers: { Authorization: `Bearer ${session.token}` } },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}
