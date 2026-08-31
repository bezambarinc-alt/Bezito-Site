import { notFound, redirect } from 'next/navigation'
import { getClientSession } from '@/lib/client-auth'
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { jwtVerify } from 'jose'
import { TEMPLATES, isValidTemplateId } from '@/app/(public)/jewelry/[category]/[slug]/layouts'
import { getCategoryLabel } from '@/lib/data/categories'
import type { SpecItem } from '@/types/blocks'
import PinGate from './PinGate'

export const dynamic = 'force-dynamic'
export const metadata = { robots: 'noindex' }

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

type Ctx = { params: Promise<{ slug: string }>; searchParams?: Promise<Record<string, string>> }

export default async function PreviewPage({ params, searchParams }: Ctx) {
  const { slug } = await params
  const sp = searchParams ? await searchParams : {}
  const tplParam = sp?.tpl ?? null  // admin preview override

  const jar = await cookies()

  // Check admin session independently — used for proposal gate bypass AND template preview bypass.
  // isAdminPreview also requires ?tpl= (template preview mode).
  // isAdmin alone is enough to bypass the proposal client gate.
  const adminToken = jar.get('session')?.value
  let isAdmin = false
  if (adminToken) {
    try {
      const { payload } = await jwtVerify(adminToken, JWT_SECRET)
      isAdmin = !!payload.sub
    } catch { /* invalid session */ }
  }
  const isAdminPreview = isAdmin && tplParam !== null

  // Fetch page — supports showcase (PIN-gated) and proposal (client-gated or shared)
  const [page] = await sql<{
    slug: string; title: string; status: string; doc_type: string;
    client_id: number | null;
    shared: boolean;
    customer_pin: string | null; pin_expires_at: string | null;
    template_id: string | null; tenant: string; blocks: unknown;
  }>(
    `SELECT slug, title, status, doc_type, client_id, shared,
            customer_pin, pin_expires_at, template_id, tenant, blocks
     FROM pages
     WHERE slug = $1 AND doc_type IN ('showcase','proposal') AND status = 'live'
     LIMIT 1`,
    [slug],
  )

  if (!page) notFound()

  // Proposal access gate—
  // Default: portal auth required (only the assigned client can open it).
  // When shared=true: anyone with the link (Bez flipped the Google-Drive-style toggle).
  // Admins (Bez/Kevin) always bypass.
  if (page.doc_type === 'proposal' && !isAdmin) {
    if (!page.shared) {
      const clientSession = await getClientSession()
      const authorized =
        clientSession &&
        (page.client_id === null || clientSession.clientId === page.client_id)
      if (!authorized) {
        // Not logged in as the assigned client — send to portal login.
        // ?from= is handled by the portal login: redirects back here after auth.
        redirect(`/portal/login?from=/preview/${encodeURIComponent(slug)}`)
      }
    }
    // page.shared === true → publicly accessible, fall through
  }

  // PIN check — showcases only (proposals are client-gated, not PIN-gated)
  if (!isAdminPreview && page.doc_type === 'showcase') {
    const requiresPin =
      page.customer_pin !== null &&
      page.pin_expires_at !== null &&
      new Date(page.pin_expires_at) > new Date()

    if (requiresPin) {
      const granted = jar.get(`ba_preview_${slug}`)?.value === '1'
      if (!granted) return <PinGate slug={slug} />
    }
  }

  // Template resolution: ?tpl param (admin preview) → page's own template_id → showcase global → product global
  const [globalRow] = await sql<{ value: string }>(
    `SELECT value FROM admin_settings WHERE key = 'active_showcase_template' LIMIT 1`,
  )

  // First active template valid for showcase scope — used as fallback throughout
  const showcaseFallback = (
    Object.entries(TEMPLATES).find(([, t]) => t.scope.includes('showcase') && t.status === 'active')?.[0]
    ?? 'dark'
  ) as string

  // Validate a template ID is real AND scoped for client-facing pages (proposal or showcase)
  const isValidForPreview = (id: string) =>
    isValidTemplateId(id) &&
    (TEMPLATES[id].scope.includes('showcase') || TEMPLATES[id].scope.includes('proposal'))

  // Validate stored global — prevents a product template bleeding onto preview pages
  const storedGlobal = globalRow?.value
  const globalActive = (storedGlobal && isValidForPreview(storedGlobal)) ? storedGlobal : showcaseFallback

  // Per-page override and admin tpl param also scope-checked
  const resolvedId   = tplParam ?? page.template_id ?? globalActive
  const templateId   = isValidForPreview(resolvedId ?? '') ? resolvedId! : showcaseFallback
  const Layout       = TEMPLATES[templateId].component

  // Product from blocks
  const blocks     = (page.blocks as { type?: string; sku?: string }[] | null) ?? []
  const productSku = blocks.find(b => b.type === 'product' && b.sku)?.sku

  const [product] = productSku
    ? await sql<{
        sku: string; name: string; slug: string; category: string;
        subtitle: string | null; editorial: string | null;
        hero_visual: string | null; editorial_visual: string | null;
        metal: string | null; stone_shape: string | null; stone_carats: string | null;
        stone_color: string | null; stone_clarity: string | null; stone_notes: string | null;
        total_carat_weight: number | null; center_stone_weight: number | null;
        view_1_url: string | null; view_2_url: string | null; view_3_url: string | null;
      }>(
        `SELECT sku, name, slug, category, subtitle, editorial,
                hero_visual, editorial_visual, metal,
                stone_shape, stone_carats, stone_color, stone_clarity, stone_notes,
                total_carat_weight, center_stone_weight,
                view_1_url, view_2_url, view_3_url
         FROM products WHERE sku = $1`,
        [productSku],
      )
    : []

  const specItems: SpecItem[] = []
  if (product) {
    if (product.stone_shape)         specItems.push({ label: 'Stone Shape',    body: product.stone_shape })
    if (product.stone_carats)        specItems.push({ label: 'Carat Weight',   body: product.stone_carats })
    if (product.stone_color)         specItems.push({ label: 'Color',          body: product.stone_color })
    if (product.stone_clarity)       specItems.push({ label: 'Clarity',        body: product.stone_clarity })
    if (product.metal)               specItems.push({ label: 'Metal',          body: product.metal })
    if (product.center_stone_weight) specItems.push({ label: 'Center Stone',   body: `${product.center_stone_weight} ct` })
  }

  const category = product?.category ?? 'jewelry'
  const views = [
    { label: 'View 1', url: product?.view_1_url },
    { label: 'View 2', url: product?.view_2_url },
    { label: 'View 3', url: product?.view_3_url },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {product ? (
        <Layout
          product={{
            sku: product.sku,
            name: product.name,
            slug: product.slug,
            zohoId: '',
            featured: false,
            price: null,
            media: [],
            syncedAt: '',
            view1Url: product.view_1_url ?? null,
            view2Url: product.view_2_url ?? null,
            view3Url: product.view_3_url ?? null,
            specs: {
              codeName:      product.sku,
              subtitle:      product.subtitle      ?? undefined,
              lede:          product.editorial      ?? undefined,
              metal:         product.metal          ?? undefined,
              gemStone:      product.stone_shape    ?? undefined,
              caratWeight:   product.total_carat_weight ? String(product.total_carat_weight) : undefined,
              color:         product.stone_color    ?? undefined,
              clarity:       product.stone_clarity  ?? undefined,
              heroVideoUrl:  product.hero_visual    ?? undefined,
              heroPosterUrl: product.editorial_visual ?? undefined,
            },
          }}
          heroVideo={product.hero_visual    ?? undefined}
          heroPoster={product.editorial_visual ?? undefined}
          onHandPhoto={product.editorial_visual ?? undefined}
          category={category}
          categoryLabel={getCategoryLabel(category)}
          specItems={specItems}
          views={views}
        />
      ) : (
        <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 24px', fontFamily: 'Georgia, serif' }}>
          <h1 style={{ fontSize: 28, fontWeight: 400, color: '#1a1a1a' }}>{page.title}</h1>
        </div>
      )}
    </div>
  )
}
