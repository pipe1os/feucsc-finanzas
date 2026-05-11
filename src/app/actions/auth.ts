"use server";

import { isAuthorizedEmail } from "@/lib/auth";

export async function checkAuthorizedEmail(
  email: string | undefined | null,
): Promise<boolean> {
  return isAuthorizedEmail(email);
}
