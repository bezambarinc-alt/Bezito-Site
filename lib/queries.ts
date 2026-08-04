import { sql } from '@/lib/db'
import { toProduct, type Product, type ProductRow } from '@/types/products'

/**
 * Read helpers for the `products` cache (Plytix mirror). These are safe to call
 * from ISR pages — the table is rebuilt by the 4h Plytix sync cron.
 */

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // `slug` is the SKU in the products cache.
  const [row] = await sql<ProductRow>(
    `SELECT sku, plytix_id, name, specs, price, media, synced_at
       FROM products WHERE sku = $1`,
    [slug],
  )
  return row ? toProduct(row) : null
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const rows = await sql<ProductRow>(
    `SELECT sku, plytix_id, name, specs, price, media, synced_at
       FROM products
      WHERE lower(specs->>'category') = lower($1)
      ORDER BY name ASC`,
    [category],
  )
  return rows.map(toProduct)
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await sql<ProductRow>(
    `SELECT sku, plytix_id, name, specs, price, media, synced_at
       FROM products ORDER BY synced_at DESC`,
  )
  return rows.map(toProduct)
}

/** For generateStaticParams — returns { category, slug } pairs. */
export async function getAllProductParams(): Promise<{ category: string; slug: string }[]> {
  const rows = await sql<{ sku: string; category: string | null }>(
    `SELECT sku, specs->>'category' AS category FROM products`,
  )
  return rows.map((r) => ({ category: (r.category ?? 'jewelry').toLowerCase(), slug: r.sku }))
}
