import { NextResponse } from 'next/server'
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

function detectType(url: string): 'image' | 'video' {
  return /\/video\/upload\//.test(url) || /\.(mp4|webm|mov)(\?|$)/i.test(url) ? 'video' : 'image'
}

export async function GET() {
  try {
    const token = await getPlytixToken()

    // 1) List all product ids (search returns empty attributes, so just ids/sku).
    const searchRes = await fetch(`${PLYTIX_BASE}/products/search`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filters: [],
        attributes: ['sku', 'label'],
        pagination: { page: 1, page_size: 200 },
      }),
    })
    const searchJson = (await searchRes.json()) as {
      data?: { id: string; sku: string; label?: string }[]
      msg?: string
    }
    if (!searchRes.ok || !Array.isArray(searchJson.data)) {
      return NextResponse.json(
        { ok: false, stage: 'search', status: searchRes.status, msg: searchJson?.msg ?? searchJson },
        { status: 502 },
      )
    }

    const ids = searchJson.data.map((p) => p.id)
    let upserted = 0
    const errors: { sku?: string; error: string }[] = []

    // 2) Fetch each product's full detail + map to specs/media.
    for (const id of ids) {
      try {
        const dRes = await fetch(`${PLYTIX_BASE}/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const dJson = (await dRes.json()) as { data?: PlytixDetail[] }
        const p = dJson.data?.[0]
        if (!p?.sku) continue
        const a = p.attributes ?? {}

        const heroVisual = str(a.hero_visual)
        const editorialVisual = str(a.editorial_visual)

        // specs — map Plytix attribute slugs to the ProductSpecs shape the page reads.
        const specs: Record<string, string | undefined> = {
          subtitle: str(a.subtitle),
          lede: str(a.description) ?? str(a.editorial),
          codeName: str(p.label) ?? str(a.subtitle),
          metal: str(a.metal),
          gemStone: str(a.stone_shape),
          caratWeight: str(a.stone_carats) ?? str(a.total_carat_weight),
          color: str(a.stone_color),
          clarity: str(a.stone_clarity),
          madeIn: 'Los Angeles',
          category: str(a.category) ?? 'jewelry',
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
      } catch (e) {
        errors.push({ error: String((e as Error)?.message ?? e) })
      }
    }

    return NextResponse.json({ ok: true, listed: ids.length, upserted, errors: errors.slice(0, 5) })
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: 'sync', error: String((e as Error)?.message ?? e) },
      { status: 500 },
    )
  }
}
