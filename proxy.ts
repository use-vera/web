import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Mirrors the cookie name in lib/session.ts. Proxy can't use the
 * `next/headers` cookies() API (that's for Route Handlers/Server Components),
 * so it reads the raw cookie off the request instead. This is only an
 * optimistic "is there a session at all" check, not a token verification.
 * The real check still happens server-side wherever the BFF forwards the
 * bearer token to the backend.
 */
const SESSION_COOKIE = "vera_session";
/* The developer portal is deliberately absent here apart from its keys page:
   the docs and the API reference are what someone reads while deciding
   whether to integrate at all, and a sign-in wall in front of them turns
   away the reader before they have seen anything. Only real keys need an
   account. */
const PROTECTED_ROUTES = ["/tickets", "/developers/keys", "/vendors/onboarding", "/vendors/menu", "/vendors/events", "/vendors/orders", "/vendors/money", "/vendors/verification"];

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
  matcher: [
    "/tickets",
    "/tickets/:path*",
    "/developers/keys",
    "/vendors/onboarding",
    "/vendors/menu",
    "/vendors/menu/:path*",
    "/vendors/events",
    "/vendors/orders",
    "/vendors/orders/:path*",
    "/vendors/money",
    "/vendors/verification",
  ],
};
