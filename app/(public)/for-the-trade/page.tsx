import type { Metadata } from 'next'
import InquiryButton from '@/components/common/InquiryButton'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'For the Trade | Bez Ambar',
  description:
    'Bez Ambar works with dealers, houses, and retailers. Stones that deserve better settings. Cuts that unlock what a diamond is already holding.',
  robots: { index: false, follow: false },
}

export default function ForTheTradePage() {
  return (
    <main>

      {/* ── Hero — full-width 2560×980, text overlay right, AVIF + fallbacks ── */}
      <section className={styles.hero}>
        <picture>
          <source
            type="image/avif"
            srcSet="https://res.cloudinary.com/dlg2mou53/image/upload/f_avif,q_auto:good/v1791782989/Jewelry%20Images/Rings/lisas-ring/hero"
          />
          <source
            type="image/webp"
            srcSet="https://res.cloudinary.com/dlg2mou53/image/upload/f_webp,q_auto:good/v1791782989/Jewelry%20Images/Rings/lisas-ring/hero"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://res.cloudinary.com/dlg2mou53/image/upload/f_jpg,q_auto:good/v1791782989/Jewelry%20Images/Rings/lisas-ring/hero"
            alt=""
            className={styles.heroImg}
            loading="eager"
          />
        </picture>

        {/* Text overlay — right side, vertically centered */}
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>For the Trade</p>
            <h1 className={styles.heroTitle}>We bring stones to life.</h1>
            <InquiryButton intent="Trade Partnership" className={styles.heroCta}>
              Begin with your stone
            </InquiryButton>
          </div>
        </div>
      </section>

      {/* ── Split — workmanship image + dealer copy ── */}
      <section className={styles.split}>
        <div className={styles.splitMedia}>
          <div className={styles.splitPlaceholder}>
            <span>Workmanship image — to supply</span>
            <span className={styles.placeholderLabel}>Recommended: 1200 × 1500 px · portrait</span>
          </div>
        </div>
        <div className={styles.splitText}>
          <p className={styles.splitEyebrow}>The Partnership</p>
          <h2 className={styles.splitTitle}>Give us the stones that won&apos;t move.</h2>
          <p className={styles.splitBody}>
            Every dealer has them. Stones that won&apos;t move. Stones sitting in mountings
            that don&apos;t deserve them. Give them to us. We&apos;ll find the stone its right
            home — the setting, the pedestal, the surrounding cuts that finally let it be seen.
            It may not sell the next day. But a stone shown the way it should be raises the
            value of the stone, and of the name behind it.
          </p>
        </div>
      </section>

      {/* ── Full-width centered — craft capabilities ── */}
      <section className={styles.centeredSection}>
        <p className={styles.centeredEyebrow}>The Work</p>
        <h2 className={styles.centeredTitle}>We cut.</h2>
        <p className={styles.centeredBody}>
          With deep knowledge of faceting, we create surrounding stones shaped to complement the
          center — or recut the center itself. We handle the complicated settings and the exacting
          workmanship most ateliers won&apos;t attempt. Design, cutting, setting, polishing, under
          one roof.
        </p>
      </section>

      {/* ── Closing CTA ── */}
      <section className={styles.closing}>
        <p className={styles.closingEyebrow}>The Offer</p>
        <p className={styles.closingBody}>
          We&apos;re not asking for the work. We&apos;re telling you it&apos;s here when a stone deserves it.
          And when a stone moves us, we promote it — out of pride, everywhere we can.
          That&apos;s the partnership.
        </p>
        <InquiryButton intent="Trade Partnership" className={styles.closingBtn}>
          Begin with your stone
        </InquiryButton>
      </section>

    </main>
  )
}
