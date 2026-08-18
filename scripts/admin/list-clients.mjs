// list-clients.mjs — list all portal clients
// Usage: node scripts/admin/list-clients.mjs [--json]

import { BASE_URL, agentHeaders } from './_env.mjs'

const res = await fetch(`${BASE_URL}/api/admin/clients`, { headers: agentHeaders() })
if (!res.ok) { console.error('API error:', res.status, await res.text()); process.exit(1) }

const { clients } = await res.json()
if (!clients?.length) { console.log('No clients found.'); process.exit(0) }

if (process.argv.includes('--json')) { process.stdout.write(JSON.stringify(clients)); process.exit(0) }

console.log(`\nPortal clients (${clients.length}):\n`)
for (const c of clients) {
  const status = c.active ? '✓' : '✗'
  console.log(`  [${status}] ${c.name.padEnd(30)} slug: ${c.slug.padEnd(20)} id: ${c.id}`)
  if (c.email) console.log(`       email: ${c.email}`)
}
console.log()
