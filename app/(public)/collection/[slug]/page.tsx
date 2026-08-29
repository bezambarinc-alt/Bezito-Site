import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getProductsByCollection } from '@/lib/queries'
import LazyVideo from '@/components/common/LazyVideo'
import ProductCard from '@/components/product/ProductCard'
import FadeIn from '@/components/common/FadeIn'
import InquiryButton from '@/components/common/InquiryButton'
import AtelierBanner from '@/components/common/AtelierBanner'

export const revalidate = 3600

function titleCase(s: string) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const name = titleCase(slug)
  return {
    title: `${name} Collection — Bez Ambar`,
    description: `The ${name} Collection — fine jewelry from the Bez Ambar atelier.`,
  }
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const products = await getProductsByCollection(slug)

  // Derive display name from first product's collection attribute (canonical case)
  // or fall back to title-casing the slug
  const collectionName = products[0]?.specs.collection ?? titleCase(slug)

  // First 2 products → editorial spotlights; rest → grid
  const spotlights = products.slice(0, 2)
  const gridProducts = products.slice(2)

  // Use first product's hero as the portrait hero
  const heroVideo  = products[0]?.specs.heroVideoUrl
  const heroPoster = products[0]?.specs.heroPosterUrl

  return (
    <main>
      {/* Portrait hero — full viewport */}
      <section className="ba-portrait-hero">
        {heroVideo ? (
          <video src={heroVideo} autoPlay muted loop playsInline preload="auto" />
        ) : heroPoster ? (
          <Image
            src={heroPoster}
            alt={collectionName}
            width={1600}
            height={900}
            priority
          />
        ) : null}
        <div className="ba-portrait-hero__overlay">
          <span className="ba-portrait-hero__eyebrow">Collection</span>
          <h1 className="ba-portrait-hero__title">{collectionName}</h1>
        </div>
      </section>

      {/* Empty state */}
      {products.length === 0 && (
        <p
          style={{
            fontFamily: 'var(--prose)',
            fontSize: '1.1rem',
            color: 'var(--ink-muted)',
            textAlign: 'center',
            padding: '6rem 2rem',
            background: 'var(--white)',
          }}
        >
          New pieces for this collection are being catalogued. Please inquire for availability.
        </p>
      )}

      {/* Editorial spotlight segments — first 2 products */}
      {spotlights.map((product, i) => {
        const video = product.specs.heroVideoUrl
        const image = product.specs.heroPosterUrl
        const cat   = product.specs.category ?? 'jewelry'
        return (
          <div
            key={product.sku}
            className={`ba-segment${i % 2 === 1 ? ' ba-segment--reverse' : ''}`}
          >
            <div className="ba-segment__media">
              {video ? (
                <LazyVideo src={video} poster={image ?? undefined} />
              ) : image ? (
                <Image
                  src={image}
                  alt={product.name}
                  width={800}
                  height={900}
                  style={{ width: '100%', height: 'auto' }}
                />
              ) : null}
            </div>
            <div className="ba-segment__text">
              <FadeIn delay={0.1}>
              <span className="ba-eyebrow">
                {product.name}&nbsp;&nbsp;&middot;&nbsp;&nbsp;ref. {product.sku}
              </span>
              <h2 className="ba-segment__heading">
                {product.specs.subtitle ?? product.name}
              </h2>
              {product.specs.lede && (
                <p className="ba-segment__body">{product.specs.lede}</p>
              )}
              <Link
                className="ba-segment__link"
                href={`/jewelry/${cat}/${product.slug}`}
              >
                View {product.name}
              </Link>
              </FadeIn>
            </div>
          </div>
        )
      })}

      {/* Pull quote */}
      {products.length > 0 && (
        <FadeIn><section className="ba-pull-quote">
          <span className="ba-pull-quote__mark">&ldquo;</span>
          <p className="ba-pull-quote__text">
            Every stone arrives with a language. The setting is the translation.
          </p>
          <span className="ba-pull-quote__attr">Bez Ambar</span>
        </section></FadeIn>
      )}

      {/* Section divider + grid */}
      {gridProducts.length > 0 && (
        <>
          <div className="ba-section-divider">
            <span className="ba-section-divider__eyebrow">{collectionName}</span>
            <h2 className="ba-section-divider__title">The Pieces</h2>
          </div>
          <section className="ba-product-grid">
            {gridProducts.map(p => (
              <ProductCard
                key={p.sku}
                product={p}
                category={p.specs.category ?? 'jewelry'}
              />
            ))}
          </section>
        </>
      )}

      {/* Commission CTA */}
      {products.length > 0 && (
        <FadeIn delay={0.1}><section className="ba-cta">
          <span className="ba-cta__eyebrow">Commission</span>
          <h2 className="ba-cta__title">Create Your Own Piece</h2>
          <p className="ba-cta__body">
            Every Bez Ambar piece begins with one stone and one drawing. Arrange a private
            consultation to commission your own work from the {collectionName} aesthetic.
          </p>
          <InquiryButton className="ba-cta__btn" intent="Commission a Piece">Inquire</InquiryButton>
        </section></FadeIn>
      )}

      <AtelierBanner />
    </main>
  )
}
