import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { TEMPLATES, getTemplateIds, type TemplateScope } from '@/app/(public)/jewelry/[category]/[slug]/layouts'

/** Returns the first active template valid for the given scope. */
function firstValidForScope(scope: TemplateScope): string {
  return Object.entries(TEMPLATES).find(([, t]) => t.scope.includes(scope) && t.status === 'active')?.[0] ?? 'default'
}

/**
 * Validates a stored template ID against its expected scope.
 * If the stored value is missing or cross-scoped, returns the first valid template for that scope.
 */
function resolveActive(storedId: string | undefined, scope: TemplateScope): string {
  if (!storedId) return firstValidForScope(scope)
  const t = TEMPLATES[storedId]
  return (t && t.scope.includes(scope)) ? storedId : firstValidForScope(scope)
}
import styles from './templates.module.css'
import adminStyles from '../admin.module.css'
import TemplatesClient from './TemplatesClient'

export const dynamic = 'force-dynamic'

interface ProductRow {
  sku: string
  slug: string
  name: string
  category: string | null
}

export default async function TemplatesPage() {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  const [activeRows, products, clientPages] = await Promise.all([
    sql<{ key: string; value: string }>(
      `SELECT key, value FROM admin_settings
       WHERE key IN ('active_product_template','active_proposal_template','active_showcase_template')`,
    ),
    sql<ProductRow>(
      `SELECT sku, slug, name, category FROM products WHERE active = true ORDER BY name ASC`,
    ),
    sql<{ slug: string; title: string }>(
      `SELECT slug, title FROM pages WHERE doc_type = 'showcase' AND status = 'live' ORDER BY title ASC`,
    ),
  ])

  const templateIds = getTemplateIds()
  const settingMap  = Object.fromEntries(activeRows.map(r => [r.key, r.value]))
  // Use resolveActive so that stale/cross-scoped DB values never bleed into the wrong tab.
  // e.g. if active_proposal_template was never set, it won't default to 'default' (product layout).
  const activeIds   = {
    product:  resolveActive(settingMap['active_product_template'],  'product'),
    proposal: resolveActive(settingMap['active_proposal_template'], 'proposal'),
    showcase: resolveActive(settingMap['active_showcase_template'], 'showcase'),
  }

  return (
    <div className={styles.page}>
      <div className={adminStyles.pageHeader}>
        <h1 className={adminStyles.pageTitle}>Templates</h1>
        <span className={adminStyles.syncLink}>Layout variants — product · proposal · client showcase</span>
      </div>

      <p className={styles.intro}>
        Each template is a full-page layout variant. Each view type (product, proposal, client showcase)
        has its own active default. Draft templates are only visible via preview.
        To add a new variant, ask Bezito — it writes the TSX, commits, and Vercel deploys automatically.
      </p>

      <TemplatesClient
        templateIds={templateIds}
        templates={templateIds.map(id => ({
          id,
          name: TEMPLATES[id].name,
          description: TEMPLATES[id].description,
          status: TEMPLATES[id].status,
          scope: TEMPLATES[id].scope,
        }))}
        activeIds={activeIds}
        products={products}
        clientPages={clientPages}
      />
    </div>
  )
}
