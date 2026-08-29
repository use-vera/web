import { forwardBackendError, unauthorizedResponse } from "@/lib/api/route-helpers";
import serverHttp from "@/lib/api/server-http";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

/**
 * Unlike every other organizer route this one streams a file rather than the
 * JSON envelope, so it can't go through the shared proxy. It forwards the
 * body bytes plus the content-type and filename the backend set.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; exportId: string }> },
) {
  const session = await getSession();

  if (!session) {
    return unauthorizedResponse();
  }

  const { eventId, exportId } = await params;

  try {
    const response = await serverHttp.get(
      `/events/${eventId}/exports/${exportId}/download`,
      {
        headers: { Authorization: `Bearer ${session.token}` },
        responseType: "arraybuffer",
      },
    );

    return new NextResponse(response.data as ArrayBuffer, {
      status: 200,
      headers: {
        "Content-Type":
          (response.headers["content-type"] as string) ?? "application/octet-stream",
        "Content-Disposition":
          (response.headers["content-disposition"] as string) ??
          `attachment; filename="export-${exportId}.csv"`,
      },
    });
  } catch (error) {
    return forwardBackendError(error);
  }
}
