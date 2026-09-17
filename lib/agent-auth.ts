import 'server-only'
import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { timingSafeEqual } from 'node:crypto'

/**
 * Agent auth — short-lived JWT signed with BEZITO_SECRET.
 * Allows Bezito scripts to call admin API routes without a browser session.
 *
 * Pattern in route handlers:
 *   const session = await getSession()
 *   const agentOk = await isAuthorizedAgent(req)
 *   if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *   const actor = session?.sub ?? 'bezito-agent'
 *
 * Security notes:
 *   - BEZITO_SECRET must be set in env; if absent, always returns false (fail-closed)
 *   - Scripts mint a 15-min JWT signed with BEZITO_SECRET; this verifies signature + expiry
 *   - Agent requests are logged to audit_log with actor='bezito-agent'
 */
export async function isAuthorizedAgent(req: NextRequest): Promise<boolean> {
  const secret = process.env.BEZITO_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization') ?? ''
  if (!auth.startsWith('Bearer ')) return false
  try {
    await jwtVerify(auth.slice(7), new TextEncoder().encode(secret))
    return true
  } catch {
    return false
  }
}

/**
 * Constant-time check of `Authorization: Bearer <secret>` against one or more
 * named env secrets. Node runtime only (uses node:crypto).
 *
 * Fail-closed by construction. The pattern this replaces —
 *   `auth !== \`Bearer ${process.env.CRON_SECRET}\``
 * — interpolates an unset env var to the literal string "Bearer undefined",
 * so anyone who sent that header authenticated. An unset secret here is simply
 * skipped, and with no candidates left the function returns false.
 */
export function hasValidBearerSecret(req: NextRequest, ...envVars: string[]): boolean {
  const auth = req.headers.get('authorization') ?? ''
  if (!auth.startsWith('Bearer ')) return false
  const presented = Buffer.from(auth.slice(7), 'utf8')

  let ok = false
  for (const name of envVars) {
    const secret = process.env[name]
    if (!secret) continue // unset → not a valid credential, never a match
    const expected = Buffer.from(secret, 'utf8')
    // timingSafeEqual throws on length mismatch, so length is checked first.
    // No early return: keep the work uniform across candidates.
    if (expected.length === presented.length && timingSafeEqual(expected, presented)) ok = true
  }
  return ok
}
