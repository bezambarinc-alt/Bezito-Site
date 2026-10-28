import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Admin analytics — reads from analytics_cache (GA4 snapshot, refreshed 4x/day)
 * and merges live leads counts from the leads table.
 * ?days=7|30|90  (default 30)
 */
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const daysParam = parseInt(req.nextUrl.searchParams.get('days') || '30', 10)
  const days = [7, 30, 90].includes(daysParam) ? daysParam : 30
  const since = `${days} days`

  const [cacheRows, leadsWeekRows, funnelRows] = await Promise.all([
    sql<{ data: Record<string, unknown> }>(
      `SELECT data FROM analytics_cache WHERE window_days = $1`,
      [days],
    ),
    sql<{ count: string }>(
      `SELECT COUNT(*) AS count FROM leads WHERE created_at > now() - interval '7 days'`,
    ),
    sql<{ total_leads: string; synced: string }>(
      `SELECT
        (SELECT COUNT(*) FROM leads WHERE created_at > now() - $1::interval) AS total_leads,
        (SELECT COUNT(*) FROM leads WHERE crm_status='synced' AND created_at > now() - $1::interval) AS synced`,
      [since],
    ),
  ])

  if (!cacheRows[0]) {
    return NextResponse.json(
      { error: 'analytics cache not ready — try again in a few minutes' },
      { status: 503 },
    )
  }

  const cached = cacheRows[0].data
  const n = (v: string | undefined) => parseInt(v || '0', 10)
  const f = funnelRows[0] || {} as Record<string, string>

  return NextResponse.json({
    ...cached,
    days,
    kpis: {
      ...(cached.kpis as Record<string, number>),
      leadsWeek: n(leadsWeekRows[0]?.count),
    },
    funnel: {
      ...(cached.funnel as Record<string, number>),
      totalLeads: n(f.total_leads),
      synced:     n(f.synced),
    },
  })
}
