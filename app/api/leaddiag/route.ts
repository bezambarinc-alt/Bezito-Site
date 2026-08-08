import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// Public + uncached so the admin middleware doesn't 307 us to /login.
export const dynamic = 'force-dynamic'

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

  // 3. Inspect the FK constraint on leads.page_slug — what parent table/col?
  try {
    const fks = await sql(
      `SELECT
         tc.constraint_name,
         kcu.column_name          AS fk_column,
         ccu.table_name           AS parent_table,
         ccu.column_name          AS parent_column
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
       JOIN information_schema.constraint_column_usage ccu
         ON tc.constraint_name = ccu.constraint_name
       WHERE tc.table_name = 'leads' AND tc.constraint_type = 'FOREIGN KEY'`,
    )
    out.foreignKeys = fks
  } catch (e) {
    out.fkError = String((e as Error)?.message ?? e)
  }

  // 4. Insert with page_slug = NULL (should succeed — proves FK is the only blocker).
  try {
    const [row] = await sql<{ id: number }>(
      `INSERT INTO leads(page_slug, name, email, message, crm_status)
       VALUES ($1,$2,$3,$4,'pending') RETURNING id`,
      [null, 'Diag', 'diag@bezambar.com', 'schema diag — auto-deleted'],
    )
    out.insertNullSlugOk = true
    await sql(`DELETE FROM leads WHERE id = $1`, [row.id])
  } catch (e) {
    out.insertNullSlugOk = false
    out.insertNullSlugError = String((e as Error)?.message ?? e)
  }

  // 5. Show the most recent leads + their CRM status (verify the live flow).
  try {
    const recent = await sql(
      `SELECT id, page_slug, name, email, crm_status, crm_id, created_at
         FROM leads ORDER BY created_at DESC LIMIT 5`,
    )
    out.recentLeads = recent
  } catch (e) {
    out.recentLeadsError = String((e as Error)?.message ?? e)
  }

  return NextResponse.json(out)
}
