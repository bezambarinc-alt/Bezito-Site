/**
 * Role allowlist shared by the admin session helpers, the edge middleware,
 * and any page that verifies the `session` cookie directly.
 *
 * Edge-safe on purpose: no `server-only`, no `next/headers`, no node APIs —
 * proxy.ts runs in the edge runtime and must be able to import this.
 *
 * Why an allowlist and not `role !== 'client'`:
 * admin (`session`) and portal-client (`client_session`) JWTs are signed with
 * the same JWT_SECRET, so a client token is cryptographically valid against the
 * admin verifier. Failing closed on unknown roles means a future token type
 * can't silently inherit admin access the way `client` did.
 */

export const ADMIN_ROLES = new Set(['admin', 'viewer', 'bez', 'kevin'])

/** True only for roles permitted to hold an admin `session` cookie. */
export function isAdminRole(role: unknown): boolean {
  return typeof role === 'string' && ADMIN_ROLES.has(role)
}
