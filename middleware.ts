import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1. Internal machine callers (Bezito, Cron) — bearer secret, bypass cookie auth.
  if (pathname.startsWith('/api/')) {
    const auth = req.headers.get('authorization') ?? ''
    const isBezito = auth === `Bearer ${process.env.BEZITO_SECRET}`
    const isCron   = auth === `Bearer ${process.env.CRON_SECRET}`
    const isPublic = pathname === '/api/lead' || pathname.startsWith('/api/auth/')
    if (isBezito || isCron || isPublic) return NextResponse.next()
    // /api/health is public too
    if (pathname === '/api/health') return NextResponse.next()
    // admin API falls through to cookie check below
  }

  // 2. Admin humans — verify jose JWT cookie
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    const token = req.cookies.get('session')?.value
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      // /admin/dev is Kevin-only
      if (pathname.startsWith('/admin/dev') && payload.role !== 'kevin') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // 3. Tenant resolver for client pages
  if (pathname.startsWith('/client/')) {
    const slug = pathname.split('/')[2]
    const res = NextResponse.next()
    if (slug) res.headers.set('x-tenant', slug)
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*', '/client/:path*'],
}
