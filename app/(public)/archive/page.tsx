import type { Metadata } from 'next'
import { Suspense } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import ArchiveFilters from '@/components/archive/ArchiveFilters'
import ArchiveGrid, { ArchiveGridSkeleton } from '@/components/archive/ArchiveGrid'
import styles from './page.module.css'

// Streams the grid; shell + filters are sent immediately.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'The Archive',
  description: 'Four decades of Bez Ambar — a living archive of pieces from the atelier.',
  openGraph: { title: 'The Archive · Bez Ambar', description: 'A living archive of the atelier.' },
}

export default function ArchivePage() {
  return (
    <>
      <PageHeader
        eyebrow="Four Decades"
        title="The Archive"
        intro="A living record of pieces chiseled at the Bez Ambar atelier."
      />
      <main className={styles.layout}>
        <ArchiveFilters />
        <div className={styles.gridCol}>
          <Suspense fallback={<ArchiveGridSkeleton />}>
            <ArchiveGrid />
          </Suspense>
        </div>
      </main>
    </>
  )
}
