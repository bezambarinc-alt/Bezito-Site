import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { sql } from '@/lib/db'
import { isAuthorizedAgent } from '@/lib/agent-auth'
import { getZohoToken, invalidateZohoToken } from '@/lib/zoho-auth'

/**
 * Zoho CRM Products → Neon products cache sync.
 *
 * Replaces the Plytix sync (2026-08-31). Zoho CRM Products is now the PIM.
 * Darryl creates/edits products in Zoho CRM; this cron pushes them to Neon
 * which feeds bezambar.com.
 *
 * Field mapping: Zoho CRM Products → Neon products table
 *   Product_Name        → name
 *   Product_Code        → sku  (also used to derive slug)
 *   Product_Category    → category (title-case → lowercase)
 *   id                  → zoho_id (Zoho CRM Products record ID)
 *   Subtitle            → subtitle
 *   Editorial           → editorial
 *   Metal               → metal
 *   Stone_Shape         → stone_shape
 *   Stone_Color         → stone_color
 *   Stone_Clarity       → stone_clarity
 *   Stone_Carats        → stone_carats
 *   Stone_Notes         → stone_notes
 *   Total_Carat_Weight  → total_carat_weight
 *   Center_Stone_Weight → center_stone_weight
 *   Collection          → collection
 *   Hero_Visual         → hero_visual
 *   Editorial_Visual    → editorial_visual
 *   Visual_Top          → view_1_url
 *   Visual_Concept      → view_2_url
 *   Visual_Stone_Sketch → view_3_url
 *
 * NOTE: active + featured are Neon-only. NOT synced from Zoho. Managed via admin PATCH.
 */

export const maxDuration = 300
export const dynamic = 'force-dynamic'

const ZOHO_CRM_BASE = 'https://www.zohoapis.com/crm/v3'
const FIELDS = [
  'Product_Name', 'Product_Code', 'Product_Category', 'Product_Active',
  'Subtitle', 'Editorial', 'Metal',
  'Stone_Shape', 'Stone_Color', 'Stone_Clarity', 'Stone_Carats', 'Stone_Notes',
  'Total_Carat_Weight', 'Center_Stone_Weight', 'Collection',
  'Hero_Visual', 'Editorial_Visual',
  'Visual_Top', 'Visual_Concept', 'Visual_Stone_Sketch',
].join(',')

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined

interface ZohoProduct {
  id: string
  Product_Name?: string
  Product_Code?: string
  Product_Category?: string
  Product_Active?: boolean
  Subtitle?: string
  Editorial?: string
  Metal?: string
  Stone_Shape?: string
  Stone_Color?: string
  Stone_Clarity?: string
  Stone_Carats?: string
  Stone_Notes?: string
  Total_Carat_Weight?: number | string | null
  Center_Stone_Weight?: number | string | null
  Collection?: string
  Hero_Visual?: string
  Editorial_Visual?: string
  Visual_Top?: string
  Visual_Concept?: string
  Visual_Stone_Sketch?: string
}

async function fetchAllProducts(token: string): Promise<ZohoProduct[]> {
  const all: ZohoProduct[] = []
  let page = 1
  let moreRecords = true

  while (moreRecords) {
    const res = await fetch(
      `${ZOHO_CRM_BASE}/Products?fields=${FIELDS}&per_page=200&page=${page}`,
      { headers: { Authorization: `Zoho-oauthtoken ${token}` } },
    )

    if (res.status === 401) {
      invalidateZohoToken()
      throw new Error('Zoho token expired mid-sync — will retry on next run')
    }

    if (!res.ok) {
      throw new Error(`Zoho Products fetch failed: ${res.status} page=${page}`)
    }

    const json = (await res.json()) as {
      data?: ZohoProduct[]
      info?: { more_records?: boolean }
    }

    const records = json.data ?? []
    all.push(...records)
    moreRecords = json.info?.more_records ?? false
    page++

    if (moreRecords) await sleep(300) // gentle pacing
  }

  return all
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const agentOk = await isAuthorizedAgent(req)
  if (
    !agentOk &&
    auth !== `Bearer ${process.env.CRON_SECRET}` &&
    auth !== `Bearer ${process.env.BEZITO_SECRET}`
  ) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const token = await getZohoToken()
    const products = await fetchAllProducts(token)

    let upserted = 0
    const syncedSkus: string[] = []
    const errors: { sku?: string; error: string }[] = []

    for (const p of products) {
      const sku = str(p.Product_Code)
      if (!sku) continue

      try {
        const category = str(p.Product_Category)?.toLowerCase().replace(/\s+/g, '-') ?? null
        const slug = sku.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

        const totalCaratWeight =
          p.Total_Carat_Weight != null ? parseFloat(String(p.Total_Carat_Weight)) : null
        const centerStoneWeight =
          p.Center_Stone_Weight != null ? parseFloat(String(p.Center_Stone_Weight)) : null

        await sql(
          `INSERT INTO products(
            sku, slug, zoho_id, name,
            category, subtitle, editorial,
            hero_visual, editorial_visual,
            metal, stone_shape, stone_carats, stone_color, stone_clarity, stone_notes,
            total_carat_weight, center_stone_weight, collection,
            view_1_url, view_2_url, view_3_url,
            synced_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,now())
          ON CONFLICT (sku) DO UPDATE SET
            slug             = EXCLUDED.slug,
            zoho_id          = EXCLUDED.zoho_id,
            name             = EXCLUDED.name,
            category         = EXCLUDED.category,
            subtitle         = EXCLUDED.subtitle,
            editorial        = EXCLUDED.editorial,
            hero_visual      = EXCLUDED.hero_visual,
            editorial_visual = EXCLUDED.editorial_visual,
            metal            = EXCLUDED.metal,
            stone_shape      = EXCLUDED.stone_shape,
            stone_carats     = EXCLUDED.stone_carats,
            stone_color      = EXCLUDED.stone_color,
            stone_clarity    = EXCLUDED.stone_clarity,
            stone_notes      = EXCLUDED.stone_notes,
            total_carat_weight  = EXCLUDED.total_carat_weight,
            center_stone_weight = EXCLUDED.center_stone_weight,
            collection       = EXCLUDED.collection,
            view_1_url       = COALESCE(EXCLUDED.view_1_url, products.view_1_url),
            view_2_url       = COALESCE(EXCLUDED.view_2_url, products.view_2_url),
            view_3_url       = COALESCE(EXCLUDED.view_3_url, products.view_3_url),
            synced_at        = now()
            -- active + featured intentionally excluded: Neon-only, managed via admin PATCH
          `,
          [
            sku,                          // $1  sku
            slug,                         // $2  slug
            p.id,                         // $3  zoho_id (Zoho CRM Products record ID)
            str(p.Product_Name) ?? sku,   // $4  name
            category,                     // $5  category
            str(p.Subtitle) ?? null,      // $6  subtitle
            str(p.Editorial) ?? null,     // $7  editorial
            str(p.Hero_Visual) ?? null,   // $8  hero_visual
            str(p.Editorial_Visual) ?? null, // $9 editorial_visual
            str(p.Metal) ?? null,         // $10 metal
            str(p.Stone_Shape) ?? null,   // $11 stone_shape
            str(p.Stone_Carats) ?? null,  // $12 stone_carats
            str(p.Stone_Color) ?? null,   // $13 stone_color
            str(p.Stone_Clarity) ?? null, // $14 stone_clarity
            str(p.Stone_Notes) ?? null,   // $15 stone_notes
            totalCaratWeight,             // $16 total_carat_weight
            centerStoneWeight,            // $17 center_stone_weight
            str(p.Collection) ?? null,    // $18 collection
            str(p.Visual_Top) ?? null,    // $19 view_1_url
            str(p.Visual_Concept) ?? null, // $20 view_2_url
            str(p.Visual_Stone_Sketch) ?? null, // $21 view_3_url
          ],
        )

        syncedSkus.push(sku)
        upserted++
      } catch (e) {
        errors.push({ sku, error: String((e as Error)?.message ?? e) })
      }
    }

    // Delete stale rows — any Neon SKU not returned by Zoho this run.
    // Guard: preserve 'pending-*' zoho_id rows (manually inserted, no Zoho entry yet).
    let deleted = 0
    if (syncedSkus.length > 0) {
      const stale = await sql<{ sku: string }>(
        `DELETE FROM products
         WHERE sku <> ALL($1::text[])
           AND (zoho_id IS NULL OR zoho_id NOT LIKE 'pending-%')
         RETURNING sku`,
        [syncedSkus],
      )
      deleted = stale.length
      if (deleted) console.log(`Deleted stale: ${stale.map((r) => r.sku).join(', ')}`)
    }

    revalidatePath('/jewelry', 'layout')

    return NextResponse.json({ ok: true, listed: products.length, upserted, deleted, errors: errors.slice(0, 5) })
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: 'sync', error: String((e as Error)?.message ?? e) },
      { status: 500 },
    )
  }
}
