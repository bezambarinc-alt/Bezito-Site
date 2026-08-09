import type { Metadata } from 'next'
import Link from 'next/link'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'Jewelry',
  description: 'Rings, bracelets, necklaces and earrings from the Bez Ambar atelier.',
  openGraph: { title: 'Jewelry · Bez Ambar', description: 'The Bez Ambar collections.' },
}

const CATEGORIES = [
  { slug: 'rings', label: 'Rings' },
  { slug: 'bracelets', label: 'Bracelets' },
  { slug: 'necklaces', label: 'Necklaces' },
  { slug: 'earrings', label: 'Earrings' },
]

export default function JewelryLanding() {
  return (
    <>
      <PageHeader eyebrow="The Collections" title="Jewelry" intro="Light, chiseled into form." />
      <main className="ba-container ba-section">
        {/* TODO: implement full landing hero + collection strips */}
        <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem' }}>
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <Link href={`/jewelry/${c.slug}`} className="ba-serif" style={{ fontSize: '1.4rem' }}>
                {c.label} →
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
