import { NextRequest, NextResponse } from 'next/server'
import { draftMode, cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { isValidTemplateId } from '@/app/(public)/jewelry/[category]/[slug]/layouts'

export const dynamic = 'force-dynamic'

/**
 * Enable Draft Mode for template preview.
 * Only accessible to authenticated admin users.
 *
 * Usage: /api/draft?template=v2&slug=/jewelry/rings/golden-hour
 */
export async function GET(req: NextRequest) {
  // Admin-only — must have a valid session cookie
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const templateId = searchParams.get('template') ?? 'default'
  const slug = searchParams.get('slug') ?? '/jewelry'

  if (!isValidTemplateId(templateId)) {
    return NextResponse.json({ error: 'unknown template' }, { status: 400 })
  }

  // Enable Draft Mode (bypasses ISR cache on the target page)
  const dm = await draftMode()
  dm.enable()

  // Store which template to preview in a short-lived cookie
  const jar = await cookies()
  jar.set('preview_template', templateId, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 2, // 2h — same as email/pw session
  })

  return NextResponse.redirect(new URL(slug, req.url))
}
