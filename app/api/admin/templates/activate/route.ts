import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { isValidTemplateId } from '@/app/(public)/jewelry/[category]/[slug]/layouts'
import { audit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/templates/activate
 * Sets the active product page template and busts the ISR cache.
 */
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const parsed = z.object({ id: z.string().min(1).max(64) }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid input' }, { status: 400 })

  const { id } = parsed.data
  if (!isValidTemplateId(id)) {
    return NextResponse.json({ error: 'unknown template id' }, { status: 400 })
  }

  await sql(
    `INSERT INTO admin_settings (key, value)
     VALUES ('active_product_template', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()`,
    [id],
  )

  // Bust all product pages — they pick up the new template on next request
  // without waiting for the 1h ISR window to expire.
  revalidatePath('/jewelry', 'layout')

  await audit('admin.template.activated' as never, session.sub as string, { templateId: id })

  return NextResponse.json({ ok: true })
}
