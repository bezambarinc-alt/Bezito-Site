import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { isAuthorizedAgent, hasValidBearerSecret } from '@/lib/agent-auth'

/**
 * Analytics maintenance — daily rollup refresh + retention purge.
 *
 * Migration 007 shipped `page_views_daily`, `refresh_page_views_daily()` and
 * `purge_old_page_views()` and then nothing ever called them: the rollup sat at
 * zero rows while `page_views` grew unbounded (44k rows in the first 35 days).
 * This route is the missing scheduler half.
 *
 * ORDER IS LOAD-BEARING: roll up first, purge second. The purge drops raw rows
 * older than 90 days and the rollup is the only long-term record of them — purge
 * first and that history is gone for good.
 *
 * Backfill is automatic. Any day that exists in raw `page_views` but has no row
 * in `page_views_daily` gets recomputed, so the first run after deploy fills in
 * all history rather than starting the record from today.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 120

/** Safety valve so one run can't grind for minutes on a cold rollup. */
const MAX_BACKFILL_DAYS = 120

export async function GET(req: NextRequest) {
  // Fail closed — same posture as pim-sync. An unset CRON_SECRET means nobody
  // gets in, not "Bearer undefined gets in".
  const agentOk = await isAuthorizedAgent(req)
  if (!agentOk && !hasValidBearerSecret(req, 'CRON_SECRET', 'BEZITO_SECRET')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    // Today and yesterday always get recomputed: today is still accruing views,
    // and yesterday may have been rolled up before its last few hours landed.
    const days = new Set<string>()
    const recent = await sql<{ day: string }>(
      `SELECT (now()::date)::text AS day
       UNION SELECT (now()::date - 1)::text`,
    )
    recent.forEach((r) => days.add(r.day))

    // Plus any historical day present in raw but missing from the rollup.
    const missing = await sql<{ day: string }>(
      `SELECT DISTINCT viewed_at::date::text AS day
         FROM page_views
        WHERE is_bot = false
          AND viewed_at::date < now()::date - 1
          AND viewed_at::date NOT IN (SELECT day FROM page_views_daily)
        ORDER BY day DESC
        LIMIT $1`,
      [MAX_BACKFILL_DAYS],
    )
    missing.forEach((r) => days.add(r.day))

    // Sequential, not Promise.all: the pool is max 10 and this is a background
    // job — it has no reason to compete with live dashboard traffic for slots.
    for (const day of days) {
      await sql(`SELECT refresh_page_views_daily($1::date)`, [day])
    }

    // Counted before the delete so the response reports what was actually
    // removed. Windows mirror the function bodies: 90 days for page_views,
    // 24 hours for login_attempts (which only exists to feed rate limiting).
    const purged = await sql<{ page_views: string; login_attempts: string }>(
      `SELECT
         (SELECT COUNT(*) FROM page_views     WHERE viewed_at    < now() - interval '90 days') AS page_views,
         (SELECT COUNT(*) FROM login_attempts WHERE attempted_at < now() - interval '24 hours') AS login_attempts`,
    )

    await sql(`SELECT purge_old_page_views()`)
    await sql(`SELECT purge_old_login_attempts()`)

    return NextResponse.json({
      ok: true,
      rolledUp: days.size,
      backfilled: missing.length,
      purged: {
        pageViews:     Number(purged[0]?.page_views ?? 0),
        loginAttempts: Number(purged[0]?.login_attempts ?? 0),
      },
      truncated: missing.length === MAX_BACKFILL_DAYS,
    })
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: 'analytics-rollup', error: String((e as Error)?.message ?? e) },
      { status: 500 },
    )
  }
}
