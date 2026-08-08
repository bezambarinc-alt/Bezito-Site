import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

// TEMP schema inspector — lists all tables + columns so we can find the right
// home for SKU/ref on leads. DELETE after use.
export const dynamic = 'force-dynamic'

export async function GET() {
  const out: Record<string, unknown> = {}

  // All base tables in public schema
  const tables = await sql<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' AND table_type='BASE TABLE'
      ORDER BY table_name`,
  )
  out.tables = tables.map(t => t.table_name)

  // Full column list for leads + any table that looks product/archive/sku related
  const cols = await sql<{ table_name: string; column_name: string; data_type: string }>(
    `SELECT table_name, column_name, data_type
       FROM information_schema.columns
      WHERE table_schema='public'
        AND (table_name = 'leads'
             OR table_name ILIKE '%product%'
             OR table_name ILIKE '%archive%'
             OR table_name = 'pages')
      ORDER BY table_name, ordinal_position`,
  )
  out.columns = cols

  // Any column named like sku / ref anywhere
  const skuish = await sql<{ table_name: string; column_name: string }>(
    `SELECT table_name, column_name FROM information_schema.columns
      WHERE table_schema='public'
        AND (column_name ILIKE '%sku%' OR column_name ILIKE '%ref%'
             OR column_name ILIKE '%product%' OR column_name ILIKE '%piece%')
      ORDER BY table_name, column_name`,
  )
  out.skuRefColumns = skuish

  return NextResponse.json(out)
}
