import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { unstable_cache } from 'next/cache'
import { getArchiveEntries } from '@/lib/data/archive'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import ArchiveClient from '@/components/archive/ArchiveClient'
import AtelierBanner from '@/components/common/AtelierBanner'
import HomeSegment from '@/components/home/HomeSegment'

/**
 * `force-dynamic` used to sit here, and the only thing that needed it was a
 * `Math.random()` hero pick (see rotatingIndex below). The page still renders
 * per-request — it reads searchParams — but the archive table is a slow-moving
 * catalogue, so the 560-row read no longer has to happen on every hit.
 *
 * Cached in the Data Cache rather than the render, and tagged: whatever ends up
 * writing to the archive table can call revalidateTag('archive') to bust it the
 * moment the catalogue changes instead of waiting out the hour. (Nothing does
 * yet — the /api/admin/seed-archive endpoint the empty-state mentions below is
 * not in the repo.)
 */
const getArchiveEntriesCached = unstable_cache(
  getArchiveEntries,
  ['archive-entries'],
  { revalidate: 3600, tags: ['archive'] },
)

/**
 * Hero rotation, formerly `Math.floor(Math.random() * heroPool.length)`.
 *
 * Random-per-request meant the page could never be cached at any layer and made
 * the component impure, which the React compiler flags. Rotating on the clock
 * keeps the "different piece each time you come back" effect — it just advances
 * hourly instead of on every paint, and every visitor in a given hour sees the
 * same hero, which is also what makes the render cacheable.
 */
function rotatingIndex(length: number): number {
  if (length <= 0) return 0
  const hoursSinceEpoch = Math.floor(Date.now() / 3_600_000)
  return hoursSinceEpoch % length
}

export const metadata: Metadata = {
  title: 'The Archive — Every Piece in Motion | Bez Ambar',
  description:
    'Over five hundred Bez Ambar pieces, filmed at the atelier in Los Angeles. Watch each stone under light before you inquire.',
  openGraph: {
    title: 'The Archive · Bez Ambar',
    description: 'Five hundred pieces. Every stone. In motion.',
  },
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  let entries: ArchiveEntry[] = []
  try {
    entries = await getArchiveEntriesCached()
  } catch {
    // Archive not yet seeded — hit /api/admin/seed-archive to populate
  }

  // Rotate hero hourly through the first 10 entries; editorial = first entry that isn't the hero
  const heroPool  = entries.slice(0, Math.min(10, entries.length))
  const heroIdx   = rotatingIndex(heroPool.length)
  const heroEntry      = heroPool[heroIdx] ?? null
  const editorialEntry = entries.find((_, i) => i !== heroIdx) ?? null

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
          The archive is being catalogued.
        </p>
      </main>
    )
  }

  return (
    <main>
      {/* 1. Portrait hero — random entry from first 10 */}
      <section className="ba-portrait-hero ba-portrait-hero--archive">
        {heroEntry?.mp4Url ? (
          <video
            src={heroEntry.mp4Url}
            autoPlay muted loop playsInline preload="auto"
            poster={heroEntry.gifUrl ?? undefined}
          />
        ) : heroEntry?.gifUrl ? (
          <Image
            src={heroEntry.gifUrl}
            alt={heroEntry.title}
            width={1600}
            height={900}
            sizes="100vw"
            priority
          />
        ) : null}
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
        <HomeSegment
          className="ba-cat-desktop"
          eyebrow={`ref. ${editorialEntry.sku}`}
          title={editorialEntry.title}
          body={editorialEntry.category ?? undefined}
          videoUrl={editorialEntry.mp4Url ?? undefined}
          ctaLabel={`View ${editorialEntry.title}`}
          ctaHref={`/archive?id=${editorialEntry.slug}`}
        />
      )}

      {/* 3. Filter + Carousel (client) — initial search params passed from server to avoid Suspense CLS */}
      <ArchiveClient
        entries={entries}
        initialCat={sp.cat   ?? 'all'}
        initialShape={sp.shape ?? 'all'}
        initialColor={sp.color ?? 'all'}
        initialOpenId={sp.id   ?? null}
      />

      {/* 4. Atelier banner */}
      <AtelierBanner />
    </main>
  )
}
