import { sql } from '@/lib/db'
import type { Product, ProductMedia, ProductSpecs } from '@/types/products'
import { CATEGORY_ORDER } from '@/lib/data/categories'

/**
 * Read helpers for the `products` cache (Plytix mirror).
 * Reads from individual columns (populated by the Plytix sync).
 * The `specs` / `media` JSONB columns are legacy — do not query them.
 */

/** Derive a Cloudinary still poster from a video URL (so cards always get a valid image). */
function cloudinaryPoster(videoUrl: string, seconds = 1.0): string {
  return videoUrl
    .replace('/video/upload/', `/video/upload/so_${seconds},f_jpg,w_1200,c_fit/`)
    .replace(/\.mp4$/i, '.jpg')
    .replace(/\.webm$/i, '.jpg')
}

/**
 * Detect whether a Cloudinary URL is a video or image.
 * Image extensions always win over the /video/upload/ path prefix
 * (e.g. C0878_zocjks.jpg lives under /video/upload/ but is a still).
 */
function isVideoUrl(url: string): boolean {
  if (/\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i.test(url)) return false
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return true
  return /\/video\/upload\//.test(url)
}

/** Map individual Neon columns → the Product view shape. */
function rowToProduct(r: Record<string, unknown>): Product {
  const heroVisual = r.hero_visual       as string | null
  const editVisual = r.editorial_visual  as string | null

  const heroIsVideo = heroVisual ? isVideoUrl(heroVisual) : false
  const editIsImage = editVisual ? !isVideoUrl(editVisual) : false

  // Only video URLs go into heroVideo — images get displayed as <img>
  const heroVideo  = heroIsVideo ? heroVisual : null
  // Poster is always a frame extracted from the video itself (so_1.0).
  // Using editorial_visual as poster creates a jarring mismatch jump-cut.
  const heroPoster = heroVideo
    ? cloudinaryPoster(heroVideo)                       // frame from the video
    : (!heroIsVideo ? heroVisual : null)                // hero is image → use it

  const media: ProductMedia[] = []
  if (heroVideo)        media.push({ url: heroVideo,  type: 'video', label: 'Hero', poster: heroPoster ?? undefined })
  else if (heroVisual)  media.push({ url: heroVisual, type: 'image', label: 'Hero' })
  if (editVisual && editVisual !== heroVisual)
    media.push({ url: editVisual, type: editIsImage ? 'image' : 'video', label: 'Editorial' })

  const specs: ProductSpecs = {
    category:          (r.category        as string) ?? undefined,
    collection:        (r.collection      as string) ?? undefined,
    subtitle:          (r.subtitle        as string) ?? undefined,
    lede:              (r.editorial       as string) ?? (r.description as string) ?? undefined,
    codeName:          (r.name            as string) ?? undefined,
    metal:             (r.metal           as string) ?? undefined,
    gemStone:          (r.stone_shape     as string) ?? undefined,
    caratWeight:       r.total_carat_weight != null
                         ? String(r.total_carat_weight)
                         : (r.stone_carats as string) ?? undefined,
    centerStoneWeight: r.center_stone_weight != null ? String(r.center_stone_weight) : undefined,
    color:             (r.stone_color     as string) ?? undefined,
    clarity:           (r.stone_clarity   as string) ?? undefined,
    heroVideoUrl:      heroVideo  ?? undefined,
    heroPosterUrl:     heroPoster ?? undefined,
    madeIn:            'Los Angeles',
  }

  return {
    sku:       r.sku       as string,
    slug:      r.slug      as string ?? (r.sku as string),
    view1Url:  (r.view_1_url as string | null) ?? null,
    view2Url:  (r.view_2_url as string | null) ?? null,
    view3Url:  (r.view_3_url as string | null) ?? null,
    plytixId:  r.plytix_id as string,
    name:      r.name      as string,
    specs,
    price:     null,
    media,
    syncedAt:  r.synced_at as string,
  }
}

const COLS = `
  sku, slug, plytix_id, name, category, subtitle, editorial, description,
  hero_visual, editorial_visual, metal, stone_shape, stone_carats,
  stone_color, stone_clarity, stone_notes, total_carat_weight,
  center_stone_weight, collection, active, featured, sort_order, synced_at,
  view_1_url, view_2_url, view_3_url`

export async function getProductBySlug(slug: string): Promise<Product | null> {
  // Query by slug column (URL-safe, generated from SKU at sync time).
  // Fallback to raw SKU match for backward compat with any old links.
  const [row] = await sql<Record<string, unknown>>(
    `SELECT ${COLS} FROM products WHERE (slug = $1 OR sku = $1) AND active = true LIMIT 1`,
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
      WHERE active = true AND category IS NOT NULL`,
  )
  return rows
    .map(r => r.category)
    .sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.toLowerCase())
      const bi = CATEGORY_ORDER.indexOf(b.toLowerCase())
      if (ai === -1 && bi === -1) return a.localeCompare(b) // unknowns: alphabetical at end
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
}

/** Active collections with at least one product — drives nav Collections section. */
export async function getActiveCollections(): Promise<string[]> {
  const rows = await sql<{ collection: string }>(
    `SELECT DISTINCT collection FROM products
      WHERE active = true AND collection IS NOT NULL
      ORDER BY collection ASC`,
  )
  return rows.map(r => r.collection)
}

/** Featured products — drives 'From the Atelier' nav section. */
export async function getFeaturedProducts(): Promise<Product[]> {
  const rows = await sql<Record<string, unknown>>(
    `SELECT ${COLS} FROM products WHERE active = true AND featured = true ORDER BY sort_order ASC, name ASC`,
  )
  return rows.map(rowToProduct)
}

/** All products in a named collection. */
export async function getProductsByCollection(collection: string): Promise<Product[]> {
  const rows = await sql<Record<string, unknown>>(
    `SELECT ${COLS} FROM products
      WHERE lower(collection) = lower($1) AND active = true
      ORDER BY featured DESC, sort_order ASC, name ASC`,
    [collection],
  )
  return rows.map(rowToProduct)
}

/** For generateStaticParams — { category, slug } pairs for all active products. */
export async function getAllProductParams(): Promise<{ category: string; slug: string }[]> {
  const rows = await sql<{ slug: string; category: string | null }>(
    `SELECT slug, category FROM products WHERE active = true`,
  )
  return rows.map(r => ({ category: (r.category ?? 'jewelry').toLowerCase(), slug: r.slug }))
}
