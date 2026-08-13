import { NextRequest, NextResponse } from 'next/server'
import { draftMode, cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

/** Exit Draft Mode and clear the preview_template cookie. */
export async function GET(req: NextRequest) {
  const dm = await draftMode()
  dm.disable()

  const jar = await cookies()
  jar.delete('preview_template')

  // Redirect back to the page they were previewing, or /jewelry as fallback
  const from = req.nextUrl.searchParams.get('from') ?? '/jewelry'
  return NextResponse.redirect(new URL(from, req.url))
}
