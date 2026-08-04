import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const [row] = await sql<{ val: number }>('SELECT 1 AS val')
  return NextResponse.json({ ok: true, db: row.val === 1 })
}
