"use server";

import { isAuthorizedEmail } from "@/lib/auth";

// Public action: Intentionally lacks requireAuth because it is used during the login flow.
export async function checkAuthorizedEmail(
  email: string | undefined | null,
): Promise<boolean> {
  return isAuthorizedEmail(email);
}
