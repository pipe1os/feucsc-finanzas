import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Creates a Supabase server client that reads auth cookies from the request.
 * Use this in Server Actions and Server Components to verify the user's session.
 *
 * IMPORTANT: This must be called per-request (not cached as a singleton)
 * because it reads from `cookies()` which is request-scoped.
 */
export async function createAuthClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, {
              ...options,
              secure: process.env.NODE_ENV === "production",
              httpOnly: true,
              sameSite: "lax" as const,
            }),
          );
        } catch {
          // setAll called from a Server Component (read-only context).
          // Middleware handles token refresh, so this is safe to ignore.
        }
      },
    },
  });
}
