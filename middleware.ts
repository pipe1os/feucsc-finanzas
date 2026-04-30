import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Protect /admin routes: block if no Supabase auth cookie is present.
  // Full session validation happens client-side in admin/layout.tsx.
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const hasSupabaseCookie =
      request.cookies.get("sb-access-token") ||
      request.cookies.get("sb-refresh-token") ||
      request.cookies.get("sb-auth-token") ||
      Array.from(request.cookies.getAll()).some((c) =>
        c.name.startsWith("sb-")
      );

    if (!hasSupabaseCookie) {
      return NextResponse.redirect(
        new URL("/login?error=session_expired", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
