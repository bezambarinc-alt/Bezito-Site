import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// TEMP one-shot migration — adds a dedicated `sku` column to `leads` so the
// piece/product reference has a real home instead of being buried in the
// message text. Nullable text, no hard FK (a SKU may live in archive OR
// products, and a hard FK would reintroduce the insert-500 problem). DELETE
// this route after running once. Idempotent (IF NOT EXISTS).
export const dynamic = 'force-dynamic'

export async function GET() {
  const out: Record<string, unknown> = {}
  try {
    await sql(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS sku text`)
    out.added = true
    const cols = await sql<{ column_name: string; data_type: string }>(
      `SELECT column_name, data_type FROM information_schema.columns
        WHERE table_name='leads' ORDER BY ordinal_position`,
    )
    out.leadsColumns = cols
  } catch (e) {
    out.error = String((e as Error)?.message ?? e)
  }
  return NextResponse.json(out)
}
