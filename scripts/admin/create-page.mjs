// create-page.mjs — create a proposal or showcase page in the Next.js admin
// Usage: node scripts/admin/create-page.mjs --json '{...}'
//
// JSON payload fields:
//   client_id     string  required
//   slug          string  required — [client-slug]-[sku]-YYYYMMDD-HHMM
//   title         string  required
//   doc_type      string  'proposal' | 'showcase'
//   template      string  'dark' | 'multi' | 'multi-piece'
//   status        string  'draft' | 'live'   (default: draft)
//   blocks        array   [{product_id, sku, name, hero_url, editorial_url, ...}]
//   shared        bool    false = portal-auth required, true = anyone with link
//
// Exits 0 with JSON {id, slug, url} on success

import { BASE_URL, agentHeaders } from './_env.mjs'

const flagIdx = process.argv.indexOf('--json')
if (flagIdx === -1 || !process.argv[flagIdx + 1]) {
  console.error('Usage: create-page.mjs --json \'{"client_id":"...","slug":"...","title":"...","doc_type":"proposal","template":"dark","blocks":[...]}\'')
  process.exit(1)
}

let payload
try { payload = JSON.parse(process.argv[flagIdx + 1]) }
catch { console.error('Invalid JSON payload'); process.exit(1) }

const required = ['client_id', 'slug', 'title', 'doc_type', 'template', 'blocks']
const missing = required.filter(f => !payload[f])
if (missing.length) { console.error('Missing required fields:', missing.join(', ')); process.exit(1) }

if (!['proposal', 'showcase'].includes(payload.doc_type)) {
  console.error('doc_type must be "proposal" or "showcase"'); process.exit(1)
}

const body = {
  client_id: payload.client_id,
  slug: payload.slug,
  title: payload.title,
  doc_type: payload.doc_type,
  template_id: payload.template,
  status: payload.status || 'draft',
  blocks: payload.blocks,
  shared: payload.shared || false,
}

const res = await fetch(`${BASE_URL}/api/admin/pages`, {
  method: 'POST',
  headers: agentHeaders({ 'Idempotency-Key': `create-page:${payload.slug}` }),
  body: JSON.stringify(body),
})

const json = await res.json().catch(() => ({}))
if (!res.ok) {
  console.error(`API error ${res.status}:`, JSON.stringify(json))
  process.exit(1)
}

const url = `${BASE_URL}/preview/${payload.slug}`
const result = { id: json.id || json.page?.id, slug: payload.slug, url }

console.log(`\nPage created: ${url}`)
console.log(`  ID: ${result.id}`)
console.log(`  Status: ${body.status}`)
console.log(`  Access: ${body.shared ? 'Public (anyone with link)' : 'Private (portal login required)'}`)
console.log()

process.stdout.write(JSON.stringify(result))
