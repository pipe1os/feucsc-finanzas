"use server";

import { isAuthorizedEmail } from "@/lib/auth";

// Public action: Intentionally lacks requireAuth because it is used during the login flow.
// react-doctor-disable-next-line react-doctor/server-auth-actions
export async function checkAuthorizedEmail(
  email: string | undefined | null,
): Promise<boolean> {
  return isAuthorizedEmail(email);
}
