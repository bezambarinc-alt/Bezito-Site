import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'

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
  return { title: `${name} — Authorized Retailer`, description: `Bez Ambar at ${name}.` }
}

export default async function RetailerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <>
      <PageHeader eyebrow="Authorized Retailer" title={titleCase(slug)} intro="Discover Bez Ambar in person." />
      <main className="ba-container ba-section">
        {/* TODO: implement map embed + location grid + collection strip */}
      </main>
    </>
  )
}
