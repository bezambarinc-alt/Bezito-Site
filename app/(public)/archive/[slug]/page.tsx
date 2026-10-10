import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getArchiveEntries,
  getArchiveBySlug,
  getArchiveByCategory,
} from '@/lib/data/archive'
import { CATEGORY_FILTERS } from '@/lib/data/archive-constants'
import ArchiveClient from '@/components/archive/ArchiveClient'
import AtelierBanner from '@/components/common/AtelierBanner'
import styles from './page.module.css'

export const revalidate = 3600

/** Non-"all" category filter whose value matches the slug, or undefined. */
function categoryFor(slug: string) {
  return CATEGORY_FILTERS.find(c => c.value !== 'all' && c.value === slug)
}

export async function generateStaticParams() {
  const entries = await getArchiveEntries()
  const pieces = entries.map(e => ({ slug: e.slug }))
  const categories = CATEGORY_FILTERS
    .filter(c => c.value !== 'all')
    .map(c => ({ slug: c.value }))
  return [...categories, ...pieces]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params

  const category = categoryFor(slug)
  if (category) {
    return {
      title: `${category.label} | The Archive | Bez Ambar`,
      description: `Browse ${category.label.toLowerCase()} from the Bez Ambar archive — each piece filmed at the atelier in Los Angeles.`,
      openGraph: {
        title: `${category.label} · The Archive · Bez Ambar`,
        description: `${category.label} from the Bez Ambar archive, every stone in motion.`,
      },
    }
  }

  const entry = await getArchiveBySlug(slug)
  if (!entry) return {}
  return {
    title: `${entry.title} — The Archive`,
    description: entry.description ?? `${entry.title} (${entry.sku}) — filmed at the Bez Ambar atelier in Los Angeles.`,
    openGraph: {
      title: entry.title,
      description: entry.description ?? `${entry.title} · Bez Ambar`,
    },
  }
}

export default async function ArchiveSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // ── Category landing page ──────────────────────────────────────────────────
  const category = categoryFor(slug)
  if (category) {
    const entries = await getArchiveByCategory(category.value)
    if (entries.length === 0) notFound()

    return (
      <main>
        <section className="ba-portrait-hero ba-portrait-hero--archive" style={{ height: '180px' }}>
          <div className="ba-portrait-hero__overlay">
            <p className="ba-portrait-hero__eyebrow">The Archive</p>
            <h1 className="ba-portrait-hero__title">{category.label}</h1>
          </div>
        </section>

        {/* Crawler-only link list — surfaces every piece page to Googlebot. */}
        <ul style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }} aria-hidden="true">
          {entries.map((e) => (
            <li key={e.slug}>
              <a href={`/archive/${e.slug}`}>{e.title}</a>
            </li>
          ))}
        </ul>

        <ArchiveClient
          entries={entries}
          initialCat="all"
          initialShape="all"
          initialColor="all"
          hideCategoryFilter
        />

        <AtelierBanner />
      </main>
    )
  }

  // ── Single-piece page ──────────────────────────────────────────────────────
  const entry = await getArchiveBySlug(slug)
  if (!entry) notFound()

  const tags = [...entry.shapes, ...entry.colors].filter(Boolean)

  return (
    <main className={styles.page}>
      <div className={styles.back}>
        <Link href="/archive">← The Archive</Link>
      </div>

      <div className={styles.layout}>
        {/* Media */}
        <div className={styles.media}>
          <video
            src={entry.mp4Url}
            autoPlay muted loop playsInline preload="auto"
            className={styles.video}
          />
        </div>

        {/* Info */}
        <div className={styles.info}>
          <p className={styles.sku}>{entry.sku}</p>
          <h1 className={styles.title}>{entry.title}</h1>

          {entry.description && (
            <p className={styles.description}>{entry.description}</p>
          )}

          {tags.length > 0 && (
            <ul className={styles.tags}>
              {tags.map(tag => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}

          <Link href={`/contact?piece=${entry.sku}`} className={styles.cta}>
            Inquire About This Piece
          </Link>

          <Link href="/archive" className={styles.archiveLink}>
            Browse all {entry.category} in the archive →
          </Link>
        </div>
      </div>
    </main>
  )
}
