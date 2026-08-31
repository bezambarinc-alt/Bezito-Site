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
  /** Named collection this piece belongs to (e.g. "Bloom", "Eshed"). */
  collection?: string
  subtitle?: string
  lede?: string
  /** Gem credit — Princess Cut / Blaze® / Elysian Cut™ only. */
  gemStone?: string
  metal?: string
  madeIn?: string
  /** Total carat weight of all stones. Prefers total_carat_weight column; falls back to stone_carats. */
  caratWeight?: string
  /** Center stone weight — if applicable (empty for tennis/eternity pieces). */
  centerStoneWeight?: string
  color?: string
  clarity?: string
  codeName?: string
  heroVideoUrl?: string
  heroPosterUrl?: string
  secondaryVideoUrl?: string
  [key: string]: string | undefined
}

/** Normalized product for the view layer. */
export interface Product {
  sku: string
  slug: string   // URL-safe version of sku — lowercase, non-alphanumeric → hyphen
  view1Url: string | null
  view2Url: string | null
  view3Url: string | null
  zohoId: string
  name: string
  featured: boolean
  specs: ProductSpecs
  price: number | null
  media: ProductMedia[]
  syncedAt: string
}

// toProduct() removed — JSONB-era mapper, superseded by rowToProduct() in lib/queries.ts
