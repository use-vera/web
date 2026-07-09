import serverHttp from "@/lib/api/server-http";
import { forwardBackendError, unauthorizedResponse } from "@/lib/api/route-helpers";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  try {
    const response = await serverHttp.get("/workspaces", {
      headers: { Authorization: `Bearer ${session.token}` },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const body = await request.json();

  try {
    const response = await serverHttp.post("/workspaces", body, {
      headers: { Authorization: `Bearer ${session.token}` },
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}
