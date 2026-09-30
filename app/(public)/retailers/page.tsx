import type { Metadata } from 'next'
import Link from 'next/link'
import PageHeader from '@/components/layout/PageHeader'
import AtelierBanner from '@/components/common/AtelierBanner'
import { RETAILERS } from '@/lib/data/retailers'

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
  // Alphabetical by display name — the list is short enough that geography
  // would be a worse sort than something a reader can scan.
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <PageHeader
        eyebrow="Where to Find Us"
        title="Authorized Retailers"
        intro="Bez Ambar is carried by a curated network of fine jewelers across the United States. Every piece is made in the Los Angeles atelier."
      />

      <main className="ba-container ba-section">
        <ul
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
            gap: '2rem',
            listStyle: 'none',
            padding: 0,
          }}
        >
          {retailers.map((r) => (
            <li key={r.slug}>
              <Link href={`/retailers/${r.slug}`} style={{ display: 'block' }}>
                <span className="ba-serif" style={{ fontSize: '1.3rem', display: 'block' }}>
                  {r.name}
                </span>
                <span style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>
                  {r.cityState}
                  {r.locations.length > 1 ? ` · ${r.locations.length} locations` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>

      <AtelierBanner />
    </>
  )
}
