// Plytix REST sync client
// Only pulls products with status = 'Completed' (not Draft / Archived)

const BASE = 'https://pim.plytix.com/api/v1'

export interface PlytixProduct {
  sku: string
  plytix_id: string
  name: string
  category: string | null
  subtitle: string | null
  editorial: string | null
  description: string | null
  hero_visual: string | null
  editorial_visual: string | null
  metal: string | null
  stone_shape: string | null
  stone_carats: string | null
  stone_clarity: string | null
  stone_color: string | null
  stone_notes: string | null
  total_carat_weight: number | null
  active: boolean
  featured: boolean
  sort_order: number
}

async function getToken(): Promise<string> {
  const res = await fetch('https://auth.plytix.com/auth/api/get-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: process.env.PLYTIX_API_KEY,
      api_password: process.env.PLYTIX_API_PASSWORD,
    }),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Plytix auth failed: ${res.status}`)
  const data = await res.json()
  return data.data[0].access_token
}

async function plytixGet(path: string, tok: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Plytix GET ${path} → ${res.status}`)
  return res.json()
}

async function plytixPost(path: string, tok: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`Plytix POST ${path} → ${res.status}`)
  return res.json()
}

function bool(v: unknown, def: boolean): boolean {
  if (v == null) return def
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') return v.toLowerCase() === 'true'
  return Boolean(v)
}

function num(v: unknown, def: number): number {
  if (v == null) return def
  const n = Number(v)
  return isNaN(n) ? def : n
}

export async function fetchCompletedProducts(): Promise<PlytixProduct[]> {
  const tok = await getToken()

  // 1. Pull all IDs — filter to Completed status only
  const ids: string[] = []
  let page = 1
  while (true) {
    const r = (await plytixPost('/products/search', tok, {
      pagination: { page, page_size: 100, order: 'asc', order_by: 'sku' },
      filters: [[{ field: 'status', operator: 'eq', value: 'Completed' }]],
    })) as { data?: { id: string }[]; pagination?: { total_pages?: number } }

    for (const p of r.data ?? []) ids.push(p.id)
    if (page >= (r.pagination?.total_pages ?? 1)) break
    page++
  }

  // 2. Fetch full record per product (rate: 20 req/10s → ~60ms gap)
  const products: PlytixProduct[] = []
  for (const id of ids) {
    const r = (await plytixGet(`/products/${id}`, tok)) as {
      data?: { sku: string; id: string; label: string; attributes?: Record<string, unknown> }[]
    }
    const d = r.data?.[0]
    if (!d) continue
    const a = d.attributes ?? {}
    products.push({
      sku: d.sku,
      plytix_id: d.id,
      name: d.label,
      category:           (a.category   as string)  ?? null,
      subtitle:           (a.subtitle   as string)  ?? null,
      editorial:          (a.editorial  as string)  ?? null,
      description:        (a.description as string) ?? null,
      hero_visual:        (a.hero_visual as string) ?? null,
      editorial_visual:   (a.editorial_visual as string) ?? null,
      metal:              (a.metal      as string)  ?? null,
      stone_shape:        (a.stone_shape as string) ?? null,
      stone_carats:       (a.stone_carats as string) ?? null,
      stone_clarity:      (a.stone_clarity as string) ?? null,
      stone_color:        (a.stone_color as string) ?? null,
      stone_notes:        (a.stone_notes as string) ?? null,
      total_carat_weight: a.total_carat_weight != null ? num(a.total_carat_weight, 0) : null,
      active:             bool(a.active,   true),
      featured:           bool(a.featured, false),
      sort_order:         Math.round(num(a.sort_order, 0)),
    })
    await new Promise(r => setTimeout(r, 60)) // stay under 20 req/10s
  }

  return products
}
