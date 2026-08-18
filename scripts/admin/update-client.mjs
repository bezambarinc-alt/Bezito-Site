// update-client.mjs — update a client account (name, email, password reset)
// Usage: node scripts/admin/update-client.mjs <name-or-slug-or-id> --json '{"name":"...","contact_email":"...","password":"..."}'
// Patchable fields: name, contact_email, password, active (true/false)

import { BASE_URL, agentHeaders } from './_env.mjs'

const query = process.argv[2]
const flagIdx = process.argv.indexOf('--json')

if (!query || flagIdx === -1 || !process.argv[flagIdx + 1]) {
  console.error('Usage: update-client.mjs <name-or-slug-or-id> --json \'{"contact_email":"new@email.com"}\'')
  console.error('Fields: name · contact_email · password · active (true/false)')
  process.exit(1)
}

let patch
try { patch = JSON.parse(process.argv[flagIdx + 1]) }
catch { console.error('Invalid JSON'); process.exit(1) }

// Resolve client → get numeric ID
const listRes = await fetch(`${BASE_URL}/api/admin/clients`, { headers: agentHeaders() })
if (!listRes.ok) { console.error('Failed to fetch clients:', listRes.status); process.exit(1) }

const { clients } = await listRes.json()
const q = query.toLowerCase()
const match = clients.find(c =>
  String(c.id) === query ||
  c.slug === q ||
  c.name.toLowerCase().includes(q) ||
  c.contact_email?.toLowerCase().includes(q)
)

if (!match) {
  console.error(`Client not found: "${query}"`)
  console.log('Run list-clients.mjs to see all clients.')
  process.exit(1)
}

console.log(`Updating client: ${match.name} (id: ${match.id})`)

const res = await fetch(`${BASE_URL}/api/admin/clients/${match.id}`, {
  method: 'PATCH',
  headers: agentHeaders(),
  body: JSON.stringify(patch),
})

const json = await res.json().catch(() => ({}))
if (!res.ok || json.error) {
  console.error(`API error ${res.status}:`, json.error || JSON.stringify(json))
  process.exit(1)
}

console.log(`✓ Client updated: ${match.name}`)
const display = { ...patch }
if (display.password) display.password = '(reset — not shown)'
console.log('  Fields updated:', JSON.stringify(display))
