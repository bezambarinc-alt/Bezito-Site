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
  return { title: titleCase(slug), description: `${titleCase(slug)} — from the Bez Ambar journal.` }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <>
      <PageHeader eyebrow="Journal" title={titleCase(slug)} />
      <main className="ba-container ba-section">
        {/* TODO: implement post-hero + hero media + markdown content + CTA box + related articles */}
      </main>
    </>
  )
}
