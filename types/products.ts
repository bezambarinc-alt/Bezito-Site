/**
 * Product type — mirrors the Neon `products` table, which is a READ CACHE of
 * Plytix (rebuilt by the 4h cron, never the source of truth).
 * See db/schema.sql table 2.
 */

export interface ProductMedia {
  url: string
  type?: 'image' | 'video'
  /** Cloudinary public id — useful for LQIP / transform URLs. */
  publicId?: string
  label?: string
  poster?: string
}

/**
 * Free-form spec bag synced from Plytix attributes. Keys are stable Plytix
 * attribute slugs. All optional — never assume presence.
 */
export interface ProductSpecs {
  category?: string
  subtitle?: string
  lede?: string
  /** Gem credit — Princess Cut / Blaze® / Elysian Cut™ only. */
  gemStone?: string
  metal?: string
  madeIn?: string
  caratWeight?: string
  color?: string
  clarity?: string
  codeName?: string
  heroVideoUrl?: string
  heroPosterUrl?: string
  secondaryVideoUrl?: string
  [key: string]: string | undefined
}

/** Row shape as stored in Neon. `specs`/`media` are JSONB. */
export interface ProductRow {
  sku: string
  plytix_id: string
  name: string
  specs: ProductSpecs
  price: string | null
  media: ProductMedia[]
  synced_at: string
}

/** Normalized product for the view layer. */
export interface Product {
  sku: string
  plytixId: string
  name: string
  specs: ProductSpecs
  price: number | null
  media: ProductMedia[]
  syncedAt: string
}

export function toProduct(row: ProductRow): Product {
  return {
    sku: row.sku,
    plytixId: row.plytix_id,
    name: row.name,
    specs: row.specs ?? {},
    price: row.price == null ? null : Number(row.price),
    media: Array.isArray(row.media) ? row.media : [],
    syncedAt: row.synced_at,
  }
}
