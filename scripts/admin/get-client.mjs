// get-client.mjs — resolve client name/slug/id → full client record
// Usage: node scripts/admin/get-client.mjs <name-or-slug-or-id> [--json]
// Exits 1 if not found

import { BASE_URL, agentHeaders } from './_env.mjs'

const query = process.argv[2]
if (!query) { console.error('Usage: get-client.mjs <name-or-slug-or-id>'); process.exit(1) }

const res = await fetch(`${BASE_URL}/api/admin/clients`, { headers: agentHeaders() })
if (!res.ok) { console.error('API error:', res.status, await res.text()); process.exit(1) }

const { clients } = await res.json()
const q = query.toLowerCase()

const match = clients.find(c =>
  c.id === query ||
  c.slug === q ||
  c.name.toLowerCase().includes(q) ||
  c.email?.toLowerCase().includes(q)
)

if (!match) {
  console.error(`Client not found: "${query}"`)
  console.log('Run list-clients.mjs to see all clients.')
  process.exit(1)
}

if (process.argv.includes('--json')) { process.stdout.write(JSON.stringify(match)); process.exit(0) }

console.log(`\nClient found:`)
console.log(`  Name:   ${match.name}`)
console.log(`  Slug:   ${match.slug}`)
console.log(`  ID:     ${match.id}`)
console.log(`  Email:  ${match.email || '(none)'}`)
console.log(`  Active: ${match.active}`)
console.log()
