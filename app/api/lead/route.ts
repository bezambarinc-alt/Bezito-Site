import { NextRequest, NextResponse } from 'next/server'
import { getGeo } from '@/lib/geo'
import { checkRateLimit, recordAttempt } from '@/lib/rate-limit'
import { createLead } from '@/lib/leads'

// REST entry point for client-side fetch callers (ArchiveModal, Newsletter).
// All lead-creation + Zoho logic lives in lib/leads.ts — this handler owns only
// the HTTP concerns: rate limiting, input validation, and status codes.
export async function POST(req: NextRequest) {
  const { ip } = getGeo(req)
  const { allowed } = await checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '900' } },
    )
  }
  await recordAttempt(ip, true)

  const body = await req.json().catch(() => null) as {
    name?: string
    email?: string
    message?: string
    intent?: string
    sku?: string
    // Accept BOTH key styles — REST callers send snake_case `page_slug`;
    // be tolerant of camelCase `pageSlug` too.
    pageSlug?: string
    page_slug?: string
  } | null

  const email = body?.email
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }

  try {
    await createLead({
      name: body?.name ?? null,
      email,
      intent: body?.intent ?? null,
      sku: body?.sku ?? null,
      message: body?.message ?? null,
      // pageSlug is the site path (e.g. "jewelry/rings/c-0754"); sku is the piece reference.
      pageSlug: body?.pageSlug ?? body?.page_slug ?? null,
    })
  } catch {
    // Only a Neon INSERT failure reaches here — the lead could not be recorded.
    return NextResponse.json({ error: 'could not record inquiry' }, { status: 500 })
  }

  // 200 — lead is safe in Neon regardless of CRM outcome.
  return NextResponse.json({ ok: true })
}
