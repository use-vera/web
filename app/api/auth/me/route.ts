import axios from "axios";
import serverHttp from "@/lib/api/server-http";
import { clearSession, getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({
      success: true,
      message: "No active session",
      data: { user: null },
    });
  }

  try {
    const response = await serverHttp.get("/auth/me", {
      headers: { Authorization: `Bearer ${session.token}` },
    });

    return NextResponse.json({
      success: true,
      message: "Session fetched",
      data: { user: response.data.data.user },
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await clearSession();
    }

    return NextResponse.json({
      success: true,
      message: "No active session",
      data: { user: null },
    });
  }
}
