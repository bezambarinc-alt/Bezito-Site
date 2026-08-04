import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// HARD RULE: no public "Alara Cut" until patent granted
const ALARA = /alara\s*cut/i

export async function POST(req: NextRequest) {
  const input = await req.json() as {
    slug: string
    title: string
    blocks: unknown[]
    password?: string
    tenant?: string
  }

  // Guardrail: slug format
  if (!/^[a-z0-9-]+$/.test(input.slug)) {
    return NextResponse.json({ error: 'invalid slug — use lowercase letters, numbers, hyphens only' }, { status: 400 })
  }

  // Guardrail: Alara rule across all serialized content
  const serialized = JSON.stringify(input.blocks) + input.title
  if (ALARA.test(serialized)) {
    return NextResponse.json(
      { error: 'Blocked: public "Alara Cut" reference — use Princess Cut, Blaze®, or Elysian Cut™ only' },
      { status: 422 },
    )
  }

  const [row] = await sql<{ slug: string }>(
    `INSERT INTO pages(slug, tenant, title, blocks, status, password)
     VALUES ($1, $2, $3, $4, 'live', $5)
     ON CONFLICT (slug) DO UPDATE
       SET tenant=$2, title=$3, blocks=$4, status='live', password=$5, updated_at=now()
     RETURNING slug`,
    [input.slug, input.tenant ?? 'bezambar', input.title, JSON.stringify(input.blocks), input.password ?? null],
  )

  await sql(
    `INSERT INTO audit_log(actor, action, target, detail) VALUES ('bezito','page.publish',$1,$2)`,
    [row.slug, JSON.stringify({ title: input.title })],
  )

  return NextResponse.json({ ok: true, url: `${process.env.APP_URL}/client/${row.slug}` })
}

export async function GET() {
  const rows = await sql<{ slug: string; title: string; status: string; updated_at: string }>(
    `SELECT slug, title, status, updated_at FROM pages ORDER BY updated_at DESC`,
  )
  return NextResponse.json({ pages: rows })
}
