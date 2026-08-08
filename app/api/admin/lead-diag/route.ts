import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

/**
 * TEMPORARY diagnostic — checks the live `leads` table schema + Freshsales key
 * presence, and runs a dry insert/rollback so we can see the ACTUAL error
 * behind the /api/lead 500. DELETE this route after use.
 */
export async function GET() {
  const out: Record<string, unknown> = {}

  // 1. Is the Freshsales key visible to the runtime?
  out.freshsalesKeyPresent = Boolean(process.env.FRESHSALES_API_KEY)
  out.freshsalesKeyLen = (process.env.FRESHSALES_API_KEY ?? '').length

  // 2. Does the leads table exist? What columns?
  try {
    const cols = await sql<{ column_name: string; data_type: string; is_nullable: string }>(
      `SELECT column_name, data_type, is_nullable
         FROM information_schema.columns
        WHERE table_name = 'leads'
        ORDER BY ordinal_position`,
    )
    out.leadsColumns = cols
    out.leadsExists = cols.length > 0
  } catch (e) {
    out.leadsSchemaError = String((e as Error)?.message ?? e)
  }

  // 3. Try the exact insert /api/lead runs, then delete it (test row).
  try {
    const [row] = await sql<{ id: number }>(
      `INSERT INTO leads(page_slug, name, email, message, crm_status)
       VALUES ($1,$2,$3,$4,'pending') RETURNING id`,
      ['DIAG-TEST', 'Diag', 'diag@bezambar.com', 'schema diag — auto-deleted'],
    )
    out.insertOk = true
    out.insertId = row?.id
    await sql(`DELETE FROM leads WHERE id = $1`, [row.id])
    out.cleanupOk = true
  } catch (e) {
    out.insertOk = false
    out.insertError = String((e as Error)?.message ?? e)
  }

  return NextResponse.json(out)
}
