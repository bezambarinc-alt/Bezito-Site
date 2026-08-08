import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// TEMPORARY one-shot cleanup — deletes the CRM verification test leads, then
// this route is removed. Matches only the exact test emails used.
export const dynamic = 'force-dynamic'

export async function GET() {
  const deleted = await sql<{ id: number; email: string }>(
    `DELETE FROM leads
      WHERE email IN ('bezito-crm-test@bezambar.com','bezito-verify@bezambar.com','diag@bezambar.com')
      RETURNING id, email`,
  )
  return NextResponse.json({ deleted })
}
