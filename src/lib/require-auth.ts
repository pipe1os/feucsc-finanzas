import { createAuthClient } from "@/lib/supabase-auth";
import { isAuthorizedEmail } from "@/lib/auth";

// Guard compartido para server actions. createAuthClient() se llama ACÁ, en
// tiempo de invocación (no al cargar el módulo), así sigue leyendo cookies()
// por request — ver AGENTS.md "Server action auth client must be created inside
// the action".
export async function requireAuth() {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isAuthorizedEmail(user.email))) {
    throw new Error("No autorizado");
  }
  return user;
}
