import serverHttp from "@/lib/api/server-http";
import { forwardBackendError } from "@/lib/api/route-helpers";
import { setSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const response = await serverHttp.post("/auth/login", {
      email: body.email,
      password: body.password,
    });

    const { user, token, refreshToken } = response.data.data;
    await setSession({ token, refreshToken });

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: { user },
    });
  } catch (error) {
    return forwardBackendError(error);
  }
}
