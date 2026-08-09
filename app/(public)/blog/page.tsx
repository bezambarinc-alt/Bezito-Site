import type { Metadata } from 'next'
import Link from 'next/link'
import { getBlogCards } from '@/lib/data/blog'
import { blogCategoryLabel } from '@/lib/data/blog-constants'
import Reveal from '@/components/blog/Reveal'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Journal — Bez Ambar',
  description:
    'Stories from the Bez Ambar atelier — craft, diamonds, and the people behind the work.',
}

export const dynamic = 'force-dynamic'

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return d
  }
}

export default async function BlogPage() {
  const cards = await getBlogCards()

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>From the Atelier</p>
        <h1 className={styles.title}>Journal</h1>
        <p className={styles.intro}>
          Behind the craft. Inside the atelier. Notes on diamonds, design, and the
          people behind the work.
        </p>
      </header>

      <div className={styles.content}>
        {cards.length === 0 ? (
          <div className={styles.feed}>
            <div className={styles.feedCard}>
              <p className={styles.feedHandle}>@bezambarjewelry</p>
              <p className={styles.feedDesc}>
                Follow the atelier on Instagram for new pieces, process shots, and
                notes from the bench. Posted daily from Los Angeles.
              </p>
              <a
                href="https://www.instagram.com/bezambarjewelry/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.feedLink}
              >
                Follow on Instagram →
              </a>
            </div>
          </div>
        ) : (
          <div className={styles.grid}>
            {cards.map((c, i) => (
              <Reveal key={c.slug} delay={(i % 3) * 90}>
                <Link href={`/blog/${c.slug}`} className={styles.card}>
                  <div className={styles.cardImg}>
                    {c.heroImage && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.heroImage}
                        alt={c.heroImageAlt ?? c.title}
                        loading="lazy"
                      />
                    )}
                  </div>
                  <p className={styles.cardCat}>{blogCategoryLabel(c.category)}</p>
                  <h2 className={styles.cardTitle}>{c.title}</h2>
                  <p className={styles.cardExcerpt}>{c.excerpt}</p>
                  <p className={styles.cardDate}>{fmtDate(c.date)}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
