import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? '')

export async function proxy(req: NextRequest) {
  const token = req.cookies.get('session')?.value
  // Validate redirect target — relative paths only, no open redirect
  function safeFrom(raw: string): string {
    try {
      const u = new URL(raw, req.url)
      if (u.origin !== new URL(req.url).origin) return '/admin'
    } catch { return '/admin' }
    return raw
  }

  const loginUrl = (from: string) => {
    const url = new URL('/login', req.url)
    url.searchParams.set('from', safeFrom(from))
    return url
  }
  const from = req.nextUrl.pathname + req.nextUrl.search

  if (!token) return NextResponse.redirect(loginUrl(from))

  try {
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(loginUrl(from))
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}
