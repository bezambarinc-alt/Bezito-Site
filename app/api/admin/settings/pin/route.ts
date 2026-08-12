import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { hash } from 'bcryptjs'
import { sql } from '@/lib/db'

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { pin } = await req.json()
  if (!pin || String(pin).length < 4) {
    return NextResponse.json({ error: 'PIN must be at least 4 digits' }, { status: 400 })
  }

  const pinHash = await hash(String(pin), 12)
  await sql(
    `INSERT INTO admin_settings (key, value) VALUES ('admin_pin', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()`,
    [pinHash],
  )

  return NextResponse.json({ ok: true })
}
