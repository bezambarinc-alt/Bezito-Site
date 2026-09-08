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
  'https://res.cloudinary.com/dlg2mou53/image/upload/v1788911413/Jewelry%20Images/Rings/3-stone-oval-engagement-ring-with-blaze.jpg'

const specItems: SpecItem[] = [
  { label: 'Center Stone', body: 'Oval center · engagement ring prices do not include center stones' },
  { label: 'Side Diamonds', body: 'Halfway shank of Blaze® cut diamonds' },
  { label: 'Bands', body: 'Black and white ring enhancer bookend bands · sold separately or as a set' },
  { label: 'Metal', body: 'Platinum · rose or yellow gold' },
  { label: 'Reference', body: '1TRI2CZ12-OV + 35602TB' },
  { label: 'Made In', body: 'Los Angeles' },
  { label: 'Inquiry', body: 'Presented privately by appointment. Reference this piece when you inquire.' },
]

const accordionBlock: SpecAccordionBlock = { type: 'spec-accordion', title: '', items: specItems }

export const metadata: Metadata = {
  title: '3 Stone Oval Engagement Ring with Blaze | Bez Ambar',
  description:
    'Trio Oval Wedding Set — a classic yet modern three stone engagement ring with an oval center, a halfway shank of Blaze® cut diamonds, and black and white ring enhancer bookend bands.',
  openGraph: {
    title: 'Trio Oval Wedding Set · Bez Ambar',
    description: 'Three stone oval engagement ring with Blaze® cut diamonds.',
    images: [{ url: IMAGE }],
  },
  alternates: {
    canonical: 'https://bezambar.com/shop/3-stone-oval-engagement-ring-with-blaze',
  },
}

const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Trio Oval Wedding Set',
  description:
    'A classic yet modern three stone engagement ring with an oval center, a halfway shank of Blaze® cut diamonds, and black and white ring enhancer bookend bands.',
  image: [IMAGE],
  sku: '1TRI2CZ12-OV',
  brand: { '@type': 'Brand', name: 'Bez Ambar' },
  offers: {
    '@type': 'Offer',
    url: 'https://bezambar.com/shop/3-stone-oval-engagement-ring-with-blaze',
    seller: { '@type': 'Organization', name: 'Bez Ambar' },
    availability: 'https://schema.org/InStoreOnly',
    priceCurrency: 'USD',
  },
}

export default async function TrioOvalWeddingSetPage() {
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
              alt="3 Stone Oval Engagement Ring with Blaze cut diamonds"
              width={666}
              height={666}
              priority
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>Engagement Rings</p>
            <h1 className={styles.heroTitle}>Trio Oval Wedding Set</h1>
            <p className={styles.heroSubtitle}>Three stones, one oval center, Blaze® cut diamonds.</p>
            <p className={styles.heroRefLine}>Ref. 1TRI2CZ12-OV + 35602TB</p>
            <p className={styles.heroCopy}>
              A classic yet modern three stone engagement ring featuring a lovely oval center
              stone and a halfway shank of Blaze® cut diamonds, along with black and white ring
              enhancer bookend bands. Available in platinum, rose, and yellow gold — sold
              separately or as a set.
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
          title="Trio Oval Wedding Set"
          sku="1TRI2CZ12-OV"
          category="rings"
          prevProduct={null}
          nextProduct={null}
        />
      </main>
    </>
  )
}
