// trigger-sync.mjs — force Plytix → Neon sync and wait for completion
// Usage: node scripts/admin/trigger-sync.mjs [--wait]

import { BASE_URL, agentHeaders } from './_env.mjs'

console.log('Triggering Plytix → Neon sync...')

const res = await fetch(`${BASE_URL}/api/cron/plytix-sync`, { headers: agentHeaders() })
const json = await res.json().catch(() => ({}))

if (!res.ok) {
  console.error(`Sync trigger failed (${res.status}):`, JSON.stringify(json))
  process.exit(1)
}

console.log(`Sync triggered. Response:`, JSON.stringify(json))

if (process.argv.includes('--wait')) {
  // The sync endpoint runs synchronously — the JSON response above already
  // reflects a completed run (listed/upserted/deleted counts). There is no
  // async job to poll. A short settle gives edge-cache revalidation time to propagate.
  const SETTLE_MS = 5000
  console.log(`Sync complete. Settling ${SETTLE_MS / 1000}s for cache revalidation...`)
  await new Promise(r => setTimeout(r, SETTLE_MS))
  console.log('Done.')
}
