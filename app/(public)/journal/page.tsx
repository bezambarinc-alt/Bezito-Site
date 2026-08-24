import type { Metadata } from 'next'
import CuratorFeed from './CuratorFeed'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'From the Bench — Bez Ambar',
  description:
    'Behind the craft. Inside the atelier. The latest from the Bez Ambar workbench — shared as it happens on Instagram.',
}

export default function JournalPage() {
  return (
    <main>

      {/* ── Light hero ── */}
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>@bezambarjewelry</p>
        <h1 className={styles.heroTitle}>Journal</h1>
        <p className={styles.heroIntro}>
          Behind the craft. Inside the atelier. The latest from the workbench,
          shared as it happens.
        </p>
      </section>

      {/* ── Instagram feed section ── */}
      <section className={styles.feedSection}>
        <div className={styles.feedWrap}>
          {/* Feed target div — server-rendered, Curator script fills it client-side */}
          <div id="curator-feed-default-feed-layout" className={styles.curatorContainer} />
          {/* Loads Curator.io script deferred via Next.js <Script strategy="lazyOnload"> */}
          <CuratorFeed />
        </div>

        {/* Fallback grid — always visible */}
        <div className={styles.fallback}>
          <p className={styles.fallbackMsg}>
            Follow us on Instagram for new pieces and studio notes from Los Angeles.
          </p>
          <a
            href="https://www.instagram.com/bezambarjewelry/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.followLink}
          >
            @bezambarjewelry →
          </a>
        </div>
      </section>

      {/* ── Services strip ── */}
      <section className={styles.services}>
        <div className={styles.servicesInner}>
          <div className={styles.serviceItem}>
            <p className={styles.serviceLabel}>Bespoke Design</p>
            <p className={styles.serviceText}>One-of-a-kind pieces designed with you</p>
          </div>
          <div className={styles.serviceItem}>
            <p className={styles.serviceLabel}>Complimentary Shipping</p>
            <p className={styles.serviceText}>Fully insured FedEx Priority delivery</p>
          </div>
          <div className={styles.serviceItem}>
            <p className={styles.serviceLabel}>Provenance Certificate</p>
            <p className={styles.serviceText}>Signed certificate with every piece</p>
          </div>
          <div className={styles.serviceItem}>
            <p className={styles.serviceLabel}>LA Atelier</p>
            <p className={styles.serviceText}>Visit us by appointment — 611 Wilshire Blvd</p>
          </div>
        </div>
      </section>

    </main>
  )
}
