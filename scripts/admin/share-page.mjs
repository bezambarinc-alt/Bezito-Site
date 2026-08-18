// share-page.mjs — toggle public (shared) access on a proposal page
// Usage: node scripts/admin/share-page.mjs <slug> [on|off]
// Default: on (enable public access — anyone with the link can view, no portal login needed)
// Proposals only — shared flag has no effect on showcases (they use PIN).

import { BASE_URL, agentHeaders } from './_env.mjs'

const slug = process.argv[2]
const toggle = process.argv[3] ?? 'on'

if (!slug || !['on', 'off'].includes(toggle)) {
  console.error('Usage: node scripts/admin/share-page.mjs <slug> [on|off]')
  console.error('  on  — anyone with the link can view (no portal login needed)')
  console.error('  off — portal login required (default)')
  console.error('Example: node scripts/admin/share-page.mjs saraydarian-c0493-20260818-1430 on')
  process.exit(1)
}

const shared = toggle === 'on'

const res = await fetch(`${BASE_URL}/api/admin/pages/${slug}`, {
  method: 'PATCH',
  headers: agentHeaders(),
  body: JSON.stringify({ shared }),
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

if (shared) {
  console.log(`✓ Page is now PUBLIC: ${slug}`)
  console.log(`  Anyone with the link can view — no portal login needed.`)
  console.log(`  Link: https://bezambar-nextjs.vercel.app/preview/${slug}`)
} else {
  console.log(`✓ Page is now PRIVATE: ${slug}`)
  console.log(`  Portal login (email + password) required to view.`)
}
