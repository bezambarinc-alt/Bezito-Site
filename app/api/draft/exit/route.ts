import { NextRequest, NextResponse } from 'next/server'
import { draftMode, cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/** Exit Draft Mode and clear the preview_template cookie. */
export async function GET(req: NextRequest) {
  const dm = await draftMode()
  dm.disable()

  const jar = await cookies()
  jar.delete('preview_template')

  // Redirect back to the page they were previewing — same-origin only
  const raw = req.nextUrl.searchParams.get('from') ?? '/jewelry'
  const from = (() => {
    try {
      const u = new URL(raw, req.url)
      if (u.origin !== new URL(req.url).origin) return '/jewelry'
    } catch { return '/jewelry' }
    return raw
  })()
  return NextResponse.redirect(new URL(from, req.url))
}
