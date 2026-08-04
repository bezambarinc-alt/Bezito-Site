import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'

export const dynamic = 'force-dynamic'

function titleCase(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const name = titleCase(slug)
  return { title: name, description: `The ${name} collection by Bez Ambar.` }
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <>
      <PageHeader eyebrow="Collection" title={titleCase(slug)} intro="A curated chapter from the atelier." />
      <main className="ba-container ba-section">
        {/* TODO: implement portrait-hero + spotlight + pull-quote + product-grid + CTA */}
      </main>
    </>
  )
}
