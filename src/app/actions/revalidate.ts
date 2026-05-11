"use server";

import { createAuthClient } from "@/lib/supabase-auth";
import { isAuthorizedEmail } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAuth() {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !(await isAuthorizedEmail(user.email))) {
    throw new Error("No autorizado");
  }
  return user;
}

export async function revalidatePublicPages() {
  await requireAuth();
  revalidatePath("/");
  revalidatePath("/gastos");
}
