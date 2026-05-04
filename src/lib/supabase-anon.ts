import { createClient } from "@supabase/supabase-js";

/**
 * Lightweight, anonymous Supabase client for server-side data fetching in RSC.
 * 
 * Uses the anon key (same as browser client) but avoids importing the
 * browser-specific `createBrowserClient` and its cookie/session plumbing,
 * which would unnecessarily inflate the client JS bundle when imported
 * from Server Components like `page.tsx`.
 *
 * This is NOT the service-role client — it respects RLS policies.
 * For mutations that need elevated privileges, use `supabaseServer` from
 * `@/lib/supabase-server.ts`.
 */
export const supabaseAnon = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: { autoRefreshToken: false, persistSession: false },
  }
);
