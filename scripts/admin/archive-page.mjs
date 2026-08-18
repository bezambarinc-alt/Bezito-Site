// archive-page.mjs — soft-archive a proposal or showcase page
// Usage: node scripts/admin/archive-page.mjs <slug>
// The page is set to status='archived' in Neon — never hard-deleted.
// It stays in the DB for audit purposes but is no longer accessible.

import { BASE_URL, agentHeaders } from './_env.mjs'

const slug = process.argv[2]
if (!slug) {
  console.error('Usage: node scripts/admin/archive-page.mjs <slug>')
  console.error('Example: node scripts/admin/archive-page.mjs saraydarian-c0493-20260818-1430')
  process.exit(1)
}

const res = await fetch(`${BASE_URL}/api/admin/pages/${slug}`, {
  method: 'DELETE',
  headers: agentHeaders(),
})

const json = await res.json().catch(() => ({}))

if (res.status === 404) {
  console.error(`Page "${slug}" not found.`)
  process.exit(1)
}

if (!res.ok || json.error) {
  console.error(`API error ${res.status}:`, json.error || JSON.stringify(json))
  process.exit(1)
}

console.log(`✓ Page archived: ${slug}`)
console.log(`  Status set to 'archived' — page is no longer accessible.`)
console.log(`  Record preserved in Neon for audit history.`)
