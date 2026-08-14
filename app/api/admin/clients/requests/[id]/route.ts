import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

type Ctx = { params: Promise<{ id: string }> }

/**
 * PATCH /api/admin/clients/requests/[id]
 * Updates the status of a client page request.
 */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const requestId = parseInt(id, 10)
  if (isNaN(requestId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })

  const parsed = z.object({
    status: z.enum(['pending', 'in_progress', 'done']),
  }).safeParse(await req.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  await sql(
    `UPDATE page_requests SET status = $1 WHERE id = $2`,
    [parsed.data.status, requestId],
  )

  return NextResponse.json({ ok: true })
}
