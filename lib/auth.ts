import 'server-only'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

/**
 * Shared JWT helpers for the admin dashboard and password-gated client pages.
 * The signing secret lives only in the environment — never hardcoded.
 */

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? '')

export interface SessionPayload {
  sub: string
  role: 'bez' | 'kevin' | string
  [key: string]: unknown
}

/**
 * Verify the `session` JWT cookie in a Server Component / Server Action.
 * Returns the decoded payload, or null when absent/invalid/expired.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get('session')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function requireRole(role: string): Promise<boolean> {
  const session = await getSession()
  return session?.role === role
}

/**
 * Cookie name used to remember that a visitor cleared a page password gate.
 * Value is the page slug; membership is checked per-slug.
 */
export const PAGE_GATE_COOKIE = 'ba_page_access'

/**
 * Password-gate check for a client page. Access is granted when either:
 *  - the `pw` query param matches the page password, or
 *  - the gate cookie already lists this slug.
 * Returns whether access should be granted (and whether a cookie should be set).
 */
export async function checkPageGate(
  slug: string,
  pagePassword: string | null,
  providedPw: string | undefined,
): Promise<{ granted: boolean; shouldPersist: boolean }> {
  // No password on the page → always open.
  if (!pagePassword) return { granted: true, shouldPersist: false }

  if (providedPw && providedPw === pagePassword) {
    return { granted: true, shouldPersist: true }
  }

  const cookieVal = (await cookies()).get(PAGE_GATE_COOKIE)?.value ?? ''
  const cleared = cookieVal.split(',').filter(Boolean)
  if (cleared.includes(slug)) return { granted: true, shouldPersist: false }

  return { granted: false, shouldPersist: false }
}
