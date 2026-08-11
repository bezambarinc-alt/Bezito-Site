import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { RETAILERS, getRetailer, mapEmbedUrl, directionsUrl } from '@/lib/data/retailers'
import styles from './page.module.css'

const COLLECTION_ITEMS = [
  {
    src: 'https://res.cloudinary.com/dlg2mou53/image/upload/c_fill,ar_3:4,w_600,g_center,f_auto,q_auto/v1775786208/Jewelry%20Images/Stones/Quadrillion_owciyv.jpg',
    alt: 'The Princess Cut diamond — the original patented by Bez Ambar',
    title: 'The Princess Cut',
    body: 'The original — created by Bez Ambar in 1979. Precision-cut for maximum brilliance in a square form.',
  },
  {
    src: 'https://res.cloudinary.com/dlg2mou53/image/upload/c_fill,ar_3:4,w_600,g_center,f_auto,q_auto/v1775549202/Jewelry%20Images/Rings/C0625_Baguette_band_Master_e4azkj.jpg',
    alt: 'Bez Ambar diamond baguette band',
    title: 'Diamond Bands',
    body: 'Eternity and anniversary bands set with the same precision that defines every Bez Ambar piece.',
  },
  {
    src: 'https://res.cloudinary.com/dlg2mou53/image/upload/c_fill,ar_3:4,w_600,g_center,f_auto,q_auto/Jewelry%20Images/legacy/10-carat-emerald-cut-diamond-ring-with-blaze.jpg',
    alt: 'Bez Ambar statement diamond ring with Blaze® cut',
    title: 'Statement Pieces',
    body: 'Significant diamonds deserving significant design. Each setting engineered to let light speak first.',
  },
]

// ── Static params for all 13 retailers ──
export function generateStaticParams() {
  return RETAILERS.map((r) => ({ slug: r.slug }))
}

// ── Metadata ──
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const r = getRetailer(slug)
  if (!r) return { title: 'Retailer Not Found' }

  const primaryLoc = r.locations[0]
  const cityState = `${primaryLoc.city}, ${primaryLoc.state}`
  const title = `${r.name} | Authorized Bez Ambar Retailer | ${r.cityState}`
  const description = `Shop Bez Ambar diamond jewelry at ${r.name} in ${r.cityState}. ${r.about.slice(0, 120)}...`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://bezambar.com/retailers/${r.slug}`,
      images: [
        {
          url: 'https://res.cloudinary.com/dlg2mou53/image/upload/c_fill,w_1200,h_630,g_auto,f_auto,q_auto/v1775786208/Jewelry%20Images/Stones/Quadrillion_owciyv.jpg',
          width: 1200,
          height: 630,
        },
      ],
    },
    alternates: { canonical: `https://bezambar.com/retailers/${r.slug}` },
  }
}

// ── Page ──
export default async function RetailerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const r = getRetailer(slug)
  if (!r) notFound()

  const multi = r.locations.length > 1

  // JSON-LD for each location
  const jsonLd = r.locations.map((loc) => ({
    '@context': 'https://schema.org',
    '@type': ['JewelryStore', 'LocalBusiness'],
    name: r.name,
    url: r.website,
    ...(loc.phone ? { telephone: loc.phone } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: loc.street,
      addressLocality: loc.city,
      addressRegion: loc.state,
      postalCode: loc.zip,
      addressCountry: 'US',
    },
    openingHours: loc.hours,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Bez Ambar Diamond Jewelry',
      url: 'https://bezambar.com/collection',
    },
  }))

  return (
    <>
      {/* JSON-LD */}
      {jsonLd.map((data, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}

      <div>
        {/* ── Hero ── */}
        <section
          className={styles.hero}
          style={{ '--hero-img': `url('${r.heroImg}')` } as React.CSSProperties}
        >
          <div className={styles.heroBg} />
          <div className={styles.heroContent}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Bez Ambar</Link>
              <span aria-hidden="true">/</span>
              <Link href="/retailers">Retailers</Link>
              <span aria-hidden="true">/</span>
              <span>{r.shortName}</span>
            </nav>
            <p className={styles.heroEyebrow}>
              {r.cityState}&ensp;&middot;&ensp;Authorized Retailer
            </p>
            <h1 className={styles.heroTitle}>{r.name}</h1>
          </div>
        </section>

        {/* ── Body ── */}
        <div className={styles.body}>

          {/* ── Intro ── */}
          <div className={styles.intro}>
            <div className={styles.introCopy}>
              <p className={styles.introEyebrow}>About This Partner</p>
              <p className={styles.introText}>{r.about}</p>
              <a
                className={styles.introLink}
                href={r.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit {r.shortName} →
              </a>
            </div>

            <div className={styles.introDivider} aria-hidden="true" />

            <div className={styles.introBadge}>
              <p className={styles.introBadgeLabel}>Authorized Bez Ambar Retailer</p>
              <Image
                className={styles.introBadgeLogo}
                src="/logo.svg"
                alt="Bez Ambar"
                width={140}
                height={42}
                loading="lazy"
              />
              <p className={styles.introBadgeNote}>
                Every authorized location is personally selected and trained on the Bez Ambar collection.
              </p>
            </div>
          </div>

          {/* ── Locations ── */}
          <section className={styles.locations}>
            <h2 className={styles.locationsTitle}>
              {multi ? 'Showroom Locations' : 'Visit the Showroom'}
            </h2>

            <div className={`${styles.locsGrid} ${multi ? styles.locsGridMulti : ''}`}>
              {r.locations.map((loc, i) => (
                <div key={i} className={styles.loc}>
                  {loc.label && (
                    <p className={styles.locLabel}>{loc.label}</p>
                  )}

                  <div className={styles.locMapWrap}>
                    <iframe
                      className={styles.locMap}
                      src={mapEmbedUrl(loc)}
                      title={`Map for ${r.name}${loc.label ? ` ${loc.label}` : ''}`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  </div>

                  <div className={styles.locInfo}>
                    <div className={styles.locBlock}>
                      <p className={styles.locBlockLabel}>Address</p>
                      <address className={styles.locAddress}>
                        {loc.street}
                        <br />
                        {loc.city}, {loc.state} {loc.zip}
                      </address>
                    </div>

                    {loc.phone && (
                      <div className={styles.locBlock}>
                        <p className={styles.locBlockLabel}>Phone</p>
                        <a
                          className={styles.locPhone}
                          href={`tel:${loc.phone.replace(/\D/g, '')}`}
                        >
                          {loc.phone}
                        </a>
                      </div>
                    )}

                    <div className={styles.locBlock}>
                      <p className={styles.locBlockLabel}>Hours</p>
                      <p className={styles.locHours}>{loc.hours}</p>
                    </div>

                    <a
                      className={styles.locDirections}
                      href={directionsUrl(loc)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── From the Collection ── */}
        <section className={styles.collection}>
          <div className={styles.collectionInner}>
            <p className={styles.collectionEyebrow}>From the Collection</p>
            <h2 className={styles.collectionTitle}>The Bez Ambar Difference</h2>
          </div>
          <div className={styles.collectionStrip}>
            {COLLECTION_ITEMS.map((item) => (
              <div key={item.title} className={styles.collectionItem}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.src}
                  alt={item.alt}
                  loading="lazy"
                  width={600}
                  height={800}
                />
                <div className={styles.collectionCaption}>
                  <p className={styles.collectionCaptionTitle}>{item.title}</p>
                  <p className={styles.collectionCaptionBody}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── What to Expect ── */}
        <section className={styles.expect}>
          <div className={styles.expectInner}>
            <p className={styles.expectEyebrow}>What to Expect</p>
            <h2 className={styles.expectTitle}>At Every Authorized Showroom</h2>
            <div className={styles.expectGrid}>
              <div className={styles.expectItem}>
                <p className={styles.expectNum}>01</p>
                <h3 className={styles.expectHead}>The Full Collection</h3>
                <p className={styles.expectBody}>
                  This authorized showroom carries Bez Ambar diamond jewelry — including the Princess
                  Cut originals and the Elysian Cut™, the square-brilliant cut patented by Bez Ambar.
                </p>
              </div>
              <div className={styles.expectItem}>
                <p className={styles.expectNum}>02</p>
                <h3 className={styles.expectHead}>Expert Guidance</h3>
                <p className={styles.expectBody}>
                  Authorized retailers are trained on the Bez Ambar collection and can walk you through
                  cut performance, setting options, and custom sizing for any piece.
                </p>
              </div>
              <div className={styles.expectItem}>
                <p className={styles.expectNum}>03</p>
                <h3 className={styles.expectHead}>Authenticity Guaranteed</h3>
                <p className={styles.expectBody}>
                  Every Bez Ambar piece sold by an authorized retailer carries the full manufacturer
                  warranty and certificate of authenticity directly from the atelier.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <section className={styles.cta}>
          <div className={styles.ctaInner}>
            <p className={styles.ctaEyebrow}>Not near {r.ctaCity}?</p>
            <h2 className={styles.ctaTitle}>See All Authorized Retailers</h2>
            <div className={styles.ctaBtns}>
              <Link className={styles.ctaBtnPrimary} href="/retailers">
                View All Locations
              </Link>
              <Link className={styles.ctaBtnGhost} href="/contact">
                Contact the Atelier
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
