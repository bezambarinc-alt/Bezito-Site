import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sql } from '@/lib/db'
import { getClientSession } from '@/lib/client-auth'
import { audit } from '@/lib/audit'

const schema = z.object({
  product_sku: z.string().max(64).optional(),
  message:     z.string().min(10).max(500),
})

export async function POST(req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 })
  }

  const { product_sku, message } = parsed.data

  await sql(
    `INSERT INTO page_requests (client_id, product_sku, message) VALUES ($1, $2, $3)`,
    [session.clientId, product_sku ?? null, message],
  )

  await audit('portal.page_request.submitted', session.sub, {
    clientId: session.clientId,
    product_sku: product_sku ?? null,
  })

  return NextResponse.json({ ok: true }, { status: 201 })
}
