import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Mirrors the cookie name in lib/session.ts. Proxy can't use the
 * `next/headers` cookies() API (that's for Route Handlers/Server Components),
 * so it reads the raw cookie off the request instead — this is only an
 * optimistic "is there a session at all" check, not a token verification.
 * The real check still happens server-side wherever the BFF forwards the
 * bearer token to the backend.
 */
const SESSION_COOKIE = "vera_session";
const PROTECTED_ROUTES = ["/tickets", "/developers"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (!isProtectedRoute || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const redirectUrl = new URL("/", request.url);
  redirectUrl.searchParams.set("auth", "required");
  redirectUrl.searchParams.set("redirectTo", pathname);

  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/tickets", "/tickets/:path*", "/developers", "/developers/:path*"],
};
