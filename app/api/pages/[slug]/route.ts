import { forwardBackendError } from "@/lib/api/route-helpers";
import serverHttp from "@/lib/api/server-http";
import { NextResponse } from "next/server";

/** Public. A published event page is the front door and needs no session. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  try {
    const response = await serverHttp.get(`/public/events/pages/${slug}`);

    return NextResponse.json(response.data);
  } catch (error) {
    return forwardBackendError(error);
  }
}
