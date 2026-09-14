import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getLegacyProductBySlug, getAllLegacySlugs } from '@/lib/data/legacy-products'
import SpecAccordion from '@/components/blocks/SpecAccordion'
import ProdPill from '@/components/layout/ProdPill'
import AtelierBanner from '@/components/common/AtelierBanner'
import type { SpecAccordionBlock } from '@/types/blocks'
import styles from './page.module.css'

export const revalidate = false

export async function generateStaticParams() {
  return getAllLegacySlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = getLegacyProductBySlug(slug)
  if (!product) return { title: 'Piece Not Found' }
  return {
    title: `${product.name} — Bez Ambar`,
    description: product.description,
    openGraph: {
      title: `${product.name} · Bez Ambar`,
      description: product.description,
      images: [{ url: product.imageUrl }],
    },
    alternates: {
      canonical: `https://bezambar.com/legacy/${slug}`,
    },
  }
}

export default async function LegacyProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = getLegacyProductBySlug(slug)
  if (!product) notFound()

  const accordionBlock: SpecAccordionBlock = {
    type: 'spec-accordion',
    title: '',
    items: product.specs,
  }

  return (
    <main data-page="legacy-pdp">
      {/* Hero + info — stacked mobile, side-by-side desktop */}
      <div className={styles.heroContentRow}>

      {/* Hero image */}
      <div className={styles.hero}>
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          priority
          sizes="(min-width: 769px) 52vw, 100vw"
          className={styles.heroImg}
        />
      </div>

      {/* Product info */}
      <section className={styles.content}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{product.categoryLabel}</p>
          <h1 className={styles.title}>{product.name}</h1>
          {product.sku && (
            <p className={styles.ref}>Ref. {product.sku}</p>
          )}
          <p className={styles.description}>{product.description}</p>

          <div className={styles.specsWrap}>
            <p className={styles.specsLabel}>Technical Details</p>
            <SpecAccordion block={accordionBlock} variant="light" />
          </div>
        </div>
      </section>

      </div>{/* end heroContentRow */}

      <AtelierBanner />

      <ProdPill
        title={product.name}
        sku={product.sku ?? undefined}
        category={product.category}
      />
    </main>
  )
}
