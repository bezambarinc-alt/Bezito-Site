import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const rows = await sql<{
    id: number; route: string; model: string; tokens_in: number; tokens_out: number; error: string; created_at: string
  }>(
    `SELECT id, route, model, tokens_in, tokens_out, error, created_at
     FROM generations ORDER BY created_at DESC LIMIT 100`,
  )
  return NextResponse.json({ generations: rows })
}
