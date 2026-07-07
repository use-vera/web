import serverHttp from "@/lib/api/server-http";
import { clearSession, getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await getSession();

  if (session?.refreshToken) {
    await serverHttp
      .post("/auth/logout", { refreshToken: session.refreshToken })
      .catch(() => null);
  }

  await clearSession();

  return NextResponse.json({ success: true, message: "Signed out", data: null });
}
