import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isAuthorizedAgent } from '@/lib/agent-auth'
import { audit } from '@/lib/audit'
import { TEMPLATES, type TemplateScope } from '@/app/(public)/jewelry/[category]/[slug]/layouts'

type Ctx = { params: Promise<{ slug: string }> }

const patchSchema = z.object({
  client_id:   z.number().nullable().optional(),
  doc_type:    z.enum(['showcase', 'proposal']).optional(),
  status:      z.enum(['draft', 'live', 'archived']).optional(),
  // null clears the per-page override and falls back to the scope's global default
  template_id: z.string().refine(v => v in TEMPLATES, 'Invalid template ID').nullable().optional(),
  // shared=true → anyone with the link can view (Google-Drive-style). Proposal-only; no effect on showcases.
  shared: z.boolean().optional(),
})

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const updates: string[] = ['updated_at = now()']
  const values: unknown[] = []
  let i = 1

  const { client_id, doc_type, status, template_id, shared } = parsed.data

  // Scope validation — reject templates that don't belong to this page's doc_type.
  // Uses the incoming doc_type when changing both at once; otherwise reads from DB.
  if (template_id !== null && template_id !== undefined) {
    let targetDocType: string | undefined = doc_type
    if (!targetDocType) {
      const [pageRow] = await sql<{ doc_type: string }>(
        `SELECT doc_type FROM pages WHERE slug = $1 LIMIT 1`,
        [slug],
      )
      targetDocType = pageRow?.doc_type
    }
    const scopeMap: Record<string, TemplateScope> = { proposal: 'proposal', showcase: 'showcase' }
    const requiredScope = scopeMap[targetDocType ?? '']
    const template = TEMPLATES[template_id]
    if (!template || !requiredScope || !template.scope.includes(requiredScope)) {
      return NextResponse.json(
        { error: `Template "${template_id}" is not valid for ${targetDocType ?? 'this'} pages` },
        { status: 400 },
      )
    }
  }

  if (client_id   !== undefined) { updates.push(`client_id   = $${i++}`); values.push(client_id) }
  if (doc_type    !== undefined) { updates.push(`doc_type    = $${i++}`); values.push(doc_type) }
  if (status      !== undefined) { updates.push(`status      = $${i++}`); values.push(status) }
  if (template_id !== undefined) { updates.push(`template_id = $${i++}`); values.push(template_id) }
  if (shared      !== undefined) { updates.push(`shared      = $${i++}`); values.push(shared) }

  if (updates.length === 1) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  values.push(slug)
  await sql(`UPDATE pages SET ${updates.join(', ')} WHERE slug = $${i}`, values)

  const actor = session?.sub ?? 'bezito-agent'
  await audit('admin.page.updated', actor, { slug, ...parsed.data })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params

  // Soft-delete — archive, never hard-delete published pages
  await sql(
    `UPDATE pages SET status = 'archived', updated_at = now() WHERE slug = $1`,
    [slug],
  )

  const actorDel = session?.sub ?? 'bezito-agent'
  await audit('admin.page.archived', actorDel, { slug })

  return NextResponse.json({ ok: true })
}
