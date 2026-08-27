import { proxy } from "@/lib/api/organizer-proxy";
import { forwardBackendError } from "@/lib/api/route-helpers";
import { NextRequest, NextResponse } from "next/server";

/** Only accept and reject are real actions; anything else is a 404. */
export async function POST(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ ticketId: string; bidId: string; action: string }> },
) {
  const { ticketId, bidId, action } = await params;

  if (action !== "accept" && action !== "reject") {
    return NextResponse.json(
      { success: false, message: "Unknown action", details: null },
      { status: 404 },
    );
  }

  try {
    return await proxy(
      request,
      "post",
      `/events/tickets/${ticketId}/resale-bids/${bidId}/${action}`,
    );
  } catch (error) {
    return forwardBackendError(error);
  }
}
