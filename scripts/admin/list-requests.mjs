// list-requests.mjs — list all pending client page requests
// Usage: node scripts/admin/list-requests.mjs [--status pending|in_progress|done] [--json]

import { BASE_URL, agentHeaders } from './_env.mjs'

const statusIdx = process.argv.indexOf('--status')
const status = statusIdx !== -1 ? process.argv[statusIdx + 1] : null

const url = status
  ? `${BASE_URL}/api/admin/clients/requests?status=${status}`
  : `${BASE_URL}/api/admin/clients/requests`

const res = await fetch(url, { headers: agentHeaders() })
if (!res.ok) { console.error('API error:', res.status, await res.text()); process.exit(1) }

const { requests } = await res.json()
if (!requests?.length) {
  console.log(status ? `No ${status} requests.` : 'No requests found.')
  process.exit(0)
}

if (process.argv.includes('--json')) { process.stdout.write(JSON.stringify(requests)); process.exit(0) }

console.log(`\nClient page requests (${requests.length}${status ? ` — ${status}` : ''}):\n`)
for (const r of requests) {
  const date = new Date(r.created_at).toLocaleDateString()
  console.log(`  [${r.status.toUpperCase()}] ${r.client_name || r.client_id}`)
  console.log(`         SKU: ${r.product_sku || '(none)'} | Message: ${(r.message || '').slice(0, 60)}`)
  console.log(`         Date: ${date} | ID: ${r.id}`)
  console.log()
}
