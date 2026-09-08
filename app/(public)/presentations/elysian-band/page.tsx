import type { Metadata } from 'next'
import FloatingCollectionCTA from '@/components/common/FloatingCollectionCTA'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'The Elysian Band — Bez Ambar',
  description:
    'The Elysian Cut™ bent into an oval — one continuous ribbon of light. Full eternity and halfway versions in four stone sizes, by private appointment.',
}

// ── Product data ───────────────────────────────────────────────────────────────

interface Variant {
  ref: string
  type: string
  description: string
  stones: number
  carats: string
  priceFrom: number
  priceTo: number
  half?: {
    ref: string
    label: string
    priceFrom: number
    priceTo: number
  }
}

const VARIANTS: Variant[] = [
  {
    ref: '2ELS-25',
    type: 'Full Eternity',
    description:
      'The entry to the line — the smallest Elysian, and the purest reading of the idea. Twenty-two stones close the circle without a visible seam.',
    stones: 22,
    carats: '5.50',
    priceFrom: 16852,
    priceTo: 27852,
    half: { ref: '2ELS-25H', label: 'Halfway · 11 stones · 2.75 ct', priceFrom: 8824, priceTo: 14324 },
  },
  {
    ref: '2ELS-30',
    type: 'Full Eternity',
    description:
      'A step up in presence. The elongated form begins to assert itself — the line of light widens without losing its continuity.',
    stones: 21,
    carats: '6.51',
    priceFrom: 23484,
    priceTo: 37156,
    half: { ref: '2ELS-30H', label: 'Halfway · 11 stones · 3.41 ct', priceFrom: 12652, priceTo: 19816 },
  },
  {
    ref: '2ELS-50',
    type: 'Full Eternity',
    description:
      'The center of the range. Each stone is large enough to be read on its own, yet the edge-to-edge setting keeps the eye moving — around, not across.',
    stones: 18,
    carats: '9.90',
    priceFrom: 46552,
    priceTo: 62392,
    half: { ref: '2ELS-50H', label: 'Halfway · 9 stones · 4.95 ct', priceFrom: 23676, priceTo: 31596 },
  },
  {
    ref: '2ELS-70',
    type: 'Full Eternity',
    description:
      'The statement of the line. Seventeen stones, nearly twelve carats, one continuous circle — the Elysian at full volume.',
    stones: 17,
    carats: '11.90',
    priceFrom: 60312,
    priceTo: 90060,
    half: { ref: '2ELS-70H', label: 'Halfway · 7 stones · 4.90 ct', priceFrom: 25412, priceTo: 37660 },
  },
]

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ElysianBandPage() {
  return (
    <main className={styles.page}>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <video
          className={styles.heroVideo}
          src="https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>A Bez Ambar Presentation</span>
          <h1 className={styles.heroTitle}>The Elysian.</h1>
          <p className={styles.heroSub}>The Oval Band · Los Angeles</p>
        </div>
      </section>

      {/* ── Narrative 1 — The Magic of Light ── */}
      <section className={styles.editorial}>
        <span className={styles.sectionEyebrow}>The Magic of Light</span>
        <p className={styles.editorialBody}>
          A certificate can grade a stone. It cannot tell how the light dances within it. In lesser
          hands, light merely touches the stone; done right, it melts into the divine.
        </p>
      </section>

      {/* ── Feature — A Line You Never Take Off ── */}
      <section className={styles.featureBlock}>
        <div className={styles.featureText}>
          <span className={styles.sectionEyebrow}>The Oval Band</span>
          <h2 className={styles.featureTitle}>A Line You Never Take Off</h2>
          <p className={styles.featureBody}>
            Cut to fit its place, set to disappear. Every stone calibrated to the hand that wears it.
            It doesn't announce itself; it stays.
          </p>
        </div>
      </section>

      {/* ── Technical — The Cut ── */}
      <section className={styles.technical}>
        <div className={styles.technicalInner}>
          <span className={styles.sectionEyebrow}>Featuring the Elysian Cut™</span>
          <p className={styles.technicalBody}>
            A baguette moves light in long, directional planes — that's the step cut at work.
            An oval softens the silhouette. The Elysian Cut™ takes that step-cut discipline and
            bends it into an oval form: the broad, sweeping brilliance of a baguette, inside the
            curve of an oval.
          </p>
          <p className={styles.technicalBody}>
            Each stone is set edge to edge — no metal, no interruption. Light enters one stone and
            travels the finger in one unbroken line. Set in a full circle, it reads less like a row
            of diamonds than a continuous ribbon of light.
          </p>
        </div>
      </section>

      {/* ── Section divider ── */}
      <div className={styles.divider}>
        <span className={styles.dividerLabel}>Full Eternity</span>
      </div>

      {/* ── Product Variants ── */}
      <section className={styles.products}>
        {VARIANTS.map((v) => (
          <article key={v.ref} className={styles.variantCard}>
            <header className={styles.variantHeader}>
              <span className={styles.variantRef}>{v.ref}</span>
              <span className={styles.variantType}>{v.type}</span>
            </header>
            <p className={styles.variantDesc}>{v.description}</p>
            <dl className={styles.variantSpecs}>
              <div className={styles.specRow}>
                <dt>Stones</dt>
                <dd>{v.stones}</dd>
              </div>
              <div className={styles.specRow}>
                <dt>Total carat</dt>
                <dd>{v.carats} ct</dd>
              </div>
              <div className={`${styles.specRow} ${styles.specPrice}`}>
                <dt>Price range</dt>
                <dd>
                  {fmt(v.priceFrom)} – {fmt(v.priceTo)}
                  <span className={styles.priceNote}>Price varies by diamond quality</span>
                </dd>
              </div>
            </dl>
            {v.half && (
              <div className={styles.halfVariant}>
                <span className={styles.halfRef}>{v.half.ref}</span>
                <span className={styles.halfLabel}>{v.half.label}</span>
                <span className={styles.halfPrice}>
                  {fmt(v.half.priceFrom)} – {fmt(v.half.priceTo)}
                </span>
              </div>
            )}
          </article>
        ))}
      </section>

      {/* ── Closing ── */}
      <section className={styles.closing}>
        <div className={styles.closingInner}>
          <h2 className={styles.closingTitle}>One Unbroken Line</h2>
          <p className={styles.closingBody}>
            The name states the intent: the Elysian — a place made entirely of light. Designed and
            made in Los Angeles. Full eternity and halfway versions in four stone sizes, by private
            appointment.
          </p>
          <p className={styles.closingNote}>
            Larger stones available upon request. The ring shown in film features a 0.90 ct Elysian
            Cut. Stones of 1 ct and 1.5 ct are also available — considerably rarer, and priced
            accordingly.
          </p>
        </div>
      </section>

      {/* ── Coming Soon ── */}
      <section className={styles.comingSoon}>
        <span className={styles.comingSoonEyebrow}>Coming Soon</span>
        <h2 className={styles.comingSoonTitle}>The Elysian Pear</h2>
        <p className={styles.comingSoonSub}>
          A teardrop, reborn — the next chapter in the line of brilliance.
        </p>
        <p className={styles.comingSoonBody}>
          Pear Cut. Continuous Line. Each teardrop calibrated to the next, until light becomes the
          band itself.
        </p>
        <span className={styles.comingSoonBrand}>Bez Ambar — Los Angeles</span>
      </section>

      {/* ── Floating Inquiry ── */}
      <FloatingCollectionCTA
        collectionName="The Elysian Band"
        eyebrow="Presentation"
        intent="Elysian Band Inquiry"
      />
    </main>
  )
}
