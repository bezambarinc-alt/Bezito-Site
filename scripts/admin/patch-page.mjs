// patch-page.mjs — update fields on an existing page
// Usage: node scripts/admin/patch-page.mjs <slug> --json '{"status":"live","shared":true}'
//
// Patchable fields: status, shared, title, template, blocks

import { BASE_URL, agentHeaders } from './_env.mjs'

const slug = process.argv[2]
const flagIdx = process.argv.indexOf('--json')
if (!slug || flagIdx === -1 || !process.argv[flagIdx + 1]) {
  console.error('Usage: patch-page.mjs <slug> --json \'{"status":"live"}\'')
  process.exit(1)
}

let patch
try { patch = JSON.parse(process.argv[flagIdx + 1]) }
catch { console.error('Invalid JSON'); process.exit(1) }

const res = await fetch(`${BASE_URL}/api/admin/pages/${slug}`, {
  method: 'PATCH',
  headers: agentHeaders(),
  body: JSON.stringify(patch),
})

const json = await res.json().catch(() => ({}))
if (!res.ok) { console.error(`API error ${res.status}:`, JSON.stringify(json)); process.exit(1) }

console.log(`Page "${slug}" updated:`, JSON.stringify(patch))
