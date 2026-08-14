import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getClientSession } from '@/lib/client-auth'

export async function GET(_req: NextRequest) {
  const session = await getClientSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const pages = await sql<{
    slug: string; title: string; doc_type: string; status: string;
    customer_pin: string | null; pin_expires_at: string | null;
    created_at: string; updated_at: string;
  }>(
    `SELECT slug, title, doc_type, status, customer_pin, pin_expires_at, created_at, updated_at
     FROM pages
     WHERE client_id = $1
     ORDER BY updated_at DESC`,
    [session.clientId],
  )

  return NextResponse.json({ pages })
}
