import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// TEMP one-shot migration — adds a dedicated `intent` column to `leads` so lead
// type (archive-inquiry / newsletter / appointment intents) is queryable instead
// of buried as an "Intent:" prefix in message text. Nullable text. Idempotent.
// DELETE this route after running once.
export const dynamic = 'force-dynamic'

export async function GET() {
  const out: Record<string, unknown> = {}
  try {
    await sql(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS intent text`)
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
