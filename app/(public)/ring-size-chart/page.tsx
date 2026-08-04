import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'Ring Size Chart',
  description: 'Find your ring size with the Bez Ambar measurement guide.',
  openGraph: { title: 'Ring Size Chart · Bez Ambar', description: 'The measurement guide.' },
}

export default function RingSizeChartPage() {
  return (
    <>
      <PageHeader eyebrow="Fit Guide" title="Ring Size Chart" intro="Precision begins with the measure." />
      <main className="ba-container ba-section">
        {/* TODO: implement measurement guide + printable sizer + conversion table */}
      </main>
    </>
  )
}
