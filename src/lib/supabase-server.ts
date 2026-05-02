import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _serverClient: SupabaseClient | null = null;

function getServerClient(): SupabaseClient {
  if (_serverClient) return _serverClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL no está configurada. Asegúrate de agregarla en las variables de entorno de Vercel."
    );
  }
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está configurada. Asegúrate de agregarla en las variables de entorno de Vercel (sin el prefijo NEXT_PUBLIC_)."
    );
  }

  _serverClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return _serverClient;
}

/**
 * Service-role Supabase client for direct DB mutations in server actions.
 * Uses lazy initialization to avoid module-level crashes when env vars
 * are missing during cold starts in Vercel serverless functions.
 *
 * IMPORTANT: Only use in trusted server contexts (server actions).
 * Never expose this client or the service role key to the browser.
 */
export const supabaseServer = {
  /**
   * Access the underlying Supabase client.
   * Throws a clear error if env vars are missing instead of a cryptic module crash.
   *
   * Usage: supabaseServer.client.from("gastos").insert(...)
   */
  get client(): SupabaseClient {
    return getServerClient();
  },
};
