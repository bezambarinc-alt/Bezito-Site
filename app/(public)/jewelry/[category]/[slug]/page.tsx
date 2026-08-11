import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductBySlug, getAllProductParams } from '@/lib/queries'
import { getCategoryLabel } from '@/lib/data/categories'
import HeroVideo from '@/components/blocks/HeroVideo'
import FadeIn from '@/components/common/FadeIn'
import SpecAccordion from '@/components/blocks/SpecAccordion'
import InquireCta from '@/components/blocks/InquireCta'
import ProductGallery from '@/components/product/ProductGallery'
import ProdPill from '@/components/layout/ProdPill'
import type { SpecItem } from '@/types/blocks'
import styles from './page.module.css'

// ISR — product pages rebuilt from Neon cache at most hourly.
export const revalidate = 3600
export const dynamicParams = true

export async function generateStaticParams() {
  try {
    return await getAllProductParams()
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Piece Not Found' }
  return {
    title: product.name,
    description: product.specs.lede ?? product.specs.subtitle ?? `${product.name} by Bez Ambar.`,
    openGraph: {
      title: `${product.name} · Bez Ambar`,
      description: product.specs.subtitle ?? product.name,
      images: product.specs.heroPosterUrl ? [{ url: product.specs.heroPosterUrl }] : undefined,
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
  const heroVideo      = s.heroVideoUrl   ?? product.media.find((m) => m.type === 'video')?.url
  const heroPoster     = s.heroPosterUrl  ?? product.media.find((m) => m.type === 'video')?.poster
  const secondaryVideo = s.secondaryVideoUrl

  // Derive category from the product's own Neon data — authoritative over URL param
  const category      = (product.specs.category ?? urlCategory).toLowerCase()
  const categoryLabel = getCategoryLabel(category)

  const specItems: SpecItem[] = [
    s.gemStone    ? { label: 'Gem Stone',     body: s.gemStone }                           : null,
    s.metal       ? { label: 'Metal',         body: s.metal }                              : null,
    s.caratWeight ? { label: 'Carat Weight',  body: s.caratWeight }                        : null,
    s.color       ? { label: 'Color',         body: s.color }                              : null,
    s.clarity     ? { label: 'Clarity',       body: s.clarity }                            : null,
    { label: 'Made In',  body: s.madeIn ?? 'Los Angeles' },
    { label: 'Inquiry',  body: 'Presented privately by appointment. Reference this piece when you inquire.' },
  ].filter((x): x is SpecItem => x !== null)

  return (
    <main>
      {/* ── Full-viewport hero video ── */}
      {heroVideo && (
        <HeroVideo
          block={{
            type: 'hero-video',
            videoUrl: heroVideo,
            posterUrl: heroPoster,
            refId: product.sku,
            refName: s.codeName,
          }}
        />
      )}

      {/* ── Hero text — white bg, centered ── */}
      <section className={styles.hero}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/jewelry">Jewelry</Link>
          <span aria-hidden>·</span>
          <Link href={`/jewelry/${category}`}>{categoryLabel}</Link>
        </nav>

        {/* Product identity */}
        <h1 className={styles.title}>{product.name}</h1>
        {s.subtitle && <p className={styles.subtitle}>{s.subtitle}</p>}
        <p className={styles.refLine}>Ref. {product.sku}</p>
        {s.lede && <p className={styles.lede}>{s.lede}</p>}
      </section>

      {/* ── Still photography gallery ── */}
      <ProductGallery media={product.media} productName={product.name} />

      {/* ── Secondary video ── */}
      {secondaryVideo && (
        <div className={styles.secondary}>
          <video autoPlay muted loop playsInline preload="none" poster={heroPoster}>
            <source src={secondaryVideo} type="video/mp4" />
          </video>
        </div>
      )}

      {/* ── Technical accordion — 2-col matching Astro .technical ── */}
      <section className={styles.technical}>
        <FadeIn className={styles.technicalInner}>
          <p className={styles.technicalLabel}>
            {s.codeName ?? product.name}
          </p>
          <div className={styles.technicalAccordion}>
            <SpecAccordion
              block={{ type: 'spec-accordion', title: 'Specifications', items: specItems }}
              variant="light"
            />
          </div>
        </FadeIn>
      </section>

      {/* ── Inquire CTA (dark) ── */}
      <FadeIn delay={0.1}><InquireCta
        block={{
          type: 'inquire-cta',
          title: 'Request a Private Viewing',
          pieceTitle: product.name,
          sku: product.sku,
          btnLabel: 'Begin a Conversation',
        }}
      /></FadeIn>

      {/* ── Floating pill ── */}
      <ProdPill title={product.name} sku={product.sku} />
    </main>
  )
}
