import type { Metadata } from 'next'
import { Suspense } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import ProductGrid, { ProductGridSkeleton } from '@/components/product/ProductGrid'

// Touches the DB at request time — opt out of static generation.
export const dynamic = 'force-dynamic'

const LABELS: Record<string, { title: string; intro: string }> = {
  rings: { title: 'Rings', intro: 'Engagement, cocktail and eternity — each stone chiseled to catch the light.' },
  bracelets: { title: 'Bracelets', intro: 'Articulated lines of brilliance for the wrist.' },
  necklaces: { title: 'Necklaces', intro: 'Statement and everyday, drawn from the atelier.' },
  earrings: { title: 'Earrings', intro: 'Studs, drops and hoops in signature Bez Ambar cuts.' },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category } = await params
  const label = LABELS[category]?.title ?? category
  return {
    title: label,
    description: `${label} by Bez Ambar — Los Angeles atelier, since 1979.`,
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const meta = LABELS[category] ?? { title: category, intro: 'From the Bez Ambar atelier.' }

  return (
    <>
      <PageHeader eyebrow="Browse by Category" title={meta.title} intro={meta.intro} />
      <main className="ba-container ba-section">
        {/* Suspense streams the shell first, then the product grid. */}
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid category={category} />
        </Suspense>
      </main>
    </>
  )
}
