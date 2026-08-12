import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { sql } from '@/lib/db'

/**
 * Plytix → Neon products cache sync.
 *
 * Plytix data model (discovered 2026-08-08):
 *   - POST /products/search  → paginated list, but attributes come back EMPTY.
 *   - GET  /products/{id}    → the real attributes (description, editorial,
 *                              hero_visual, metal, stone_*, subtitle, etc.).
 * So we list ids, then fetch each product's detail.
 *
 * Auth returns data[0].access_token (NOT .token).
 */

// Raise the function timeout — 66 sequential detail-fetches + upserts blow past
// the default ~10s and the function was dying mid-loop (only ~19 landed).
export const maxDuration = 300
export const dynamic = 'force-dynamic'

const PLYTIX_AUTH = 'https://auth.plytix.com/auth/api/get-token'
const PLYTIX_BASE = 'https://pim.plytix.com/api/v1'

async function getPlytixToken(): Promise<string> {
  const res = await fetch(PLYTIX_AUTH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.PLYTIX_API_KEY,
      api_password: process.env.PLYTIX_API_PASSWORD,
    }),
  })
  const data = (await res.json()) as {
    data?: [{ access_token?: string; token?: string }]
    msg?: string
  }
  const token = data?.data?.[0]?.access_token ?? data?.data?.[0]?.token
  if (!token) {
    throw new Error(`Plytix auth failed (${res.status}): ${data?.msg ?? JSON.stringify(data).slice(0, 200)}`)
  }
  return token
}

interface PlytixDetail {
  id: string
  sku: string
  label?: string
  attributes?: Record<string, unknown>
}

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Plytix rate-limits rapid GET (429). Retry with backoff. Generic fetcher.
async function getWithRetry(url: string, token: string): Promise<Response | null> {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    if (res.status === 429) {
      await sleep(1500 * (attempt + 1))
      continue
    }
    return res
  }
  return null
}

const getDetail = (id: string, token: string) =>
  getWithRetry(`${PLYTIX_BASE}/products/${id}`, token)

// Plytix categories live in a TAXONOMY (not an attribute). Each product links to
// one or more categories via /products/{id}/categories. We take the first as the
// browse bucket (Rings / Bracelets / Earrings / Necklaces / Pendants / Wedding Bands).
async function getCategory(id: string, token: string): Promise<string | undefined> {
  const res = await getWithRetry(`${PLYTIX_BASE}/products/${id}/categories`, token)
  if (!res || !res.ok) return undefined
  const json = (await res.json().catch(() => ({}))) as {
    data?: { name?: string; path?: string[] }[]
  }
  const cats = json.data ?? []
  if (!cats.length) return undefined
  // Prefer a specific (non-'Jewelry') category if the product is in several.
  const specific = cats.find((c) => (c.name ?? '') !== 'Jewelry') ?? cats[0]
  const name = specific.name ?? specific.path?.[specific.path.length - 1]
  return name ? name.toLowerCase().replace(/\s+/g, '-') : undefined
}

// detectType removed — hero_visual / editorial_visual stored as raw URLs;
// rowToProduct in queries.ts handles type detection via Cloudinary path pattern.

export async function GET(req: NextRequest) {
  // Auth: Vercel Cron injects Authorization header automatically.
  // Bezito can also trigger manually with BEZITO_SECRET.
  const auth = req.headers.get('authorization') ?? ''
  if (
    auth !== `Bearer ${process.env.CRON_SECRET}` &&
    auth !== `Bearer ${process.env.BEZITO_SECRET}`
  ) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  try {
    const token = await getPlytixToken()

    // 1) List all product ids. Plytix search returns only the FIRST page by
    //    default (docs: page_size max 100), so loop pages until we have all.
    const PAGE_SIZE = 100
    const ids: string[] = []
    let page = 1
    let totalCount = Infinity
    while (ids.length < totalCount) {
      const searchRes = await fetch(`${PLYTIX_BASE}/products/search`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Only sync Completed + active products — per Kevin 2026-08-09
          filters: [
            [{ field: 'status', operator: 'eq', value: 'Completed' }],
          ],
          attributes: ['sku', 'label'],
          pagination: { page, page_size: PAGE_SIZE },
        }),
      })
      const searchJson = (await searchRes.json()) as {
        data?: { id: string; sku: string; label?: string }[]
        pagination?: { total_count?: number }
        msg?: string
      }
      if (!searchRes.ok || !Array.isArray(searchJson.data)) {
        return NextResponse.json(
          { ok: false, stage: 'search', page, status: searchRes.status, msg: searchJson?.msg ?? searchJson },
          { status: 502 },
        )
      }
      totalCount = searchJson.pagination?.total_count ?? searchJson.data.length
      ids.push(...searchJson.data.map((p) => p.id))
      if (searchJson.data.length < PAGE_SIZE) break // last page
      page++
      await sleep(300) // pace between search pages (rate limit)
    }
    let upserted = 0
    const syncedSkus: string[] = []
    const errors: { sku?: string; error: string }[] = []

    // 2) Fetch each product's full detail + map to specs/media.
    for (const id of ids) {
      try {
        const dRes = await getDetail(id, token)
        if (!dRes) { errors.push({ error: `429 exhausted for ${id}` }); continue }
        const dJson = (await dRes.json()) as { data?: PlytixDetail[] }
        const p = dJson.data?.[0]
        if (!p?.sku) continue
        const a = p.attributes ?? {}

        // Category: prefer the required single-select `category` attribute
        // (locked model 2026-08-08); fall back to the taxonomy link, then 'jewelry'.
        const attrCategory = str(a.category)
        const category = attrCategory
          ? attrCategory.toLowerCase().replace(/\s+/g, '-')
          : (await getCategory(id, token)) ?? 'jewelry'

        const heroVisual = str(a.hero_visual)
        const editorialVisual = str(a.editorial_visual)

        // Parse numeric fields (Neon columns are NUMERIC — pass null if absent)
        const totalCaratWeight  = str(a.total_carat_weight)  ? parseFloat(str(a.total_carat_weight)!)  : null
        const centerStoneWeight = str(a.center_stone_weight) ? parseFloat(str(a.center_stone_weight)!) : null
        // Plytix featured attribute: boolean, string 'true', or any truthy value
        const featured = a.featured === true || a.featured === 'true'

        // Write to individual columns — the JSONB `specs`/`media` blobs are legacy.
        await sql(
          `INSERT INTO products(
            sku, slug, plytix_id, name,
            category, subtitle, editorial, description,
            hero_visual, editorial_visual,
            metal, stone_shape, stone_carats, stone_color, stone_clarity, stone_notes,
            total_carat_weight, center_stone_weight, collection, featured,
            synced_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,now())
          ON CONFLICT (sku) DO UPDATE SET
            slug=EXCLUDED.slug,
            plytix_id=EXCLUDED.plytix_id, name=EXCLUDED.name,
            category=EXCLUDED.category, subtitle=EXCLUDED.subtitle,
            editorial=EXCLUDED.editorial, description=EXCLUDED.description,
            hero_visual=EXCLUDED.hero_visual, editorial_visual=EXCLUDED.editorial_visual,
            metal=EXCLUDED.metal, stone_shape=EXCLUDED.stone_shape,
            stone_carats=EXCLUDED.stone_carats, stone_color=EXCLUDED.stone_color,
            stone_clarity=EXCLUDED.stone_clarity, stone_notes=EXCLUDED.stone_notes,
            total_carat_weight=EXCLUDED.total_carat_weight,
            center_stone_weight=EXCLUDED.center_stone_weight,
            collection=EXCLUDED.collection,
            synced_at=now()
            -- NOTE: active + featured intentionally excluded from UPDATE.
            -- These are managed via the admin dashboard, not Plytix.`,
          [
            p.sku,                                                                  // $1  sku
            p.sku.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''), // $2  slug
            p.id,                                                                   // $3  plytix_id
            str(p.label) ?? p.sku,                                                 // $4  name
            category ?? null,                                                       // $5  category
            str(a.subtitle) ?? null,                                               // $6  subtitle
            str(a.editorial) ?? null,                                              // $7  editorial
            str(a.description) ?? null,                                            // $8  description
            heroVisual ?? null,                                                     // $9  hero_visual
            editorialVisual ?? null,                                               // $10 editorial_visual
            str(a.metal) ?? null,                                                  // $11 metal
            str(a.stone_shape) ?? null,                                            // $12 stone_shape
            str(a.stone_carats) ?? null,                                           // $13 stone_carats
            str(a.stone_color) ?? null,                                            // $14 stone_color
            str(a.stone_clarity) ?? null,                                          // $15 stone_clarity
            str(a.stone_notes) ?? null,                                            // $16 stone_notes
            totalCaratWeight,                                                       // $17 total_carat_weight
            centerStoneWeight,                                                      // $18 center_stone_weight
            str(a.collection) ?? null,                                             // $19 collection
            featured,                                                               // $20 featured
          ],
        )
        syncedSkus.push(p.sku)
        upserted++
        await sleep(200) // gentle pacing between products
      } catch (e) {
        errors.push({ error: String((e as Error)?.message ?? e) })
      }
    }

    // 3) Delete stale rows — any SKU in Neon not returned by Plytix this run
    let deleted = 0
    if (syncedSkus.length > 0) {
      const stale = await sql<{ sku: string }>(
        `DELETE FROM products WHERE sku <> ALL($1::text[]) RETURNING sku`,
        [syncedSkus]
      )
      deleted = stale.length
      if (deleted) console.log(`Deleted stale: ${stale.map(r => r.sku).join(', ')}`)
    }

    // Invalidate catalog cache so next request serves fresh data
    revalidateTag('products', 'max')

    return NextResponse.json({ ok: true, listed: ids.length, upserted, deleted, errors: errors.slice(0, 5) })
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: 'sync', error: String((e as Error)?.message ?? e) },
      { status: 500 },
    )
  }
}
