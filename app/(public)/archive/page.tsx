import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getArchiveEntries } from '@/lib/data/archive'
import ArchiveClient from '@/components/archive/ArchiveClient'
import { ArchiveGridSkeleton } from '@/components/archive/ArchiveGrid'
import styles from './page.module.css'

// Re-run on every request so filter URL params are honoured on direct-link.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'The Archive — Every Piece in Motion | Bez Ambar',
  description:
    'Over five hundred Bez Ambar pieces, filmed at the atelier in Los Angeles. Watch each stone under light before you inquire.',
  openGraph: {
    title: 'The Archive · Bez Ambar',
    description: 'Five hundred pieces. Every stone. In motion.',
  },
}

export default function ArchivePage() {
  // Read + enrich static JSON server-side (tag parsing, normalisation).
  // Module-level cache means this is effectively free after the first request.
  const entries = getArchiveEntries()

  return (
    <>
      {/* ── Dark editorial hero ── */}
      <section className={styles.hero}>
        <p className={styles.eyebrow}>The Archive</p>
        <h1 className={styles.title}>Every Piece in Motion</h1>
        <p className={styles.lede}>
          Over five hundred Bez Ambar pieces, filmed at the atelier in Los Angeles.
          Watch each stone under light before you inquire.
        </p>
      </section>

      {/* ── Filter + grid — client shell, streams in via Suspense ── */}
      <main className={styles.main}>
        <Suspense fallback={<ArchiveGridSkeleton />}>
          <ArchiveClient entries={entries} />
        </Suspense>
      </main>
    </>
  )
}
