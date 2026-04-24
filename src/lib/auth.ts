// ──────────────────────────────────────────────
// Auth — Correos autorizados y helpers
// ──────────────────────────────────────────────

/**
 * Lista de correos autorizados para acceder al panel de administración.
 * Agregar más correos aquí según sea necesario.
 */
export const AUTHORIZED_EMAILS: string[] = [
  "farce@ing.ucsc.cl",
];

/**
 * Verifica si un correo está autorizado para acceder al panel admin.
 */
export function isAuthorizedEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return AUTHORIZED_EMAILS.includes(email.toLowerCase());
}
