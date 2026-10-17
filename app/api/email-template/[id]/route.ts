import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  if (!UUID_RE.test(id)) return new NextResponse('Not found', { status: 404 })

  const rows = await sql<{ html: string }>(
    'SELECT html FROM email_drafts WHERE id = $1',
    [id],
  )
  if (!rows.length) return new NextResponse('Not found', { status: 404 })

  return new NextResponse(rows[0].html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
