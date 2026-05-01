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
          // Update request cookies (for downstream server components)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Re-create response with updated request
          response = NextResponse.next({ request });
          // Update response cookies (sent back to the browser)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh the session — this validates the JWT and refreshes expired tokens.
  // IMPORTANT: Use getUser() not getSession() for server-side validation.
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
  matcher: [
    // Run on all routes except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
