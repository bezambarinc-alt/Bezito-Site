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
  console.log('Waiting 10s for sync to complete...')
  await new Promise(r => setTimeout(r, 10000))
  console.log('Done waiting.')
}
