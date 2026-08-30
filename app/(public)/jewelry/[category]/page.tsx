import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getCategoryMeta, getCategoryLabel, CATEGORIES } from '@/lib/data/categories'
import { getProductsByCategory } from '@/lib/queries'
import CinematicCarousel from '@/components/product/CinematicCarousel'
import AtelierBanner from '@/components/common/AtelierBanner'
import HomeSegment from '@/components/home/HomeSegment'

// Pre-render all known category slugs at build time; revalidate hourly.
export const revalidate = 3600

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const cat = getCategoryMeta(category)
  const label = getCategoryLabel(category)
  return {
    title: `${label} — Bez Ambar`,
    description: cat.intro,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const cat = getCategoryMeta(category)
  const products = await getProductsByCategory(category)

  // Hero = featured product, or most recent (first in list, sorted featured DESC)
  const heroProduct = products.find((p) => p.featured) ?? products[0] ?? null
  // Editorial = next product that isn't the hero
  const editorialProduct = products.find((p) => p.slug !== heroProduct?.slug) ?? null

  const heroVideo  = cat.heroImageUrl ? null : (heroProduct?.specs.heroVideoUrl ?? null)
  const heroPoster = cat.heroImageUrl ?? heroProduct?.specs.heroPosterUrl ?? null

  return (
    <main>
      {/* ── Desktop-only sections ───────────────────────────────────────────── */}

      {/* 1. Hero — full-height on both desktop and mobile */}
      <section className={`ba-portrait-hero ba-portrait-hero--${category}`}>
        {heroVideo ? (
          <video
            src={heroVideo}
            autoPlay muted loop playsInline preload="auto"
            poster={heroPoster ?? undefined}
          />
        ) : heroPoster ? (
          <Image
            src={heroPoster}
            alt={cat.title}
            width={1600}
            height={900}
            priority
          />
        ) : null}
        <div className="ba-portrait-hero__overlay">
          <h1 className="ba-portrait-hero__title">{cat.title}</h1>
          {cat.intro && <p className="ba-portrait-hero__lede">{cat.intro}</p>}
          {heroProduct && (
            <Link
              className="ba-portrait-hero__product-link"
              href={`/jewelry/${category}/${heroProduct.slug}`}
            >
              View {heroProduct.name} →
            </Link>
          )}
        </div>
      </section>

      {/* 2. Editorial spotlight — 1 product, 2-col */}
      {editorialProduct && (
        <HomeSegment
          className="ba-cat-desktop"
          eyebrow={`ref. ${editorialProduct.sku}`}
          title={editorialProduct.name}
          body={editorialProduct.specs.lede ?? editorialProduct.specs.subtitle ?? undefined}
          videoUrl={editorialProduct.specs.heroVideoUrl ?? undefined}
          imageUrl={editorialProduct.specs.heroPosterUrl ?? undefined}
          posterUrl={editorialProduct.specs.heroPosterUrl ?? undefined}
          ctaLabel={`View ${editorialProduct.name}`}
          ctaHref={`/jewelry/${category}/${editorialProduct.slug}`}
        />
      )}

      {/* 3. Cinematic carousel — all products, desktop + mobile */}
      {products.length > 0 && (
        <CinematicCarousel products={products} category={category} />
      )}

      {/* 4. Atelier banner — chiseled wordmark on black */}
      <AtelierBanner />

      {/* Empty state */}
      {products.length === 0 && (
        <p
          style={{
            fontFamily: 'var(--prose)',
            fontSize: '1.1rem',
            color: 'var(--ink-muted)',
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--white)',
          }}
        >
          New pieces for this category are being catalogued. Please inquire for
          current availability.
        </p>
      )}
    </main>
  )
}
