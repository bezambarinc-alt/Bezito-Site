import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// TEMP verify + cleanup — shows recent leads (to confirm sku column populated),
// then deletes the sku-test row. DELETE this route after use.
export const dynamic = 'force-dynamic'

export async function GET() {
  const recent = await sql(
    `SELECT id, page_slug, sku, name, email, message, crm_status, crm_id
       FROM leads ORDER BY created_at DESC LIMIT 5`,
  )
  const deleted = await sql<{ id: number; email: string }>(
    `DELETE FROM leads
      WHERE email IN ('bezito-skutest@bezambar.com')
      RETURNING id, email`,
  )
  return NextResponse.json({ recent, deleted })
}
