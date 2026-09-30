import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getCategoryMeta, getCategoryLabel, CATEGORIES } from '@/lib/data/categories'
import { getProductsByCategory } from '@/lib/queries'
import CinematicCarousel from '@/components/product/CinematicCarousel'
import AtelierBanner from '@/components/common/AtelierBanner'
import styles from './page.module.css'

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
    title: label,
    description: cat.intro,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params

  // getCategoryMeta falls through to a title-case fallback for any unknown slug,
  // so without this guard every /jewelry/<anything> returns a 200 empty grid.
  if (!CATEGORIES[category]) notFound()

  const cat = getCategoryMeta(category)
  const products = await getProductsByCategory(category)

  // Hero = featured product, or most recent (first in list, sorted featured DESC)
  const heroProduct = products.find((p) => p.featured) ?? products[0] ?? null
  const heroVideo  = cat.heroImageUrl ? null : (heroProduct?.specs.heroVideoUrl ?? null)
  const heroPoster = cat.heroImageUrl ?? heroProduct?.specs.heroPosterUrl ?? null

  return (
    <main>
      {/* ── Desktop-only sections ───────────────────────────────────────────── */}

      {/* 1. Hero — full-height on both desktop and mobile */}
      <section className={`ba-portrait-hero ba-portrait-hero--${category} ${styles.hero}`}>
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
            sizes="100vw"
            priority
          />
        ) : null}
        <div className="ba-portrait-hero__overlay">
          <h1 className="ba-portrait-hero__title">{cat.title}</h1>
          {cat.intro && <p className="ba-portrait-hero__lede">{cat.intro}</p>}
        </div>
      </section>

      {/* 2. White breath between hero and carousel — matches AtelierBanner margin-top below */}
      <div style={{ height: '64px', background: 'var(--white)' }} />

      {/* 3. Cinematic carousel — all products, desktop + mobile */}
      {products.length > 0 && (
        <>
          {/* Crawler-only link list — visually hidden, in server HTML so Googlebot discovers all product pages */}
          <ul style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }} aria-hidden="true">
            {products.map((p) => (
              <li key={p.slug}>
                <a href={`/jewelry/${category}/${p.slug}`}>{p.name}</a>
              </li>
            ))}
          </ul>
          <CinematicCarousel products={products} category={category} />
        </>
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
