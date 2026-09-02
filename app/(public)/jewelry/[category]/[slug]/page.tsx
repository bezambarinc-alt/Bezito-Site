import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { draftMode, cookies } from 'next/headers'
import { unstable_cache } from 'next/cache'
import { getProductBySlug, getProductBySlugPreview, getAllProductParams } from '@/lib/queries'
import { getCategoryLabel } from '@/lib/data/categories'
import { sql } from '@/lib/db'
import { TEMPLATES, isValidTemplateId } from './layouts'
import type { TemplateId } from './layouts'
import type { SpecItem } from '@/types/blocks'
import DraftModeBanner from '@/components/layout/DraftModeBanner'
import { getNonce } from '@/lib/nonce'

export const revalidate = 3600
export const dynamicParams = true

// Active template is cached with a tag so revalidateTag('product-template')
// busts it instantly when the admin switches templates — no waiting for ISR.
const getActiveTemplateId = unstable_cache(
  async (): Promise<TemplateId> => {
    const [row] = await sql<{ value: string }>(
      `SELECT value FROM admin_settings WHERE key = 'active_product_template' LIMIT 1`,
    )
    const val = row?.value ?? 'default'
    // Scope guard — a proposal/showcase template must never render on a public product page
    return (isValidTemplateId(val) && TEMPLATES[val].scope.includes('product')) ? val : 'default'
  },
  ['active-product-template'],
  { tags: ['product-template'] },
)

export async function generateStaticParams() {
  try { return await getAllProductParams() } catch { return [] }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  const { category, slug } = await params
  const { isEnabled: isDraft } = await draftMode()
  const product = isDraft
    ? await getProductBySlugPreview(slug)
    : await getProductBySlug(slug)
  if (!product) return { title: 'Piece Not Found' }
  const s = product.specs
  const canonicalCategory = (s.category ?? category).toLowerCase()
  return {
    title: `${product.name} — Bez Ambar`,
    description: s.lede ?? s.subtitle ?? `${product.name} by Bez Ambar.`,
    openGraph: {
      title: `${product.name} · Bez Ambar`,
      description: s.subtitle ?? product.name,
      images: s.heroPosterUrl ? [{ url: s.heroPosterUrl }] : undefined,
    },
    alternates: { canonical: `https://bezambar.com/jewelry/${canonicalCategory}/${product.slug}` },
  }
}

function buildProductSchema(
  product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>,
  category: string,
) {
  const s = product.specs
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: s.lede ?? s.subtitle ?? `${product.name} — fine jewelry by Bez Ambar.`,
    ...(s.heroPosterUrl ? { image: [s.heroPosterUrl] } : {}),
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'Bez Ambar' },
    ...(s.metal ? { material: s.metal } : {}),
    offers: {
      '@type': 'Offer',
      url: `https://bezambar.com/jewelry/${category}/${product.slug}`,
      seller: { '@type': 'Organization', name: 'Bez Ambar' },
      availability: 'https://schema.org/InStoreOnly',
      priceCurrency: 'USD',
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category: urlCategory, slug } = await params

  // ── Product resolution ───────────────────────────────────────────────────
  const { isEnabled: isDraft } = await draftMode()
  let product = await getProductBySlug(slug)
  if (!product) {
    if (isDraft) {
      // Admin preview — show inactive products without redirecting
      product = await getProductBySlugPreview(slug)
      if (!product) notFound()
    } else {
      // External user hit an inactive or removed product URL.
      // If the product exists but is inactive, redirect home (don't 404).
      // If it truly doesn't exist, return 404.
      const inactive = await getProductBySlugPreview(slug)
      if (inactive) redirect('/')
      notFound()
    }
  }

  // ── Template resolution ──────────────────────────────────────────────────
  let templateId: TemplateId = await getActiveTemplateId()

  if (isDraft) {
    // In draft mode: override with whichever template is being previewed
    const jar = await cookies()
    const previewId = jar.get('preview_template')?.value ?? ''
    if (isValidTemplateId(previewId)) templateId = previewId
  }

  const Layout = TEMPLATES[templateId]?.component ?? TEMPLATES.default.component
  const templateMeta = TEMPLATES[templateId] ?? TEMPLATES.default
  // ────────────────────────────────────────────────────────────────────────

  const s = product.specs
  const heroVideo  = s.heroVideoUrl  ?? product.media.find((m) => m.type === 'video')?.url
  const heroPoster = s.heroPosterUrl ?? product.media.find((m) => m.type === 'video')?.poster
  const onHandPhoto =
    product.media.find((m) => m.label === 'Editorial' && m.type === 'image')?.url ??
    product.media.find((m) => m.type === 'image')?.url ??
    heroPoster

  const category      = (s.category ?? urlCategory).toLowerCase()
  const categoryLabel = getCategoryLabel(category)

  const specItems: SpecItem[] = [
    s.gemStone    ? { label: 'Gem Stone',    body: s.gemStone }    : null,
    s.metal       ? { label: 'Metal',        body: s.metal }       : null,
    s.caratWeight ? { label: 'Carat Weight', body: s.caratWeight } : null,
    s.color       ? { label: 'Color',        body: s.color }       : null,
    s.clarity     ? { label: 'Clarity',      body: s.clarity }     : null,
    { label: 'Made In',  body: 'Los Angeles' },
    { label: 'Inquiry',  body: 'Presented privately by appointment. Reference this piece when you inquire.' },
  ].filter((x): x is SpecItem => x !== null)

  const views = [
    product.view1Url ? { label: 'Top',          url: product.view1Url } : null,
    product.view2Url ? { label: 'Concept',      url: product.view2Url } : null,
    product.view3Url ? { label: 'Stone Sketch', url: product.view3Url } : null,
  ].filter((v): v is { label: string; url: string } => v !== null)

  const productSchema = buildProductSchema(product, category)
  const nonce = await getNonce()

  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, '\\u003c') }}
      />

      {/* Draft mode preview banner — only visible to admins in preview */}
      {isDraft && (
        <DraftModeBanner
          templateName={templateMeta.name}
          exitUrl="/api/draft/exit"
        />
      )}

      <Layout
        product={product}
        heroVideo={heroVideo}
        heroPoster={heroPoster}
        onHandPhoto={onHandPhoto}
        category={category}
        categoryLabel={categoryLabel}
        specItems={specItems}
        views={views}
      />
    </>
  )
}
