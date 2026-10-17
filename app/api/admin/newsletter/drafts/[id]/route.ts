import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { isAuthorizedAgent } from '@/lib/agent-auth'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const PatchSchema = z.object({
  is_template: z.boolean(),
  template_name: z.string().trim().min(1).max(100),
})

/**
 * PATCH /api/admin/newsletter/drafts/[id]
 * Promote an email draft to a reusable template (or demote it).
 * Called after Kevin approves a campaign: "save this as template [name]"
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  const agentOk = await isAuthorizedAgent(req)
  if (!session && !agentOk) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!UUID_RE.test(id)) return NextResponse.json({ error: 'Invalid draft id' }, { status: 400 })

  const parsed = PatchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', issues: parsed.error.issues.map(i => ({ path: i.path.join('.'), message: i.message })) },
      { status: 400 },
    )
  }

  const { is_template, template_name } = parsed.data

  const rows = await sql<{ id: string }>(
    `UPDATE email_drafts
     SET is_template = $1, template_name = $2
     WHERE id = $3
     RETURNING id`,
    [is_template, is_template ? template_name : null, id],
  )

  if (!rows.length) return NextResponse.json({ error: 'Draft not found' }, { status: 404 })

  return NextResponse.json({ id, is_template, template_name: is_template ? template_name : null })
}
