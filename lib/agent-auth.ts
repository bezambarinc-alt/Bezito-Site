import 'server-only'
import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

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
