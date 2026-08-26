import { geocodeReverse } from "@/lib/api/nominatim";
import { unauthorizedResponse } from "@/lib/api/route-helpers";
import { getSession } from "@/lib/session";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (!(await getSession())) {
    return unauthorizedResponse();
  }

  const latitude = Number(request.nextUrl.searchParams.get("lat"));
  const longitude = Number(request.nextUrl.searchParams.get("lng"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json(
      { success: false, message: "A latitude and longitude are required", details: null },
      { status: 400 },
    );
  }

  try {
    const data = await geocodeReverse(latitude, longitude);

    return NextResponse.json({ success: true, message: "ok", data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Address lookup is unavailable", details: null },
      { status: 502 },
    );
  }
}
