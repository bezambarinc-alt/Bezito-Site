import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

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
  // Plytix returns data[0].access_token (NOT .token — that was the 500 bug).
  const token = data?.data?.[0]?.access_token ?? data?.data?.[0]?.token
  if (!token) {
    throw new Error(`Plytix auth failed (${res.status}): ${data?.msg ?? JSON.stringify(data).slice(0, 200)}`)
  }
  return token
}

export async function GET() {
  try {
  const token = await getPlytixToken()

  // Fetch all products from Plytix
  const res = await fetch(`${PLYTIX_BASE}/products?page_size=100`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = (await res.json()) as {
    data?: { id: string; sku: string; name: string; attributes: Record<string, unknown> }[]
    msg?: string
  }
  if (!res.ok || !Array.isArray(json.data)) {
    return NextResponse.json(
      { ok: false, stage: 'products-fetch', status: res.status, msg: json?.msg ?? json },
      { status: 502 },
    )
  }
  const data = json.data

  let upserted = 0
  for (const p of data) {
    await sql(
      `INSERT INTO products(sku, plytix_id, name, specs, media, synced_at)
       VALUES ($1,$2,$3,$4,$5,now())
       ON CONFLICT (sku) DO UPDATE
         SET plytix_id=$2, name=$3, specs=$4, media=$5, synced_at=now()`,
      [
        p.sku,
        p.id,
        p.name,
        JSON.stringify({
          stone_shape: p.attributes.stone_shape,
          stone_carats: p.attributes.stone_carats,
          stone_color: p.attributes.stone_color,
          stone_clarity: p.attributes.stone_clarity,
          stone_notes: p.attributes.stone_notes,
          metal: p.attributes.metal,
          total_carat_weight: p.attributes.total_carat_weight,
        }),
        JSON.stringify({
          hero_visual: p.attributes.hero_visual,
          editorial_visual: p.attributes.editorial_visual,
        }),
      ],
    )
    upserted++
  }

  return NextResponse.json({ ok: true, upserted, total: data.length })
  } catch (e) {
    return NextResponse.json(
      { ok: false, stage: 'sync', error: String((e as Error)?.message ?? e) },
      { status: 500 },
    )
  }
}
