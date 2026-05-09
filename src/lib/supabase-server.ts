import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Cliente Supabase con service-role (solo servidor). Úsalo únicamente en Server Actions.
let _serverClient: SupabaseClient | null = null;

function getServerClient(): SupabaseClient {
  if (_serverClient) return _serverClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL no está configurada. Asegúrate de agregarla en las variables de entorno de Vercel.",
    );
  }
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está configurada. Asegúrate de agregarla en las variables de entorno de Vercel (sin el prefijo NEXT_PUBLIC_).",
    );
  }

  _serverClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return _serverClient;
}

export const supabaseServer = {
  get client(): SupabaseClient {
    return getServerClient();
  },
};
