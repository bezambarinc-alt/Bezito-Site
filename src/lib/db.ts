import { Pool } from 'pg'
import { attachDatabasePool } from '@vercel/functions'

// Single pool at module scope — Fluid compute keeps it warm across invocations
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
})

attachDatabasePool(pool)

export async function sql<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const { rows } = await pool.query(text, params)
  return rows as T[]
}
