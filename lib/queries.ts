import { sql } from '@/lib/db'
import type { Product, ProductMedia, ProductSpecs } from '@/types/products'

/**
 * Read helpers for the `products` cache (Plytix mirror).
 * Reads from individual columns (populated by the Plytix sync).
 * The `specs` / `media` JSONB columns are legacy — do not query them.
 */

/** Map individual Neon columns → the Product view shape. */
function rowToProduct(r: Record<string, unknown>): Product {
  const heroVideo  = r.hero_visual  as string | null
  const heroPoster = r.editorial_visual as string | null

  const media: ProductMedia[] = []
  if (heroVideo)  media.push({ url: heroVideo,  type: 'video', label: 'Hero',      poster: heroPoster ?? undefined })
  if (heroPoster) media.push({ url: heroPoster, type: 'image', label: 'Editorial' })

  const specs: ProductSpecs = {
    category:          (r.category        as string) ?? undefined,
    subtitle:          (r.subtitle        as string) ?? undefined,
    lede:              (r.editorial       as string) ?? (r.description as string) ?? undefined,
    codeName:          (r.name            as string) ?? undefined,
    metal:             (r.metal           as string) ?? undefined,
    gemStone:          (r.stone_shape     as string) ?? undefined,
    caratWeight:       (r.stone_carats    as string) ?? undefined,
    color:             (r.stone_color     as string) ?? undefined,
    clarity:           (r.stone_clarity   as string) ?? undefined,
    heroVideoUrl:      heroVideo  ?? undefined,
    heroPosterUrl:     heroPoster ?? undefined,
    madeIn:            'Los Angeles',
  }

  return {
    sku:       r.sku       as string,
    plytixId:  r.plytix_id as string,
    name:      r.name      as string,
    specs,
    price:     null,
    media,
    syncedAt:  r.synced_at as string,
  }
}

const COLS = `
  sku, plytix_id, name, category, subtitle, editorial, description,
  hero_visual, editorial_visual, metal, stone_shape, stone_carats,
  stone_color, stone_clarity, active, featured, sort_order, synced_at`

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const [row] = await sql<Record<string, unknown>>(
    `SELECT ${COLS} FROM products WHERE sku = $1 AND active = true`,
    [slug],
  )
  return row ? rowToProduct(row) : null
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const rows = await sql<Record<string, unknown>>(
    `SELECT ${COLS} FROM products
      WHERE lower(category) = lower($1) AND active = true
      ORDER BY featured DESC, sort_order ASC, name ASC`,
    [category],
  )
  return rows.map(rowToProduct)
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await sql<Record<string, unknown>>(
    `SELECT ${COLS} FROM products WHERE active = true
      ORDER BY category ASC, featured DESC, sort_order ASC, name ASC`,
  )
  return rows.map(rowToProduct)
}

/** Active categories with at least one product — drives nav + jewelry landing. */
export async function getActiveCategories(): Promise<string[]> {
  const rows = await sql<{ category: string }>(
    `SELECT DISTINCT category FROM products
      WHERE active = true AND category IS NOT NULL
      ORDER BY category ASC`,
  )
  return rows.map(r => r.category)
}

/** For generateStaticParams — { category, slug } pairs for all active products. */
export async function getAllProductParams(): Promise<{ category: string; slug: string }[]> {
  const rows = await sql<{ sku: string; category: string | null }>(
    `SELECT sku, category FROM products WHERE active = true`,
  )
  return rows.map(r => ({ category: (r.category ?? 'jewelry').toLowerCase(), slug: r.sku }))
}
