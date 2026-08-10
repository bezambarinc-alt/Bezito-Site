import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { sql } from '@/lib/db'
import { fetchCompletedProducts } from '@/lib/plytix'

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 min — Pro plan

export async function GET(req: NextRequest) {
  // Auth: Vercel Cron injects CRON_SECRET automatically; Bezito can also trigger manually
  const auth = req.headers.get('authorization') ?? ''
  if (
    auth !== `Bearer ${process.env.CRON_SECRET}` &&
    auth !== `Bearer ${process.env.BEZITO_SECRET}`
  ) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const started = Date.now()
  const errors: string[] = []
  let synced = 0

  try {
    const products = await fetchCompletedProducts()

    for (const p of products) {
      try {
        await sql(
          `INSERT INTO products (
            sku, plytix_id, name, category, subtitle, editorial, description,
            hero_visual, editorial_visual, metal, stone_shape, stone_carats,
            stone_clarity, stone_color, stone_notes, total_carat_weight,
            active, featured, sort_order, synced_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,now())
          ON CONFLICT (sku) DO UPDATE SET
            plytix_id=$2, name=$3, category=$4, subtitle=$5, editorial=$6,
            description=$7, hero_visual=$8, editorial_visual=$9, metal=$10,
            stone_shape=$11, stone_carats=$12, stone_clarity=$13,
            stone_color=$14, stone_notes=$15, total_carat_weight=$16,
            active=$17, featured=$18, sort_order=$19, synced_at=now()`,
          [
            p.sku, p.plytix_id, p.name, p.category, p.subtitle, p.editorial,
            p.description, p.hero_visual, p.editorial_visual, p.metal,
            p.stone_shape, p.stone_carats, p.stone_clarity, p.stone_color,
            p.stone_notes, p.total_carat_weight, p.active, p.featured, p.sort_order,
          ]
        )
        synced++
      } catch (err) {
        errors.push(`${p.sku}: ${(err as Error).message}`)
      }
    }

    // Invalidate catalog cache — site serves fresh data on next request
    revalidateTag('products')

    await sql(
      `INSERT INTO audit_log(actor, action, target, detail)
       VALUES ('bezito','plytix.sync','products',$1)`,
      [JSON.stringify({ synced, errors: errors.length, ms: Date.now() - started })]
    )

    return NextResponse.json({
      ok: true, synced, total: products.length,
      ...(errors.length && { errors }),
      ms: Date.now() - started,
    })
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 })
  }
}
