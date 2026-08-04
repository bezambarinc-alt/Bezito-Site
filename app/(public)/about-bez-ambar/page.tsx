import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'About Bez Ambar',
  description:
    'Bez Ambar — inventor of the Princess Cut. Four decades of chiseling light from a Los Angeles atelier.',
  openGraph: { title: 'About Bez Ambar', description: 'Inventor of the Princess Cut, since 1979.' },
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Since 1979"
        title="About Bez Ambar"
        intro="Inventor of the Princess Cut, chiseling light from a Los Angeles atelier for over four decades."
      />
      <main className="ba-container ba-section">
        {/* TODO: implement portrait hero + intro/stats + timeline + cuts grid */}
      </main>
    </>
  )
}
