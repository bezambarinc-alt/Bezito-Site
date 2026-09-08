import type { Metadata } from 'next'
import HomeSegment from '@/components/home/HomeSegment'
import PageCta from '@/components/common/PageCta'
import AtelierBanner from '@/components/common/AtelierBanner'
import FloatingCollectionCTA from '@/components/common/FloatingCollectionCTA'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'The Elysian Band — Bez Ambar',
  description:
    'The Elysian Cut™ bent into an oval — one continuous ribbon of light. Full eternity and halfway versions in four stone sizes, by private appointment.',
}

// ── Variant data ───────────────────────────────────────────────────────────────

interface Half { ref: string; stones: number; carats: string; priceFrom: number; priceTo: number }
interface Variant {
  ref: string
  label: string
  stones: number
  carats: string
  priceFrom: number
  priceTo: number
  half: Half
}

const VARIANTS: Variant[] = [
  {
    ref: '2ELS-25', label: 'Full Eternity',
    stones: 22, carats: '5.50', priceFrom: 16852, priceTo: 27852,
    half: { ref: '2ELS-25H', stones: 11, carats: '2.75', priceFrom: 8824, priceTo: 14324 },
  },
  {
    ref: '2ELS-30', label: 'Full Eternity',
    stones: 21, carats: '6.51', priceFrom: 23484, priceTo: 37156,
    half: { ref: '2ELS-30H', stones: 11, carats: '3.41', priceFrom: 12652, priceTo: 19816 },
  },
  {
    ref: '2ELS-50', label: 'Full Eternity',
    stones: 18, carats: '9.90', priceFrom: 46552, priceTo: 62392,
    half: { ref: '2ELS-50H', stones: 9, carats: '4.95', priceFrom: 23676, priceTo: 31596 },
  },
  {
    ref: '2ELS-70', label: 'Full Eternity',
    stones: 17, carats: '11.90', priceFrom: 60312, priceTo: 90060,
    half: { ref: '2ELS-70H', stones: 7, carats: '4.90', priceFrom: 25412, priceTo: 37660 },
  },
]

function usd(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ElysianBandPage() {
  return (
    <main>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <video
          className={styles.heroVideo}
          autoPlay muted loop playsInline preload="none"
          aria-hidden="true"
        >
          <source
            src="https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.mp4"
            type="video/mp4"
          />
        </video>
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>A Bez Ambar Presentation</p>
          <h1 className={styles.heroTitle}>The Elysian<br />Band</h1>
          <div className={styles.heroRule} aria-hidden />
          <p className={styles.heroLede}>
            The step cut, bent into an oval. One stone into the next, edge to edge,
            until light becomes the band itself.
          </p>
        </div>
      </section>

      {/* ── Editorial intro ── */}
      <div className={styles.intro}>
        <div className={styles.introInner}>
          <p>A certificate can grade a stone. It cannot tell how the light dances within it.
            In lesser hands, light merely touches the stone; done right, it melts into the divine.</p>
        </div>
      </div>

      {/* ── Narrative — The Cut ── */}
      <HomeSegment
        eyebrow="The Oval Band"
        title="A Line You Never Take Off"
        body="Cut to fit its place, set to disappear. Every stone calibrated to the hand that wears it. The Elysian Cut™ takes the step-cut discipline of a baguette — light in long, directional planes — and bends it into an oval form. Each stone is set edge to edge, no metal, no interruption. Light enters one stone and travels the finger in one unbroken line."
        videoUrl="https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.mp4"
        posterUrl="https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_1080/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.mp4"
        reverse
      />

      {/* ── Variant section header ── */}
      <div className={styles.sectionHeader}>
        <p className={styles.sectionEyebrow}>The Band — Four Stone Sizes</p>
        <h2 className={styles.sectionTitle}>Full Eternity &amp; Halfway</h2>
      </div>

      {/* ── Product Variants ── */}
      <section className={styles.variants}>
        {VARIANTS.map((v) => (
          <article key={v.ref} className={styles.variantRow}>

            {/* Full eternity */}
            <div className={styles.variantBlock}>
              <header className={styles.variantHead}>
                <span className={styles.variantRef}>{v.ref}</span>
                <span className={styles.variantLabel}>{v.label}</span>
              </header>
              <dl className={styles.specs}>
                <div className={styles.specItem}>
                  <dt>Stones</dt>
                  <dd>{v.stones}</dd>
                </div>
                <div className={styles.specItem}>
                  <dt>Total weight</dt>
                  <dd>{v.carats} ct</dd>
                </div>
                <div className={styles.specItem}>
                  <dt>Price range</dt>
                  <dd>{usd(v.priceFrom)} – {usd(v.priceTo)}</dd>
                </div>
              </dl>
            </div>

            {/* Halfway variant */}
            <div className={`${styles.variantBlock} ${styles.variantHalf}`}>
              <header className={styles.variantHead}>
                <span className={styles.variantRef}>{v.half.ref}</span>
                <span className={styles.variantLabel}>Halfway</span>
              </header>
              <dl className={styles.specs}>
                <div className={styles.specItem}>
                  <dt>Stones</dt>
                  <dd>{v.half.stones}</dd>
                </div>
                <div className={styles.specItem}>
                  <dt>Total weight</dt>
                  <dd>{v.half.carats} ct</dd>
                </div>
                <div className={styles.specItem}>
                  <dt>Price range</dt>
                  <dd>{usd(v.half.priceFrom)} – {usd(v.half.priceTo)}</dd>
                </div>
              </dl>
            </div>

          </article>
        ))}
      </section>

      <p className={styles.priceNote}>
        Price varies by diamond quality. Larger stones available upon request.
        The ring in film features a 0.90 ct Elysian Cut; 1 ct and 1.5 ct stones also available.
      </p>

      {/* ── Coming Soon ── */}
      <HomeSegment
        eyebrow="Coming Soon"
        title="The Elysian Pear"
        body="A teardrop, reborn. Pear Cut. Continuous Line. Each teardrop calibrated to the next, until light becomes the band itself — the next chapter in the line of brilliance."
        noMedia
      />

      {/* ── Closing CTA ── */}
      <PageCta
        eyebrow="The Elysian Band"
        title="One Unbroken Line"
        body="Designed and made in Los Angeles. Full eternity and halfway versions in four stone sizes, by private appointment."
        drawer
        intent="Elysian Band Inquiry"
        ctaLabel="Arrange a Private Viewing"
      />

      <AtelierBanner />

      {/* ── Floating bar ── */}
      <FloatingCollectionCTA
        collectionName="The Elysian Band"
        eyebrow="Presentation"
        intent="Elysian Band Inquiry"
      />
    </main>
  )
}
