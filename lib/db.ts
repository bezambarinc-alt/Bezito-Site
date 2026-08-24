import 'server-only'
import { Pool } from 'pg'
import { attachDatabasePool } from '@vercel/functions'

// Created once at module scope — Fluid compute keeps this warm across invocations.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
})

// Lets Vercel drain idle connections before suspending the function.
attachDatabasePool(pool)

export async function sql<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const { rows } = await pool.query(text, params)
  return rows as T[]
}
