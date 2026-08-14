import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { sql } from '@/lib/db'
import { TEMPLATES, isValidTemplateId } from '@/app/(public)/jewelry/[category]/[slug]/layouts'
import { getCategoryLabel } from '@/lib/data/categories'
import type { SpecItem } from '@/types/blocks'
import PinGate from './PinGate'

export const dynamic = 'force-dynamic'
export const metadata = { robots: 'noindex' }

type Ctx = { params: Promise<{ slug: string }> }

export default async function PreviewPage({ params }: Ctx) {
  const { slug } = await params

  // Fetch the page — must be a live showcase
  const [page] = await sql<{
    slug: string; title: string; status: string; doc_type: string;
    customer_pin: string | null; pin_expires_at: string | null;
    tenant: string; blocks: unknown;
  }>(
    `SELECT slug, title, status, doc_type, customer_pin, pin_expires_at, tenant, blocks
     FROM pages
     WHERE slug = $1 AND doc_type = 'showcase' AND status = 'live'
     LIMIT 1`,
    [slug],
  )

  if (!page) notFound()

  // Check if PIN is set and not expired
  const requiresPin =
    page.customer_pin !== null &&
    page.pin_expires_at !== null &&
    new Date(page.pin_expires_at) > new Date()

  if (requiresPin) {
    // Check preview cookie
    const jar = await cookies()
    const granted = jar.get(`ba_preview_${slug}`)?.value === '1'
    if (!granted) {
      return <PinGate slug={slug} />
    }
  }

  // Render showcase — pull product data from slug if blocks references a product
  // The blocks JSONB may contain { type: 'product', sku: '...' }
  const blocks = (page.blocks as { type?: string; sku?: string }[] | null) ?? []
  const productBlock = blocks.find(b => b.type === 'product' && b.sku)
  const productSku = productBlock?.sku

  // Attempt to load the product
  const [product] = productSku
    ? await sql<{
        sku: string; name: string; slug: string; category: string; subtitle: string | null;
        editorial: string | null; hero_visual: string | null; editorial_visual: string | null;
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

  // Get active template
  const [templateRow] = await sql<{ value: string }>(
    `SELECT value FROM admin_settings WHERE key = 'active_product_template' LIMIT 1`,
  )
  const templateId = templateRow?.value ?? 'default'
  const template = TEMPLATES[isValidTemplateId(templateId) ? templateId : 'default']
  const Layout = template.component

  // Build spec items
  const specItems: SpecItem[] = []
  if (product) {
    if (product.stone_shape)        specItems.push({ label: 'Stone Shape',    body: product.stone_shape })
    if (product.stone_carats)       specItems.push({ label: 'Carat Weight',   body: product.stone_carats })
    if (product.stone_color)        specItems.push({ label: 'Color',          body: product.stone_color })
    if (product.stone_clarity)      specItems.push({ label: 'Clarity',        body: product.stone_clarity })
    if (product.metal)              specItems.push({ label: 'Metal',          body: product.metal })
    if (product.center_stone_weight) specItems.push({ label: 'Center Stone', body: `${product.center_stone_weight} ct` })
  }

  const views = [
    { label: 'View 1', url: product?.view_1_url },
    { label: 'View 2', url: product?.view_2_url },
    { label: 'View 3', url: product?.view_3_url },
  ]

  const category = product?.category ?? 'jewelry'

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      {product ? (
        <Layout
          product={{
            sku: product.sku,
            name: product.name,
            slug: product.slug,
            plytixId: '',
            price: null,
            media: [],
            syncedAt: '',
            view1Url: product.view_1_url ?? null,
            view2Url: product.view_2_url ?? null,
            view3Url: product.view_3_url ?? null,
            specs: {
              codeName: product.sku,
              subtitle: product.subtitle ?? undefined,
              lede: product.editorial ?? undefined,
              metal: product.metal ?? undefined,
              gemStone: product.stone_shape ?? undefined,
              caratWeight: product.total_carat_weight ? String(product.total_carat_weight) : undefined,
              color: product.stone_color ?? undefined,
              clarity: product.stone_clarity ?? undefined,
              heroVideoUrl: product.hero_visual ?? undefined,
              heroPosterUrl: product.editorial_visual ?? undefined,
            },
          }}
          heroVideo={product.hero_visual ?? undefined}
          heroPoster={product.editorial_visual ?? undefined}
          onHandPhoto={product.editorial_visual ?? undefined}
          category={category}
          categoryLabel={getCategoryLabel(category)}
          specItems={specItems}
          views={views}
        />
      ) : (
        // Fallback: no product linked — show title only
        <div style={{ maxWidth: 640, margin: '80px auto', padding: '0 24px', fontFamily: 'Georgia, serif' }}>
          <h1 style={{ fontSize: 28, fontWeight: 400, color: '#1a1a1a' }}>{page.title}</h1>
        </div>
      )}
    </div>
  )
}
