import type { Metadata } from 'next'
import Link from 'next/link'
import PageHeader from '@/components/layout/PageHeader'
import { getActiveCategories } from '@/lib/queries'
import { getCategoryMeta } from '@/lib/data/categories'

export const metadata: Metadata = {
  title: 'Jewelry',
  description: 'Rings, bracelets, necklaces and earrings from the Bez Ambar atelier.',
  openGraph: { title: 'Jewelry · Bez Ambar', description: 'The Bez Ambar collections.' },
}

export const revalidate = 3600

export default async function JewelryLanding() {
  const categories = await getActiveCategories()

  return (
    <>
      <PageHeader eyebrow="The Collections" title="Jewelry" intro="Light, chiseled into form." />
      <main className="ba-container ba-section">
        <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem' }}>
          {categories.map((cat) => {
            const slug = cat.toLowerCase()
            const meta = getCategoryMeta(slug)
            return (
              <li key={slug}>
                <Link href={`/jewelry/${slug}`} className="ba-serif" style={{ fontSize: '1.4rem' }}>
                  {meta?.title ?? cat} →
                </Link>
              </li>
            )
          })}
        </ul>
      </main>
    </>
  )
}
