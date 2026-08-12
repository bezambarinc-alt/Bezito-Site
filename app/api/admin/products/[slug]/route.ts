import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'

type Ctx = { params: Promise<{ slug: string }> }

const ALLOWED_FIELDS = new Set(['active', 'featured', 'view_1_url', 'view_2_url', 'view_3_url'])

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const body = await req.json() as Record<string, unknown>

  // Only update allowed fields
  const updates: string[] = []
  const values: unknown[] = []

  for (const [key, val] of Object.entries(body)) {
    if (!ALLOWED_FIELDS.has(key)) continue
    updates.push(`${key} = $${values.length + 1}`)
    values.push(val)
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  values.push(slug)
  const rows = await sql<{ sku: string; active: boolean; featured: boolean }>(
    `UPDATE products
     SET ${updates.join(', ')}
     WHERE slug = $${values.length}
     RETURNING sku, slug, name, active, featured, view_1_url, view_2_url, view_3_url`,
    values,
  )

  if (!rows.length) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json({ product: rows[0] })
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const [product] = await sql(
    `SELECT sku, slug, name, category, hero_visual, editorial_visual,
            metal, active, featured, sort_order, synced_at,
            view_1_url, view_2_url, view_3_url
     FROM products WHERE slug = $1`,
    [slug],
  )

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ product })
}
