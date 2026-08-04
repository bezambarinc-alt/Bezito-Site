import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'Diamond Education',
  description: 'The 4Cs, diamond shapes, and anatomy — a guide from the Bez Ambar atelier.',
  openGraph: { title: 'Diamond Education · Bez Ambar', description: 'The 4Cs, shapes, and anatomy.' },
}

export default function DiamondEducationPage() {
  return (
    <>
      <PageHeader eyebrow="A Guide" title="Diamond Education" intro="Understanding the light before you own it." />
      <main className="ba-container ba-section">
        {/* TODO: implement tab-bar + 4Cs section + shapes + anatomy */}
      </main>
    </>
  )
}
