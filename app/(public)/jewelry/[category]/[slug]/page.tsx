import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProductBySlug, getAllProductParams } from '@/lib/queries'
import { getCategoryLabel } from '@/lib/data/categories'
import SpecAccordion from '@/components/blocks/SpecAccordion'
import InquireCta from '@/components/blocks/InquireCta'
import ProdPill from '@/components/layout/ProdPill'
import FadeIn from '@/components/common/FadeIn'
import type { SpecItem } from '@/types/blocks'
import styles from './page.module.css'

export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  try { return await getAllProductParams() } catch { return [] }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Piece Not Found' }
  const s = product.specs
  return {
    title: `${product.name} — Bez Ambar`,
    description: s.lede ?? s.subtitle ?? `${product.name} by Bez Ambar.`,
    openGraph: {
      title: `${product.name} · Bez Ambar`,
      description: s.subtitle ?? product.name,
      images: s.heroPosterUrl ? [{ url: s.heroPosterUrl }] : undefined,
    },
    alternates: { canonical: `https://bezambar.com/jewelry/${product.slug}` },
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
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const s = product.specs
  const heroVideo  = s.heroVideoUrl  ?? product.media.find((m) => m.type === 'video')?.url
  const heroPoster = s.heroPosterUrl ?? product.media.find((m) => m.type === 'video')?.poster

  // On-hand photo for content split — prefer editorial image, fall back to poster
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

  // Three Views — filler until view_1/2/3 columns are added to Neon
  const views = [
    { label: 'Front',  url: heroPoster },
    { label: 'Side',   url: heroPoster },
    { label: 'Detail', url: heroPoster },
  ]

  const productSchema = buildProductSchema(product, category)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <main>
        {/* ── 1. Hero split — 55 / 45 ── */}
        <section className={styles.heroSplit}>
          <div className={styles.heroVideo}>
            {heroVideo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <video
                src={heroVideo}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                poster={heroPoster ?? undefined}
              />
            ) : heroPoster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroPoster} alt={product.name} />
            ) : null}
          </div>

          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>{categoryLabel}</p>
            <h1 className={styles.heroTitle}>{product.name}</h1>
            <p className={styles.heroRefLine}>Ref. {product.sku}</p>
            {(s.lede || s.subtitle) && (
              <p className={styles.heroCopy}>{s.lede ?? s.subtitle}</p>
            )}
          </div>
        </section>

        {/* ── 2. Content split ── */}
        <section className={styles.contentSplit}>
          <div className={styles.contentLeft}>
            <p className={styles.contentEyebrow}>Technical Details</p>
            <SpecAccordion
              block={{ type: 'spec-accordion', title: '', items: specItems }}
              variant="light"
            />
          </div>
          <div className={styles.contentRight}>
            {onHandPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={styles.contentPhoto}
                src={onHandPhoto}
                alt={`${product.name} · On Hand`}
                loading="lazy"
              />
            )}
          </div>
        </section>

        {/* ── 3. Three Views (filler until Neon view columns exist) ── */}
        <section className={styles.views}>
          <div className={styles.viewsGrid}>
            {views.map((v, i) => (
              <div key={i} className={styles.viewsItem}>
                <div className={styles.viewsImgWrap}>
                  {v.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className={styles.viewsImg} src={v.url} alt={v.label} loading="lazy" />
                  )}
                </div>
                <p className={styles.viewsLabel}>{v.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. InquireCta ── */}
        <FadeIn delay={0.1}>
          <InquireCta
            block={{
              type: 'inquire-cta',
              title: 'Request a Private Viewing',
              pieceTitle: product.name,
              sku: product.sku,
              btnLabel: 'Begin a Conversation',
            }}
          />
        </FadeIn>

        {/* ── 5. ProdPill — always visible from load ── */}
        <ProdPill title={product.name} sku={product.sku} />
      </main>
    </>
  )
}
