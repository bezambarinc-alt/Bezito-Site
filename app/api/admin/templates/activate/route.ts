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

  const parsed = z.object({
    id:    z.string().min(1).max(64),
    scope: z.enum(['product', 'proposal', 'showcase']).default('product'),
  }).safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'invalid input' }, { status: 400 })

  const { id, scope } = parsed.data
  if (!isValidTemplateId(id)) {
    return NextResponse.json({ error: 'unknown template id' }, { status: 400 })
  }

  const settingKey = scope === 'proposal' ? 'active_proposal_template'
                   : scope === 'showcase'  ? 'active_showcase_template'
                   : 'active_product_template'

  await sql(
    `INSERT INTO admin_settings (key, value)
     VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = now()`,
    [settingKey, id],
  )

  // Bust product pages on product scope change
  if (scope === 'product') revalidatePath('/jewelry', 'layout')
  // Bust preview pages on showcase scope change
  if (scope === 'showcase') revalidatePath('/preview', 'layout')

  await audit('admin.template.activated', session.sub as string, { templateId: id, scope })

  return NextResponse.json({ ok: true })
}
