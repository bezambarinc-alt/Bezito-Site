import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { getArchiveEntries } from '@/lib/data/archive'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import ArchiveClient from '@/components/archive/ArchiveClient'
import { ArchiveGridSkeleton } from '@/components/archive/ArchiveGrid'
import AtelierBanner from '@/components/common/AtelierBanner'
import FadeIn from '@/components/common/FadeIn'
import LazyVideo from '@/components/common/LazyVideo'

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

export default async function ArchivePage() {
  let entries: ArchiveEntry[] = []
  try {
    entries = await getArchiveEntries()
  } catch {
    // Archive not yet seeded — hit /api/admin/seed-archive to populate
  }

  // Use first two entries for hero + editorial spotlight
  const heroEntry      = entries[0] ?? null
  const editorialEntry = entries[1] ?? null

  if (entries.length === 0) {
    return (
      <main>
        <section className="ba-portrait-hero">
          <div className="ba-portrait-hero__overlay">
            <p className="ba-portrait-hero__eyebrow">The Archive</p>
            <h1 className="ba-portrait-hero__title">Every Piece in Motion</h1>
          </div>
        </section>
        <p style={{ textAlign: 'center', padding: '4rem 2rem', color: '#888' }}>
          The archive is being catalogued.{' '}
          <a href="/api/admin/seed-archive">Seed the archive →</a>
        </p>
      </main>
    )
  }

  return (
    <main>
      {/* 1. Portrait hero — first archive entry's video */}
      <section className="ba-portrait-hero">
        {heroEntry?.mp4Url && (
          <video
            src={heroEntry.mp4Url}
            autoPlay muted loop playsInline preload="auto"
          />
        )}
        <div className="ba-portrait-hero__overlay">
          <p className="ba-portrait-hero__eyebrow">The Archive</p>
          <h1 className="ba-portrait-hero__title">Every Piece in Motion</h1>
          <p className="ba-portrait-hero__lede">
            Over five hundred Bez Ambar pieces, filmed at the atelier in Los Angeles.
            Watch each stone under light before you inquire.
          </p>
          {heroEntry && (
            <Link
              className="ba-portrait-hero__product-link"
              href={`/archive?id=${heroEntry.slug}`}
            >
              View {heroEntry.title} →
            </Link>
          )}
        </div>
      </section>

      {/* 2. Editorial spotlight — second archive entry */}
      {editorialEntry && (
        <div className="ba-segment ba-cat-desktop">
          <div className="ba-segment__media">
            {editorialEntry.mp4Url ? (
              <LazyVideo src={editorialEntry.mp4Url} />
            ) : null}
          </div>
          <div className="ba-segment__text">
            <FadeIn delay={0.1}>
              <span className="ba-eyebrow">ref. {editorialEntry.sku}</span>
              <h2 className="ba-segment__heading">{editorialEntry.title}</h2>
              {editorialEntry.category && (
                <p className="ba-segment__ref">{editorialEntry.category}</p>
              )}
              <Link
                className="ba-segment__link"
                href={`/archive?id=${editorialEntry.slug}`}
              >
                View {editorialEntry.title}
              </Link>
            </FadeIn>
          </div>
        </div>
      )}

      {/* 3. Filter + Carousel (client) */}
      <Suspense fallback={<ArchiveGridSkeleton />}>
        <ArchiveClient entries={entries} />
      </Suspense>

      {/* 4. Atelier banner */}
      <AtelierBanner />
    </main>
  )
}
