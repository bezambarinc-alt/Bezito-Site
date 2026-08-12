import 'server-only'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

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
    return payload as SessionPayload
  } catch {
    return null
  }
}

export async function requireRole(role: string): Promise<boolean> {
  const session = await getSession()
  return session?.role === role
}

// Re-export page-gate helpers for backward compatibility with existing imports.
export { PAGE_GATE_COOKIE, checkPageGate } from './page-gate'
