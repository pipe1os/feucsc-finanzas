import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAuthorizedEmail } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Create a Supabase client that reads/writes cookies on the request/response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update request cookies
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Re-create response with updated request
          response = NextResponse.next({ request });
          // Update response cookies (sent back to the browser)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === "production",
              httpOnly: true,
              sameSite: "lax" as const,
            }),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /admin routes: redirect if no valid session or unauthorized email
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user || !isAuthorizedEmail(user.email)) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", request.url),
      );
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
