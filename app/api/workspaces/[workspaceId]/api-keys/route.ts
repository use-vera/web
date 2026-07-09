import serverHttp from "@/lib/api/server-http";
import { forwardBackendError, unauthorizedResponse } from "@/lib/api/route-helpers";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/workspaces/[workspaceId]/api-keys">,
) {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { workspaceId } = await ctx.params;

  try {
    const response = await serverHttp.get(`/workspaces/${workspaceId}/api-keys`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/workspaces/[workspaceId]/api-keys">,
) {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { workspaceId } = await ctx.params;
  const body = await request.json();

  try {
    const response = await serverHttp.post(
      `/workspaces/${workspaceId}/api-keys`,
      body,
      { headers: { Authorization: `Bearer ${session.token}` } },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}
