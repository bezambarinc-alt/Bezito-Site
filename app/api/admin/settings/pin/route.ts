import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { hash } from 'bcryptjs'
import { sql } from '@/lib/db'
import { audit } from '@/lib/audit'

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = z.object({ pin: z.string().min(4).max(20) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'PIN must be at least 4 characters' }, { status: 400 })
  }

  const pinHash = await hash(parsed.data.pin, 12)
  await sql(
    `INSERT INTO admin_settings (key, value) VALUES ('admin_pin', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()`,
    [pinHash],
  )

  await audit('admin.pin.changed', session.sub as string)
  return NextResponse.json({ ok: true })
}
