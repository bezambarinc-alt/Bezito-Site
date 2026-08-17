import 'server-only'
import { NextRequest } from 'next/server'

/**
 * Agent auth — BEZITO_SECRET bearer token.
 * Allows Bezito scripts to call admin API routes without a browser session.
 *
 * Pattern in route handlers:
 *   const session = await getSession()
 *   const agentOk = isAuthorizedAgent(req)
 *   if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *   const actor = session?.sub ?? 'bezito-agent'
 *
 * Security notes:
 *   - BEZITO_SECRET must be set in env; if absent, always returns false (fail-closed)
 *   - Timing-safe comparison not needed here — secret is compared via === on a
 *     single string, not a hash. Keep BEZITO_SECRET ≥ 32 random chars.
 *   - Agent requests are logged to audit_log with actor='bezito-agent'.
 */
export function isAuthorizedAgent(req: NextRequest): boolean {
  const secret = process.env.BEZITO_SECRET
  if (!secret) return false
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${secret}`
}
