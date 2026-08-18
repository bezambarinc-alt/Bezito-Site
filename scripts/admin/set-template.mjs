// set-template.mjs — activate a product page template globally
// Usage: node scripts/admin/set-template.mjs <template-id> [scope]
// Scope: product (default) | proposal | showcase
// Example: node scripts/admin/set-template.mjs dark proposal

import { BASE_URL, agentHeaders } from './_env.mjs'

const VALID_TEMPLATES = {
  default: ['product'],
  dark:    ['proposal', 'showcase'],
  multi:   ['proposal', 'showcase'],
}

const [,, id, scope = 'product'] = process.argv

if (!id) {
  console.error('Usage: node scripts/admin/set-template.mjs <template-id> [scope]')
  console.error('Templates:', Object.entries(VALID_TEMPLATES).map(([k,v]) => `${k} (${v.join('|')})`).join(', '))
  process.exit(1)
}

if (!VALID_TEMPLATES[id]) {
  console.error(`Unknown template "${id}". Valid: ${Object.keys(VALID_TEMPLATES).join(', ')}`)
  process.exit(1)
}

if (!VALID_TEMPLATES[id].includes(scope)) {
  console.error(`Template "${id}" is not valid for scope "${scope}". Valid scopes: ${VALID_TEMPLATES[id].join(', ')}`)
  process.exit(1)
}

const res = await fetch(`${BASE_URL}/api/admin/templates/activate`, {
  method: 'POST',
  headers: agentHeaders(),
  body: JSON.stringify({ id, scope }),
})

const json = await res.json()

if (!res.ok || json.error) {
  console.error('Failed:', json.error || res.status)
  process.exit(1)
}

console.log(`✓ Template activated: ${id} → scope: ${scope}`)
console.log(`  All ${scope} pages now render using the "${id}" layout.`)
