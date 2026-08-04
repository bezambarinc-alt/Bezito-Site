import type { Metadata } from 'next'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'The Elysian Cut',
  description: 'The Elysian Cut™ — Bez Ambar’s philosophy of light, calibration, and fire.',
  openGraph: { title: 'The Elysian Cut · Bez Ambar', description: 'A philosophy of light.' },
}

export default function ElysianCutPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Philosophy"
        title="The Elysian Cut"
        intro="Where geometry becomes light. A calibrated study in fire and precision."
      />
      <main className="ba-container ba-section">
        {/* TODO: implement numbered philosophy + gallery + calibration stats */}
      </main>
    </>
  )
}
