import type { Metadata } from 'next'
import Image from 'next/image'
import SpecAccordion from '@/components/blocks/SpecAccordion'
import ProdPill from '@/components/layout/ProdPill'
import AtelierBanner from '@/components/common/AtelierBanner'
import { getNonce } from '@/lib/nonce'
import type { SpecAccordionBlock, SpecItem } from '@/types/blocks'
import styles from '../../jewelry/[category]/[slug]/page.module.css'

/**
 * Legacy page preserved from the WordPress site (bezambar.com/shop/…).
 * Intentionally an orphan — no nav link, no catalog entry, no DB row.
 * Exempted from the /shop/:slug → /archive redirect in redirects.ts.
 * Custom layout per Bez (2026-09-04): single image at natural size top-left,
 * headline + copy right, technical details left with light-gray placeholder right.
 */

const IMAGE =
  'https://res.cloudinary.com/dlg2mou53/image/upload/v1788585901/Jewelry%20Images/Rings/maharajah-ring-red-green-diamonds.jpg'

const specItems: SpecItem[] = [
  { label: 'Gem Stone', body: 'Rare red and green diamonds' },
  { label: 'Metal', body: 'Platinum · 18K white, rose or yellow gold' },
  { label: 'Center Stone', body: 'Accommodates different shapes, sizes, and colored center stones' },
  { label: 'Made In', body: 'Los Angeles' },
  { label: 'Inquiry', body: 'Presented privately by appointment. Reference this piece when you inquire.' },
]

const accordionBlock: SpecAccordionBlock = { type: 'spec-accordion', title: '', items: specItems }

export const metadata: Metadata = {
  title: 'Maharajah Ring — Rare Colored Diamonds | Bez Ambar',
  description:
    'The Maharajah ring is a unique design with rare colored diamonds. Available in platinum, 18K white, rose and yellow gold.',
  openGraph: {
    title: 'Maharajah Ring · Bez Ambar',
    description: 'A unique design with rare colored diamonds.',
    images: [{ url: IMAGE }],
  },
  alternates: {
    canonical: 'https://bezambar.com/shop/maharajah-ring-with-red-and-green-diamonds',
  },
}

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Maharajah Ring',
  description:
    'A unique design with rare colored diamonds. Available in platinum, 18K white, rose and yellow gold.',
  image: [IMAGE],
  sku: 'MAHARAJAH',
  brand: { '@type': 'Brand', name: 'Bez Ambar' },
  offers: {
    '@type': 'Offer',
    url: 'https://bezambar.com/shop/maharajah-ring-with-red-and-green-diamonds',
    seller: { '@type': 'Organization', name: 'Bez Ambar' },
    availability: 'https://schema.org/InStoreOnly',
    priceCurrency: 'USD',
  },
}

export default async function MaharajahPage() {
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
              alt="Maharajah Ring with Red and Green Diamonds"
              width={900}
              height={900}
              priority
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Rings</p>
            <h1 className={styles.heroTitle}>Maharajah</h1>
            <p className={styles.heroSubtitle}>A unique design with rare colored diamonds.</p>
            <p className={styles.heroRefLine}>Ref. MAHARAJAH</p>
            <p className={styles.heroCopy}>
              The Maharajah ring is a unique design with rare colored diamonds. Available in
              platinum, 18K white, rose and yellow gold, this design can accommodate different
              shapes, sizes, and colored center stones.
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
          title="Maharajah"
          sku="MAHARAJAH"
          category="rings"
          prevProduct={null}
          nextProduct={null}
        />
      </main>
    </>
  )
}
