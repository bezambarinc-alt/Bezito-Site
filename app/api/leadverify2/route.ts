import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// TEMP verify + cleanup — confirms intent column populates, then purges the test
// row. DELETE this route after use.
export const dynamic = 'force-dynamic'

export async function GET() {
  const recent = await sql(
    `SELECT id, page_slug, sku, intent, name, email, message, crm_status
       FROM leads ORDER BY created_at DESC LIMIT 5`,
  )
  const deleted = await sql<{ id: number; email: string }>(
    `DELETE FROM leads
      WHERE email IN ('bezito-intenttest@bezambar.com')
      RETURNING id, email`,
  )
  return NextResponse.json({ recent, deleted })
}
