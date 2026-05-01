import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltan las variables de entorno de Supabase");
}

/**
 * Browser client that persists the session in cookies.
 * Required so the server middleware can read the auth state.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
