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

function detectType(url: string): 'image' | 'video' {
  return /\/video\/upload\//.test(url) || /\.(mp4|webm|mov)(\?|$)/i.test(url) ? 'video' : 'image'
}

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

        // specs — map Plytix attribute slugs to the ProductSpecs shape the page reads.
        const specs: Record<string, string | undefined> = {
          subtitle: str(a.subtitle),
          lede: str(a.description) ?? str(a.editorial),
          codeName: str(p.label) ?? str(a.subtitle),
          metal: str(a.metal),
          gemStone: str(a.stone_shape),
          caratWeight: str(a.total_carat_weight) ?? str(a.stone_carats),
          centerStoneWeight: str(a.center_stone_weight),
          color: str(a.stone_color),
          clarity: str(a.stone_clarity),
          madeIn: 'Los Angeles',
          category,
          heroVideoUrl: heroVisual && detectType(heroVisual) === 'video' ? heroVisual : undefined,
          heroPosterUrl: editorialVisual && detectType(editorialVisual) === 'image' ? editorialVisual : undefined,
        }
        Object.keys(specs).forEach((k) => specs[k] === undefined && delete specs[k])

        // media — build the gallery array from the visuals we have.
        const media: { url: string; type: 'image' | 'video'; label?: string }[] = []
        if (heroVisual) media.push({ url: heroVisual, type: detectType(heroVisual), label: 'Hero' })
        if (editorialVisual && editorialVisual !== heroVisual)
          media.push({ url: editorialVisual, type: detectType(editorialVisual), label: 'Editorial' })

        await sql(
          `INSERT INTO products(sku, plytix_id, name, specs, media, synced_at)
           VALUES ($1,$2,$3,$4,$5,now())
           ON CONFLICT (sku) DO UPDATE
             SET plytix_id=$2, name=$3, specs=$4, media=$5, synced_at=now()`,
          [p.sku, p.id, str(p.label) ?? p.sku, JSON.stringify(specs), JSON.stringify(media)],
        )
        upserted++
        await sleep(200) // gentle pacing between products
      } catch (e) {
        errors.push({ error: String((e as Error)?.message ?? e) })
      }
    }

    // Invalidate catalog cache so next request serves fresh data
    revalidateTag('products', 'max')

    return NextResponse.json({ ok: true, listed: ids.length, upserted, errors: errors.slice(0, 5) })
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: 'sync', error: String((e as Error)?.message ?? e) },
      { status: 500 },
    )
  }
}
