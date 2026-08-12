import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import ProductsGrid from './ProductsGrid'
import styles from '../admin.module.css'

export const dynamic = 'force-dynamic'

export interface AdminProduct {
  sku: string
  slug: string
  name: string
  category: string | null
  hero_visual: string | null
  editorial_visual: string | null
  metal: string | null
  active: boolean
  featured: boolean
  sort_order: number | null
  synced_at: string | null
  view_1_url: string | null
  view_2_url: string | null
  view_3_url: string | null
}

export default async function AdminProductsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const products = await sql<AdminProduct>(
    `SELECT sku, slug, name, category, hero_visual, editorial_visual,
            metal, active, featured, sort_order, synced_at,
            view_1_url, view_2_url, view_3_url
     FROM products
     ORDER BY category ASC NULLS LAST, featured DESC, sort_order ASC NULLS LAST, name ASC`,
  )

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Products ({products.length})</h1>
      </div>
      <ProductsGrid products={products} />
    </div>
  )
}
