import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategoryMeta, getCategoryLabel } from '@/lib/data/categories'
import { getProductsByCategory } from '@/lib/queries'
import CategoryCarousel from '@/components/product/CategoryCarousel'
import CategoryMobileReel from '@/components/product/CategoryMobileReel'
import LazyVideo from '@/components/common/LazyVideo'
import FadeIn from '@/components/common/FadeIn'

export const dynamic = 'force-dynamic'

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

  const heroVideo  = heroProduct?.specs.heroVideoUrl  ?? null
  const heroPoster = heroProduct?.specs.heroPosterUrl ?? null

  return (
    <main>
      {/* ── Desktop-only sections ───────────────────────────────────────────── */}

      {/* 1. Hero — featured product video, category title, product link */}
      <section className="ba-portrait-hero ba-cat-desktop">
        {heroVideo && (
          <video
            src={heroVideo}
            autoPlay muted loop playsInline preload="auto"
            poster={heroPoster ?? undefined}
          />
        )}
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
        <div className="ba-segment ba-cat-desktop">
          <div className="ba-segment__media">
            {editorialProduct.specs.heroVideoUrl ? (
              <LazyVideo
                src={editorialProduct.specs.heroVideoUrl}
                poster={editorialProduct.specs.heroPosterUrl ?? undefined}
              />
            ) : editorialProduct.specs.heroPosterUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={editorialProduct.specs.heroPosterUrl} alt={editorialProduct.name} />
            ) : null}
          </div>
          <div className="ba-segment__text">
            <FadeIn delay={0.1}>
              <span className="ba-eyebrow">ref. {editorialProduct.sku}</span>
              <h2 className="ba-segment__heading">{editorialProduct.name}</h2>
              {editorialProduct.specs.subtitle && (
                <p className="ba-segment__ref">{editorialProduct.specs.subtitle}</p>
              )}
              {(editorialProduct.specs.gemStone || editorialProduct.specs.metal) && (
                <p className="ba-segment__ref">
                  {[editorialProduct.specs.gemStone, editorialProduct.specs.metal]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {editorialProduct.specs.lede && (
                <p className="ba-segment__body">{editorialProduct.specs.lede}</p>
              )}
              <Link
                className="ba-segment__link"
                href={`/jewelry/${category}/${editorialProduct.slug}`}
              >
                View {editorialProduct.name}
              </Link>
            </FadeIn>
          </div>
        </div>
      )}

      {/* 3. Desktop banner carousel — all products */}
      {products.length > 0 && (
        <CategoryCarousel products={products} category={category} />
      )}

      {/* ── Mobile-only section ─────────────────────────────────────────────── */}

      {/* 4. Full-screen vertical swipe reel */}
      {products.length > 0 && (
        <CategoryMobileReel products={products} category={category} />
      )}

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
