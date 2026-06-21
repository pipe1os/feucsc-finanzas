import { createClient } from "@supabase/supabase-js";

export async function isAuthorizedEmail(
  email: string | undefined | null,
): Promise<boolean> {
  if (!email) return false;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data, error } = await supabase
      .from("admins")
      .select("email")
      .eq("email", email.toLowerCase())
      .single();

    if (error || !data) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("isAuthorizedEmail error:", error);
    return false;
  }
}
