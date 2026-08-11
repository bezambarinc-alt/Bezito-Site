import type { Metadata } from 'next'
import Link from 'next/link'
import { getBlogCards } from '@/lib/data/blog'
import { blogCategoryLabel } from '@/lib/data/blog-constants'
import FadeIn from '@/components/common/FadeIn'
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
  const [featured, ...rest] = cards

  return (
    <main className={styles.page}>
      {/* Editorial masthead — light, works under the ink header */}
      <header className={styles.masthead}>
        <p className={styles.eyebrow}>From the Atelier</p>
        <h1 className={styles.title}>The Journal</h1>
        <p className={styles.intro}>
          Notes on diamonds, design, and the craft — from the Los Angeles bench.
        </p>
        <span className={styles.mastheadRule} aria-hidden="true" />
      </header>

      {cards.length === 0 ? (
        <div className={styles.emptyWrap}>
          <div className={styles.emptyCard}>
            <p className={styles.emptyHandle}>@bezambarjewelry</p>
            <p className={styles.emptyDesc}>
              Follow the atelier on Instagram for new pieces, process shots, and
              notes from the bench.
            </p>
            <a
              href="https://www.instagram.com/bezambarjewelry/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.emptyLink}
            >
              Follow on Instagram →
            </a>
          </div>
        </div>
      ) : (
        <div className={styles.content}>
          {/* Featured lead post — large, editorial */}
          {featured && (
            <FadeIn>
              <Link href={`/blog/${featured.slug}`} className={styles.feature}>
                <div className={styles.featureMedia}>
                  {featured.heroImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.heroImage}
                      alt={featured.heroImageAlt ?? featured.title}
                    />
                  )}
                  <span className={styles.featureBadge}>Latest</span>
                </div>
                <div className={styles.featureBody}>
                  <p className={styles.featureCat}>
                    {blogCategoryLabel(featured.category)}
                  </p>
                  <h2 className={styles.featureTitle}>{featured.title}</h2>
                  <p className={styles.featureExcerpt}>{featured.excerpt}</p>
                  <span className={styles.featureLink}>Read the story →</span>
                  <p className={styles.featureDate}>{fmtDate(featured.date)}</p>
                </div>
              </Link>
            </FadeIn>
          )}

          <div className={styles.gridRule} aria-hidden="true" />

          {/* Card grid */}
          <div className={styles.grid}>
            {rest.map((c, i) => (
              <FadeIn key={c.slug} delay={(i % 3) * 0.1}>
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
                  <h3 className={styles.cardTitle}>{c.title}</h3>
                  <p className={styles.cardExcerpt}>{c.excerpt}</p>
                  <p className={styles.cardDate}>{fmtDate(c.date)}</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
