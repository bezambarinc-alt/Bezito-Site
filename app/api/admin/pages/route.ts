import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(_req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
