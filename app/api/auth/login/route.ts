import serverHttp from "@/lib/api/server-http";
import { forwardBackendError } from "@/lib/api/route-helpers";
import { setSession } from "@/lib/session";
import { NextResponse } from "next/server";

/* "Chrome on Mac". Rough on purpose: it's a label, not a fingerprint. */
const describeBrowser = (userAgent: string) => {
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Chrome\//.test(userAgent)
      ? "Chrome"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Browser";
  const os = /iPhone|iPad/.test(userAgent)
    ? "iPhone"
    : /Android/.test(userAgent)
      ? "Android"
      : /Mac OS X/.test(userAgent)
        ? "Mac"
        : /Windows/.test(userAgent)
          ? "Windows"
          : "";
  return os ? `${browser} on ${os}` : browser;
};

export async function POST(request: Request) {
  const body = await request.json();

  try {
    /* Named for the signed-in devices list. The backend only sees this
       server, so the browser is described here. */
    const response = await serverHttp.post("/auth/login", {
      email: body.email,
      password: body.password,
      device: { name: describeBrowser(request.headers.get("user-agent") ?? ""), platform: "web" },
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
