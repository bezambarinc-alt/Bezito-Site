import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isAuthorizedAgent } from '@/lib/agent-auth'

/**
 * GET /api/admin/clients/requests
 * List all page requests across all clients.
 * Accepts admin session cookie OR Bezito agent bearer token.
 *
 * Query params:
 *   ?status=pending|in_progress|done   (optional — omit for all)
 */
export async function GET(req: NextRequest) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')

  const requests = await sql<{
    id: number
    client_id: number
    client_name: string | null
    client_slug: string | null
    product_sku: string | null
    message: string
    status: string
    created_at: string
  }>(
    status
      ? `SELECT r.id, r.client_id, r.product_sku, r.message, r.status, r.created_at,
                c.name AS client_name, c.slug AS client_slug
         FROM page_requests r
         LEFT JOIN clients c ON c.id = r.client_id
         WHERE r.status = $1
         ORDER BY r.created_at DESC`
      : `SELECT r.id, r.client_id, r.product_sku, r.message, r.status, r.created_at,
                c.name AS client_name, c.slug AS client_slug
         FROM page_requests r
         LEFT JOIN clients c ON c.id = r.client_id
         ORDER BY r.created_at DESC`,
    status ? [status] : [],
  )

  return NextResponse.json({ requests })
}
