import type { Metadata } from 'next'
import Link from 'next/link'
import { RETAILERS } from '@/lib/data/retailers'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Authorized Retailers',
  description:
    'Find Bez Ambar fine jewelry at authorized retailers across the United States — Blaze®, Elysian Cut™ and bespoke pieces, shown in person.',
  openGraph: {
    title: 'Authorized Retailers · Bez Ambar',
    description: 'Where to see Bez Ambar fine jewelry in person.',
  },
}

export default function RetailersIndex() {
  const retailers = [...RETAILERS].sort((a, b) => a.name.localeCompare(b.name))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bez Ambar Authorized Retailers',
    itemListElement: retailers.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: r.name,
      url: `https://bezambar.com/retailers/${r.slug}`,
    })),
  }

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      {/* ── Masthead ── */}
      <header className={styles.masthead}>
        <p className={styles.mastheadEyebrow}>Find Us In Person</p>
        <h1 className={styles.mastheadTitle}>Authorized Retailers</h1>
        <hr className={styles.mastheadRule} />
        <p className={styles.mastheadLede}>
          Bez Ambar is carried by a curated network of fine jewelers across the United States.
          Each retailer is personally selected — every piece is made in the Los Angeles atelier
          and shown by appointment at locations nationwide.
        </p>
      </header>

      {/* ── Retailer grid ── */}
      <ul className={styles.grid}>
        {retailers.map((r) => (
          <li key={r.slug} className={styles.card}>
            <span className={styles.cardLabel}>
              {r.locations.length > 1 ? `${r.locations.length} Locations` : r.locations[0].city}
            </span>
            <Link href={`/retailers/${r.slug}`} className={styles.cardName}>
              {r.name}
            </Link>
            <p className={styles.cardMeta}>{r.cityState}</p>
          </li>
        ))}
      </ul>

      {/* ── Services strip ── */}
      <div className={styles.services}>
        <div className={styles.servicesInner}>
          <div>
            <p className={styles.serviceLabel}>13 Locations</p>
            <p className={styles.serviceText}>Authorized showrooms across the United States</p>
          </div>
          <div>
            <p className={styles.serviceLabel}>Private Appointments</p>
            <p className={styles.serviceText}>Many locations offer private viewings by request</p>
          </div>
          <div>
            <p className={styles.serviceLabel}>Elysian Cut™ · Blaze®</p>
            <p className={styles.serviceText}>Proprietary cuts exclusive to the Bez Ambar collection</p>
          </div>
          <div>
            <p className={styles.serviceLabel}>LA Atelier</p>
            <p className={styles.serviceText}>Every piece made in Los Angeles — 611 Wilshire Blvd</p>
          </div>
        </div>
      </div>
    </main>
  )
}
