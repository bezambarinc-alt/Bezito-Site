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

// pg emits 'error' on the Pool when an IDLE client dies — which is routine on
// Neon, whose compute suspends after inactivity and drops open sockets. An
// EventEmitter 'error' with no listener is an unhandled exception in Node, so
// without this the whole function instance goes down instead of one request.
// Nothing to do but log: pg has already removed the dead client from the pool
// and the next query opens a fresh one.
pool.on('error', (err) => {
  console.error('[db] idle client error (pool recovers automatically):', err.message)
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
