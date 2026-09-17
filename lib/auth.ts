import 'server-only'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { isAdminRole } from './roles'

/**
 * Admin session auth — JWT verification for the admin dashboard.
 * The signing secret lives only in the environment — never hardcoded.
 *
 * NOTE: client-page password gating lives in lib/page-gate.ts (separate concern).
 */

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export interface SessionPayload {
  sub: string
  role: 'bez' | 'kevin' | 'admin' | string
  method?: 'pin' | 'password'
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
    // Portal-client tokens are signed with the same secret and therefore verify
    // here. Without this check a `client_session` JWT replayed as `session`
    // grants full admin. Mirror of the guard in lib/client-auth.ts.
    if (!isAdminRole(payload.role)) return null
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
 * Returns the session for any authenticated non-viewer user.
 * Use on admin write routes that viewers must not access
 * (user management, pin/whitelist changes).
 */
export async function requirePrivileged(): Promise<SessionPayload | null> {
  const session = await getSession()
  if (!session) return null
  if (session.role === 'viewer') return null
  return session
}

// Re-export page-gate helpers for backward compatibility with existing imports.
export { PAGE_GATE_COOKIE, checkPageGate } from './page-gate'
