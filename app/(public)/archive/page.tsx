import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getArchiveEntries } from '@/lib/data/archive'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import ArchiveClient from '@/components/archive/ArchiveClient'
import { ArchiveGridSkeleton } from '@/components/archive/ArchiveGrid'
import styles from './page.module.css'

/**
 * ISR — archive data changes rarely. Revalidate every hour.
 * On first request after seeding: fresh Neon query.
 * Subsequent requests within the hour: cached RSC payload.
 *
 * Graceful fallback: if the archive table hasn't been seeded yet
 * (first deploy before hitting /api/admin/seed-archive), the page
 * renders an empty-state instead of a 500.
 */
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: 'The Archive — Every Piece in Motion | Bez Ambar',
  description:
    'Over five hundred Bez Ambar pieces, filmed at the atelier in Los Angeles. Watch each stone under light before you inquire.',
  openGraph: {
    title: 'The Archive · Bez Ambar',
    description: 'Five hundred pieces. Every stone. In motion.',
  },
}

export default async function ArchivePage() {
  // Graceful fallback if archive table not yet seeded
  let entries: ArchiveEntry[] = []
  try {
    entries = await getArchiveEntries()
  } catch {
    // Table not yet created/seeded — hit /api/admin/seed-archive once to populate
  }

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

      {/* ── Filter + grid ── */}
      <main className={styles.main}>
        {entries.length === 0 ? (
          <p className={styles.unseeded}>
            The archive is being catalogued.{' '}
            <a href="/api/admin/seed-archive">Seed the archive →</a>
          </p>
        ) : (
          <Suspense fallback={<ArchiveGridSkeleton />}>
            <ArchiveClient entries={entries} />
          </Suspense>
        )}
      </main>
    </>
  )
}
