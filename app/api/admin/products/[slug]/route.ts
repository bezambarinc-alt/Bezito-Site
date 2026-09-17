import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { isAuthorizedAgent } from '@/lib/agent-auth'
import { audit } from '@/lib/audit'
import { sql } from '@/lib/db'

type Ctx = { params: Promise<{ slug: string }> }

/**
 * The old version took `Object.entries(body)` filtered through a name allowlist
 * and pushed the raw value straight into the UPDATE. The column names were safe,
 * the values were not checked at all: `{"active": "yes"}` reached Postgres and
 * came back as a 500, and `{"view_1_url": {...}}` was stringified into the row.
 *
 * Zod's `.partial()` on a closed object does the allowlisting too — unknown keys
 * are stripped, which is exactly what ALLOWED_FIELDS used to do — so the schema
 * replaces both checks with one.
 *
 * view_*_url are Cloudinary URLs set by hand in the admin grid; '' and null both
 * mean "clear this slot", and the grid sends '' when a field is emptied.
 */
const patchSchema = z
  .object({
    active:     z.boolean(),
    featured:   z.boolean(),
    view_1_url: z.string().url().max(2048).or(z.literal('')).nullable(),
    view_2_url: z.string().url().max(2048).or(z.literal('')).nullable(),
    view_3_url: z.string().url().max(2048).or(z.literal('')).nullable(),
  })
  .partial()

type ProductRow = {
  sku: string; slug: string; name: string; category: string | null
  active: boolean; featured: boolean
  view_1_url: string | null; view_2_url: string | null; view_3_url: string | null
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params

  // .catch(() => null) — a malformed body is a 400, not an unhandled rejection
  // surfacing as a 500 with a stack trace in the Vercel log.
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const entries = Object.entries(parsed.data)
  if (entries.length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const updates = entries.map(([key], i) => `${key} = $${i + 1}`)
  const values: unknown[] = entries.map(([, val]) => val)

  values.push(slug)
  const rows = await sql<ProductRow>(
    `UPDATE products
     SET ${updates.join(', ')}
     WHERE slug = $${values.length}
     RETURNING sku, slug, name, category, active, featured, view_1_url, view_2_url, view_3_url`,
    values,
  )

  if (!rows.length) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  const product = rows[0]
  // Bust ISR cache for this product page so active/featured changes are visible immediately.
  if (product.category) {
    revalidatePath(`/jewelry/${product.category}/${slug}`)
  }
  revalidatePath('/jewelry', 'layout')

  // This is the one admin write that could silently hide a live product; it had
  // no audit trail at all, so an unexplained disappearance was unattributable.
  await audit('admin.product.updated', session?.sub ?? 'bezito-agent', { slug, ...parsed.data })

  return NextResponse.json({ product })
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
