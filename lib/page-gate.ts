import 'server-only'
import { cookies } from 'next/headers'

/**
 * Client-page password gating — separate from admin auth.
 * Used by app/client/[slug] for password-protected marketing pages.
 */

export const PAGE_GATE_COOKIE = 'ba_page_access'

/**
 * Password-gate check for a client page. Access is granted when either:
 *  - the `pw` query param matches the page password, or
 *  - the gate cookie already lists this slug.
 */
export async function checkPageGate(
  slug: string,
  pagePassword: string | null,
  providedPw: string | undefined,
): Promise<{ granted: boolean; shouldPersist: boolean }> {
  if (!pagePassword) return { granted: true, shouldPersist: false }

  if (providedPw && providedPw === pagePassword) {
    return { granted: true, shouldPersist: true }
  }

  const cookieVal = (await cookies()).get(PAGE_GATE_COOKIE)?.value ?? ''
  const cleared = cookieVal.split(',').filter(Boolean)
  if (cleared.includes(slug)) return { granted: true, shouldPersist: false }

  return { granted: false, shouldPersist: false }
}
