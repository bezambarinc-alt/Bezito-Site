import 'server-only'
import { sql } from '@/lib/db'

const TTL_DAYS = 30

/**
 * Returns true if the IP is in the whitelist and not expired.
 * Unknown/empty IPs are never considered whitelisted.
 */
export async function isIpWhitelisted(ip: string): Promise<boolean> {
  if (!ip || ip === 'unknown') return false
  const [row] = await sql<{ exists: boolean }>(
    `SELECT EXISTS(
       SELECT 1 FROM whitelisted_ips
       WHERE ip_address = $1 AND expires_at > now()
     ) AS exists`,
    [ip],
  )
  return row?.exists ?? false
}

/**
 * Adds or refreshes a whitelisted IP for TTL_DAYS days.
 * Upserts on ip_address — calling again from the same IP resets the clock.
 */
export async function addToWhitelist(ip: string, label?: string): Promise<void> {
  if (!ip || ip === 'unknown') return
  await sql(
    `INSERT INTO whitelisted_ips (ip_address, label, expires_at)
     VALUES ($1, $2, now() + interval '${TTL_DAYS} days')
     ON CONFLICT (ip_address) DO UPDATE
       SET expires_at = now() + interval '${TTL_DAYS} days',
           label      = COALESCE($2, whitelisted_ips.label)`,
    [ip, label ?? null],
  )
}

/** Immediately removes an IP from the whitelist (admin action or manual revoke). */
export async function removeFromWhitelist(ip: string): Promise<void> {
  await sql(`DELETE FROM whitelisted_ips WHERE ip_address = $1`, [ip])
}
