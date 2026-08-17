import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { isAuthorizedAgent } from '@/lib/agent-auth'
import { audit } from '@/lib/audit'
import { TEMPLATES, type TemplateScope } from '@/app/(public)/jewelry/[category]/[slug]/layouts'

/** POST /api/admin/pages — create a new page (used by Bezito and admin UI) */
export async function POST(req: NextRequest) {
  const session = await getSession()
  const agentOk = isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const schema = z.object({
    slug:        z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, hyphens').min(1).max(64),
    title:       z.string().min(1).max(200),
    doc_type:    z.enum(['showcase', 'proposal']).default('showcase'),
    client_id:   z.number().nullable().optional(),
    template_id: z.string().optional(),
    blocks:      z.array(z.record(z.unknown())).optional().default([]),
    status:      z.enum(['draft', 'live']).default('draft'),
  })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const { slug, title, doc_type, client_id, template_id, blocks, status } = parsed.data

  // Validate template scope if provided
  if (template_id) {
    if (!(template_id in TEMPLATES)) {
      return NextResponse.json({ error: `Unknown template: ${template_id}` }, { status: 400 })
    }
    const scopeMap: Record<string, TemplateScope> = { proposal: 'proposal', showcase: 'showcase' }
    const requiredScope = scopeMap[doc_type]
    if (requiredScope && !TEMPLATES[template_id].scope.includes(requiredScope)) {
      return NextResponse.json(
        { error: `Template "${template_id}" is not valid for ${doc_type} pages` },
        { status: 400 },
      )
    }
  }

  try {
    const [page] = await sql<{ id: number }>(
      `INSERT INTO pages (slug, title, doc_type, client_id, template_id, blocks, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [slug, title, doc_type, client_id ?? null, template_id ?? null, JSON.stringify(blocks), status],
    )

    const actor = session?.sub ?? 'bezito-agent'
    await audit('admin.page.created', actor, { slug, title, doc_type, client_id })

    return NextResponse.json({ ok: true, id: page.id, slug }, { status: 201 })
  } catch (e) {
    const msg = (e as Error).message ?? ''
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'Slug already exists — choose a different one' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  const agentOk = isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pages = await sql<{
    slug: string; title: string; doc_type: string; status: string;
    client_id: number | null; client_name: string | null; client_slug: string | null;
    customer_pin: string | null; pin_expires_at: string | null;
    created_at: string; updated_at: string;
  }>(
    `SELECT p.slug, p.title, p.doc_type, p.status,
            p.client_id, p.customer_pin, p.pin_expires_at,
            p.created_at, p.updated_at,
            c.name AS client_name, c.slug AS client_slug
     FROM pages p
     LEFT JOIN clients c ON c.id = p.client_id
     WHERE p.doc_type IN ('showcase','proposal')
     ORDER BY p.updated_at DESC`,
  )

  return NextResponse.json({ pages })
}
