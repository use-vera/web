import { geocodeSearch } from "@/lib/api/nominatim";
import { unauthorizedResponse } from "@/lib/api/route-helpers";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await getSession())) {
    return unauthorizedResponse();
  }

  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query || query.length < 3) {
    return NextResponse.json({ success: true, message: "ok", data: [] });
  }

  try {
    const data = await geocodeSearch(
      query,
      request.nextUrl.searchParams.get("countryCodes") ?? undefined,
    );

    return NextResponse.json({ success: true, message: "ok", data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Address lookup is unavailable", details: null },
      { status: 502 },
    );
  }
}
