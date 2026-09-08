import type { Metadata } from 'next'
import Image from 'next/image'
import SpecAccordion from '@/components/blocks/SpecAccordion'
import ProdPill from '@/components/layout/ProdPill'
import AtelierBanner from '@/components/common/AtelierBanner'
import { getNonce } from '@/lib/nonce'
import type { SpecAccordionBlock, SpecItem } from '@/types/blocks'
import styles from '../../jewelry/[category]/[slug]/page.module.css'

/**
 * Orphan page preserved from the WordPress site (bezambar.com/shop/…).
 * Intentionally an orphan — no nav link, no catalog entry, no DB row.
 * Exempted from the /shop/:slug → /archive redirect in redirects.ts.
 * Style: "Orphan Template" (name locked by Bez 2026-09-08) — single image
 * at natural size top-left, headline + copy right, technical details left
 * with light-gray placeholder right.
 */

const IMAGE =
  'https://res.cloudinary.com/dlg2mou53/image/upload/v1788911058/Jewelry%20Images/Earrings/ruby-flower-hug-earrings.jpg'

const specItems: SpecItem[] = [
  { label: 'Gem Stone', body: 'High-quality ruby and black diamonds' },
  { label: 'Metal', body: '18K white gold' },
  { label: 'Total Carat Weight', body: '1.18 CT · Quality: RB White H-VS' },
  { label: 'Reference', body: 'HUG5FLWRB' },
  { label: 'Made In', body: 'Los Angeles' },
  { label: 'Inquiry', body: 'Presented privately by appointment. Reference this piece when you inquire.' },
]

const accordionBlock: SpecAccordionBlock = { type: 'spec-accordion', title: '', items: specItems }

export const metadata: Metadata = {
  title: 'Five Row Diamond and Ruby Flower Hug Earrings | Bez Ambar',
  description:
    'Five row flower hug earrings in 18K white gold with high-quality ruby and black diamonds. 1.18 total carat weight.',
  openGraph: {
    title: 'Ruby Flower Hug Earrings · Bez Ambar',
    description: 'Five row flower hug earrings with ruby and black diamonds.',
    images: [{ url: IMAGE }],
  },
  alternates: {
    canonical: 'https://bezambar.com/shop/ruby-flower-hug-earrings',
  },
}

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Five Row Diamond and Ruby Flower Hug Earrings',
  description:
    'Five row flower hug earrings in 18K white gold with high-quality ruby and black diamonds. 1.18 total carat weight.',
  image: [IMAGE],
  sku: 'HUG5FLWRB',
  brand: { '@type': 'Brand', name: 'Bez Ambar' },
  offers: {
    '@type': 'Offer',
    url: 'https://bezambar.com/shop/ruby-flower-hug-earrings',
    seller: { '@type': 'Organization', name: 'Bez Ambar' },
    availability: 'https://schema.org/InStoreOnly',
    priceCurrency: 'USD',
  },
}

export default async function RubyFlowerHugEarringsPage() {
  const nonce = await getNonce()
  return (
    <>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, '\\u003c') }}
      />
      <main data-page="pdp">
        {/* ── 1. Hero — image at natural size top-left · headline + copy right ── */}
        <section className={styles.heroSplit}>
          <div style={{ flex: '0 1 auto', alignSelf: 'flex-start', minWidth: 0 }}>
            <Image
              src={IMAGE}
              alt="Five Row Diamond and Ruby Flower Hug Earrings"
              width={750}
              height={750}
              priority
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Earrings</p>
            <h1 className={styles.heroTitle}>Flower Hug Earrings</h1>
            <p className={styles.heroSubtitle}>Five rows of ruby and black diamonds.</p>
            <p className={styles.heroRefLine}>Ref. HUG5FLWRB</p>
            <p className={styles.heroCopy}>
              Five row flower hug earrings in 18K white gold, set with high-quality rubies and
              black diamonds at 1.18 total carat weight.
            </p>
          </div>
        </section>

        {/* ── 2. Technical details left · light-gray placeholder right ── */}
        <section className={styles.contentSplit}>
          <div className={styles.contentLeft}>
            <p className={styles.contentEyebrow}>Technical Details</p>
            <SpecAccordion block={accordionBlock} variant="light" />
          </div>
          <div className={styles.contentRight}>
            <div
              aria-hidden="true"
              style={{
                width: '100%',
                minHeight: '420px',
                height: '100%',
                background: '#e9e8e5',
              }}
            />
          </div>
        </section>

        {/* ── 3. Atelier banner ── */}
        <AtelierBanner />

        {/* ── 4. Inquiry pill ── */}
        <ProdPill
          title="Flower Hug Earrings"
          sku="HUG5FLWRB"
          category="earrings"
          prevProduct={null}
          nextProduct={null}
        />
      </main>
    </>
  )
}
