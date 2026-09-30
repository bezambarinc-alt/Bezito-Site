import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getArchiveEntries, getArchiveBySlug } from '@/lib/data/archive'
import styles from './page.module.css'

export const revalidate = 3600

export async function generateStaticParams() {
  const entries = await getArchiveEntries()
  return entries.map(e => ({ slug: e.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const entry = await getArchiveBySlug(slug)
  if (!entry) return {}
  return {
    title: `${entry.title} — The Archive`,
    description: entry.description ?? `${entry.title} (${entry.sku}) — filmed at the Bez Ambar atelier in Los Angeles.`,
    openGraph: {
      title: entry.title,
      description: entry.description ?? `${entry.title} · Bez Ambar`,
      images: entry.gifUrl ? [{ url: entry.gifUrl }] : [],
    },
  }
}

export default async function ArchiveSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
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
          {entry.mp4Url ? (
            <video
              src={entry.mp4Url}
              autoPlay muted loop playsInline preload="auto"
              poster={entry.gifUrl ?? undefined}
              className={styles.video}
            />
          ) : entry.gifUrl ? (
            <img src={entry.gifUrl} alt={entry.title} className={styles.video} />
          ) : null}
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
