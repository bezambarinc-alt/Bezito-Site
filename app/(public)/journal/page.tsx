import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Dispatches from the Bez Ambar atelier — craft, stones, and the people behind them.',
  openGraph: { title: 'Journal · Bez Ambar', description: 'From the atelier.' },
}

export default function JournalPage() {
  return (
    <>
      <PageHeader eyebrow="From the Atelier" title="Journal" variant="light" />
      <main className="ba-container ba-section">
        {/* TODO: implement Instagram feed embed + fallback grid */}
      </main>
    </>
  )
}
