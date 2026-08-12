import 'server-only'
import { sql } from '@/lib/db'

/**
 * Simple DB-backed rate limiter — no external service needed.
 * Tracks attempts per IP in login_attempts table.
 * Blocks after MAX_ATTEMPTS within WINDOW_MS.
 */

const MAX_ATTEMPTS = 5
const WINDOW_MS    = 15 * 60 * 1000 // 15 minutes

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString()

  const [{ count }] = await sql<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM login_attempts
     WHERE ip = $1 AND attempted_at > $2`,
    [ip, windowStart],
  )

  const attempts = parseInt(count)
  const remaining = Math.max(0, MAX_ATTEMPTS - attempts)
  return { allowed: attempts < MAX_ATTEMPTS, remaining }
}

export async function recordAttempt(ip: string, success: boolean) {
  await sql(
    `INSERT INTO login_attempts (ip, success) VALUES ($1, $2)`,
    [ip, success],
  )
}
