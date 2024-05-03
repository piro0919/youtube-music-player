import { NextRequest, NextResponse } from "next/server";
import loadStytch from "./lib/loadStytch";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const stytchSession = request.cookies.get("stytch_session");

  if (typeof stytchSession?.value === "undefined") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const stytchClient = loadStytch();

  try {
    await stytchClient.sessions.authenticate({
      // 366 days
      session_duration_minutes: 527040,
      session_token: stytchSession.value,
    });

    const response = NextResponse.next();

    return response;
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|authenticate|.*\\.webp$).*)",
  ],
};
