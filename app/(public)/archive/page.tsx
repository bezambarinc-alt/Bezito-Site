import type { Metadata } from 'next'
import { Suspense } from 'react'
import ArchiveFilters from '@/components/archive/ArchiveFilters'
import ArchiveGrid, { ArchiveGridSkeleton } from '@/components/archive/ArchiveGrid'
import styles from './page.module.css'

// Streams the grid; shell + filters are sent immediately.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'The Archive — Bez Ambar',
  description:
    'Over five hundred Bez Ambar pieces, filmed at the atelier in Los Angeles. Watch each stone under light before you inquire.',
  openGraph: {
    title: 'The Archive · Bez Ambar',
    description: 'Five hundred pieces, filmed under atelier light.',
  },
}

export default function ArchivePage() {
  return (
    <>
      {/* ── Dark hero — matches Astro vg-hero style ── */}
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>The Archive</p>
        <h1 className={styles.heroTitle}>Every Piece in Motion</h1>
        <p className={styles.heroLede}>
          Over five hundred Bez Ambar pieces, filmed at the atelier in Los Angeles.
          Watch each stone under light before you inquire.
        </p>
      </section>

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
