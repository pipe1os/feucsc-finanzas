// Whitelist de correos con acceso a /admin.
export const AUTHORIZED_EMAILS: string[] = ["farce@ing.ucsc.cl"];

export function isAuthorizedEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return AUTHORIZED_EMAILS.includes(email.toLowerCase());
}
