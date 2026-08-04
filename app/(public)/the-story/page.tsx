import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'The Story',
  description: 'The Bez Ambar story — a horizontal journey through four decades of craft.',
  openGraph: { title: 'The Story · Bez Ambar', description: 'Four decades of craft.' },
}

export default function TheStoryPage() {
  return (
    <>
      <PageHeader eyebrow="Heritage" title="The Story" intro="A life measured in light." />
      <main className="ba-container ba-section">
        {/* TODO: implement horizontal scrolling timeline */}
      </main>
    </>
  )
}
