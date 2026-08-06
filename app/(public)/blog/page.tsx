import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Blog — Bez Ambar',
  description:
    'Stories from the Bez Ambar atelier — craft, diamonds, and the people behind the work.',
}

// Next.js enhancement: when posts come from a CMS/DB, use generateStaticParams + ISR.
// For now the blog renders as a clean landing with the atelier journal.
export const dynamic = 'force-dynamic'

export default function BlogPage() {
  return (
    <main className={styles.page}>

      <header className={styles.hero}>
        <p className={styles.eyebrow}>From the Atelier</p>
        <h1 className={styles.title}>Journal</h1>
        <p className={styles.intro}>
          Behind the craft. Inside the atelier. The latest from the workbench,
          shared as it happens.
        </p>
      </header>

      <div className={styles.content}>

        {/* Instagram link — primary content surface until CMS is wired */}
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

          <div className={styles.feedCard}>
            <p className={styles.feedHandle}>The Archive</p>
            <p className={styles.feedDesc}>
              Browse over five hundred Bez Ambar pieces, each filmed at the atelier.
              Watch every stone under light.
            </p>
            <Link href="/archive" className={styles.feedLink}>
              Explore the Archive →
            </Link>
          </div>

          <div className={styles.feedCard}>
            <p className={styles.feedHandle}>Begin a Commission</p>
            <p className={styles.feedDesc}>
              Every Bez Ambar piece starts with a conversation. Reach us at the
              atelier to discuss your vision.
            </p>
            <Link href="/contact" className={styles.feedLink}>
              Contact the Atelier →
            </Link>
          </div>
        </div>

      </div>
    </main>
  )
}
