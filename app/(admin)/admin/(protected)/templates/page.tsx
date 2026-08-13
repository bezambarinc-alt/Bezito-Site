import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { TEMPLATES, getTemplateIds } from '@/app/(public)/jewelry/[category]/[slug]/layouts'
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

  const [active, products] = await Promise.all([
    sql<{ value: string }>(
      `SELECT value FROM admin_settings WHERE key = 'active_product_template' LIMIT 1`,
    ).then(r => r[0]?.value ?? 'default'),
    sql<ProductRow>(
      `SELECT sku, slug, name, category FROM products WHERE active = true ORDER BY name ASC`,
    ),
  ])

  const templateIds = getTemplateIds()

  return (
    <div className={styles.page}>
      <div className={adminStyles.pageHeader}>
        <h1 className={adminStyles.pageTitle}>Templates</h1>
        <span className={adminStyles.syncLink}>Product page layout variants</span>
      </div>

      <p className={styles.intro}>
        Each template is a full-page layout variant for the product detail page.
        The active template renders for all visitors. Draft templates are only visible via preview.
        To add a new variant, ask Bezito — it writes the TSX, commits, and Vercel deploys automatically.
      </p>

      <TemplatesClient
        templateIds={templateIds}
        templates={templateIds.map(id => ({
          id,
          name: TEMPLATES[id].name,
          description: TEMPLATES[id].description,
          status: TEMPLATES[id].status,
        }))}
        activeId={active}
        products={products}
      />
    </div>
  )
}
