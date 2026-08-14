import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { audit } from '@/lib/audit'
import { TEMPLATES } from '@/app/(public)/jewelry/[category]/[slug]/layouts'

type Ctx = { params: Promise<{ slug: string }> }

const patchSchema = z.object({
  client_id:   z.number().nullable().optional(),
  doc_type:    z.enum(['showcase', 'proposal']).optional(),
  status:      z.enum(['draft', 'live', 'archived']).optional(),
  template_id: z.string().refine(v => v in TEMPLATES, 'Invalid template ID').optional(),
})

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const updates: string[] = ['updated_at = now()']
  const values: unknown[] = []
  let i = 1

  const { client_id, doc_type, status } = parsed.data
  if (client_id !== undefined) { updates.push(`client_id = $${i++}`); values.push(client_id) }
  if (doc_type  !== undefined) { updates.push(`doc_type  = $${i++}`); values.push(doc_type) }
  if (status    !== undefined) { updates.push(`status    = $${i++}`); values.push(status) }

  if (updates.length === 1) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  values.push(slug)
  await sql(`UPDATE pages SET ${updates.join(', ')} WHERE slug = $${i}`, values)

  await audit('admin.client.updated', session.sub as string, {
    slug, ...parsed.data,
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params

  // Soft-delete — archive, never hard-delete published pages
  await sql(
    `UPDATE pages SET status = 'archived', updated_at = now() WHERE slug = $1`,
    [slug],
  )

  await audit('admin.client.updated', session.sub as string, { slug, action: 'archived' })

  return NextResponse.json({ ok: true })
}
