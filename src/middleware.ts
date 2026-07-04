import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/constants";

/**
 * Edge middleware cannot run the Firebase Admin SDK (it needs Node APIs),
 * so this only checks that a session cookie exists before letting the
 * request through. The dashboard layout (a server component) does the
 * real verification via `verifySessionCookie` and the per-role check —
 * this middleware is purely a fast, cheap redirect for the common case
 * of an unauthenticated visitor hitting /dashboard directly.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (pathname.startsWith("/dashboard") && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if ((pathname === "/login" || pathname === "/forgot-password") && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/forgot-password"],
};
