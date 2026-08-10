import type { Metadata } from 'next'
import Link from 'next/link'
import { getCategoryMeta, getCategoryLabel } from '@/lib/data/categories'
import { getProductsByCategory } from '@/lib/queries'
import ProductCard from '@/components/product/ProductCard'

/**
 * Category page — matches bezambar-web2026 Astro rings/bands/etc page exactly:
 * 1. Portrait hero (full viewport video + overlay)
 * 2. Up to 2 editorial spotlight segments (first 2 products)
 * 3. Pull quote
 * 4. Section divider
 * 5. Product grid (remaining products, ba-product-grid)
 * 6. Commission CTA
 */

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

  // First 2 products become editorial spotlights; rest go into the grid
  const spotlights = products.slice(0, 2)
  const gridProducts = products.slice(2)

  return (
    <main>
      {/* 1. Portrait hero — full viewport, dark, matches ba-portrait-hero */}
      <section className="ba-portrait-hero">
        {cat.videoUrl && (
          <video src={cat.videoUrl} autoPlay muted loop playsInline />
        )}
        <div className="ba-portrait-hero__overlay">
          <span className="ba-portrait-hero__eyebrow">Bez Ambar</span>
          <h1 className="ba-portrait-hero__title">{cat.title}</h1>
          {cat.intro && <p className="ba-portrait-hero__lede">{cat.intro}</p>}
        </div>
      </section>

      {/* 2. Editorial spotlight segments — first 2 products */}
      {spotlights.map((product, i) => {
        const video = product.specs.heroVideoUrl
        const image = product.specs.heroPosterUrl
        return (
          <div
            key={product.sku}
            className={`ba-segment${i % 2 === 1 ? ' ba-segment--reverse' : ''}`}
          >
            <div className="ba-segment__media">
              {video ? (
                <video src={video} autoPlay muted loop playsInline />
              ) : image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={product.name} />
              ) : null}
            </div>
            <div className="ba-segment__text">
              <span className="ba-eyebrow">
                {product.name}&nbsp;&nbsp;&middot;&nbsp;&nbsp;ref. {product.sku}
              </span>
              <h2 className="ba-segment__heading">
                {product.specs.subtitle ?? product.name}
              </h2>
              {(product.specs.gemStone || product.specs.metal) && (
                <p className="ba-segment__ref">
                  {[product.specs.gemStone, product.specs.metal]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {product.specs.lede && (
                <p className="ba-segment__body">{product.specs.lede}</p>
              )}
              <Link
                className="ba-segment__link"
                href={`/jewelry/${category}/${encodeURIComponent(product.sku)}`}
              >
                View {product.name}
              </Link>
            </div>
          </div>
        )
      })}

      {/* 3. Pull quote */}
      <section className="ba-pull-quote">
        <span className="ba-pull-quote__mark">&ldquo;</span>
        <p className="ba-pull-quote__text">
          Every stone arrives with a language. The setting is the translation.
        </p>
        <span className="ba-pull-quote__attr">Bez Ambar</span>
      </section>

      {/* 4. Section divider */}
      <div className="ba-section-divider">
        <span className="ba-section-divider__eyebrow">{cat.title}</span>
        <h2 className="ba-section-divider__title">The Pieces</h2>
      </div>

      {/* 5. Product grid — remaining products after spotlights */}
      {gridProducts.length > 0 && (
        <section className="ba-product-grid">
          {gridProducts.map((p) => (
            <ProductCard key={p.sku} product={p} category={category} />
          ))}
        </section>
      )}

      {/* If only 0–2 products, show them all as spotlights with no grid — still add CTA */}
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

      {/* 6. Commission CTA */}
      <section className="ba-cta">
        <span className="ba-cta__eyebrow">Don&rsquo;t See It</span>
        <h2 className="ba-cta__title">Commission a Piece</h2>
        <p className="ba-cta__body">
          If the piece you&rsquo;re looking for isn&rsquo;t here, it can be
          made. Every Bez Ambar piece begins with one stone and one drawing.
        </p>
        <a href="/contact" className="ba-cta__btn">
          Inquire
        </a>
      </section>
    </main>
  )
}
