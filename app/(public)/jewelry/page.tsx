import type { Metadata } from 'next'
import Link from 'next/link'
import { getActiveCategories } from '@/lib/queries'
import { getCategoryMeta } from '@/lib/data/categories'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Jewelry',
  description: 'Rings, bands, bracelets, necklaces, earrings and pendants from the Bez Ambar atelier.',
  openGraph: { title: 'Jewelry · Bez Ambar', description: 'The Bez Ambar collections.' },
}

export const revalidate = 3600

export default async function JewelryLanding() {
  const categories = await getActiveCategories()

  return (
    <main className={styles.page}>

      {/* ── Masthead ── */}
      <header className={styles.masthead}>
        <p className={styles.mastheadEyebrow}>The Collections</p>
        <h1 className={styles.mastheadTitle}>Jewelry</h1>
        <hr className={styles.mastheadRule} />
        <p className={styles.mastheadLede}>
          Light, chiseled into form. Every piece made in the Los Angeles atelier —
          rings, bands, bracelets, necklaces, earrings, and pendants, each cut by hand.
        </p>
      </header>

      {/* ── Category grid ── */}
      <ul className={styles.grid}>
        {categories.map((cat) => {
          const slug = cat.toLowerCase()
          const meta = getCategoryMeta(slug)
          return (
            <li key={slug} className={styles.card}>
              <Link href={`/jewelry/${slug}`} className={styles.cardName}>
                {meta.title} →
              </Link>
              <p className={styles.cardMeta}>{meta.intro}</p>
            </li>
          )
        })}
      </ul>

      {/* ── Services strip ── */}
      <div className={styles.services}>
        <div className={styles.servicesInner}>
          <div>
            <p className={styles.serviceLabel}>Bespoke Design</p>
            <p className={styles.serviceText}>Every piece made to order in Los Angeles</p>
          </div>
          <div>
            <p className={styles.serviceLabel}>Elysian Cut™</p>
            <p className={styles.serviceText}>Proprietary faceting exclusive to the atelier</p>
          </div>
          <div>
            <p className={styles.serviceLabel}>Blaze®</p>
            <p className={styles.serviceText}>The signature step-cut with maximum fire</p>
          </div>
          <div>
            <p className={styles.serviceLabel}>LA Atelier</p>
            <p className={styles.serviceText}>Private appointments — 611 Wilshire Blvd</p>
          </div>
        </div>
      </div>

    </main>
  )
}
