import type { Metadata } from 'next'
import ScrollWipeCarousel from '@/components/common/ScrollWipeCarousel'
import LazyScrollWipeCarousel from '@/components/common/LazyScrollWipeCarousel'
import HomeSegment from '@/components/home/HomeSegment'
import FloatingCollectionCTA from '@/components/common/FloatingCollectionCTA'
import { HERO_SLIDES, CINEMATIC_SLIDES } from '@/lib/data/home-slides'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'The Elysian Band — Bez Ambar',
  description:
    'The Elysian Cut™ bent into an oval — one continuous ribbon of light. Full eternity and halfway versions in four stone sizes, by private appointment.',
}

// ── Variant data — exact copy from bezito.co/page/elysian-cut ─────────────────

interface Half { ref: string; stones: number; carats: string; priceFrom: number; priceTo: number }
interface Variant {
  ref: string
  desc: string
  stones: number
  carats: string
  priceFrom: number
  priceTo: number
  half: Half
}

const VARIANTS: Variant[] = [
  {
    ref: '2ELS-25',
    desc: 'The entry to the line — the smallest Elysian, and the purest reading of the idea. Twenty-two stones close the circle without a visible seam.',
    stones: 22, carats: '5.50', priceFrom: 16852, priceTo: 27852,
    half: { ref: '2ELS-25H', stones: 11, carats: '2.75', priceFrom: 8824, priceTo: 14324 },
  },
  {
    ref: '2ELS-30',
    desc: 'A step up in presence. The elongated form begins to assert itself — the line of light widens without losing its continuity.',
    stones: 21, carats: '6.51', priceFrom: 23484, priceTo: 37156,
    half: { ref: '2ELS-30H', stones: 11, carats: '3.41', priceFrom: 12652, priceTo: 19816 },
  },
  {
    ref: '2ELS-50',
    desc: 'The center of the range. Each stone is large enough to be read on its own, yet the edge-to-edge setting keeps the eye moving — around, not across.',
    stones: 18, carats: '9.90', priceFrom: 46552, priceTo: 62392,
    half: { ref: '2ELS-50H', stones: 9, carats: '4.95', priceFrom: 23676, priceTo: 31596 },
  },
  {
    ref: '2ELS-70',
    desc: 'The statement of the line. Seventeen stones, nearly twelve carats, one continuous circle — the Elysian at full volume.',
    stones: 17, carats: '11.90', priceFrom: 60312, priceTo: 90060,
    half: { ref: '2ELS-70H', stones: 7, carats: '4.90', priceFrom: 25412, priceTo: 37660 },
  },
]

function usd(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ElysianBandPage() {
  return (
    <main>

      {/* ── Top hero carousel — "The Magic of Light" + "A Line You Never Take Off"
            Uses the existing HERO_SLIDES which already carry the reference page copy
            and the right Elysian Band videos ── */}
      <ScrollWipeCarousel slides={HERO_SLIDES} headingLevel="h1" />

      {/* ── The Cut — editorial two-column ── */}
      <HomeSegment
        eyebrow="Featuring the Elysian Cut™"
        title="Calibrated for the Oval"
        body="A baguette moves light in long, directional planes — that's the step cut at work. An oval softens the silhouette. The Elysian Cut™ takes that step-cut discipline and bends it into an oval form: the broad, sweeping brilliance of a baguette, inside the curve of an oval. Each stone is set edge to edge — no metal, no interruption. Light enters one stone and travels the finger in one unbroken line."
        imageUrl="https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_1100/v1779074065/Jewelry%20Images/Stones/Elysian_cut_oval_qcdt5r.jpg"
      />

      {/* ── Variant cards — "In Motion" section from the reference page ── */}
      <section className={styles.variants}>
        <div className={styles.variantsHeader}>
          <p className={styles.variantsEyebrow}>Full Eternity</p>
          <h2 className={styles.variantsTitle}>The Elysian Band · 2ELS</h2>
        </div>

        <div className={styles.cardsGrid}>
          {VARIANTS.map((v) => (
            <article key={v.ref} className={styles.card}>

              {/* Full eternity */}
              <div className={styles.cardTop}>
                <span className={styles.cardEyebrow}>Full Eternity</span>
                <h3 className={styles.cardRef}>{v.ref}</h3>
                <p className={styles.cardDesc}>{v.desc}</p>
                <p className={styles.cardSpecs}>{v.stones} stones · {v.carats} ct total</p>
                <p className={styles.cardPrice}>{usd(v.priceFrom)} – {usd(v.priceTo)}</p>
                <p className={styles.cardPriceNote}>Price varies by diamond quality</p>
              </div>

              {/* Halfway variant */}
              <div className={styles.cardHalf}>
                <p className={styles.halfLabel}>
                  {v.half.ref} · Halfway · {v.half.stones} stones · {v.half.carats} ct
                </p>
                <p className={styles.halfPrice}>{usd(v.half.priceFrom)} – {usd(v.half.priceTo)}</p>
                <p className={styles.cardPriceNote}>Price varies by diamond quality</p>
              </div>

            </article>
          ))}
        </div>
      </section>

      {/* ── "One Unbroken Line" closing editorial ── */}
      <div className={styles.closing}>
        <div className={styles.closingInner}>
          <p className={styles.closingEyebrow}>In Motion</p>
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
      </div>

      {/* ── Bottom cinematic carousel — Elysian Pear "Coming Soon"
            Uses the existing CINEMATIC_SLIDES which already have the right
            pear bracelet videos and reference-page copy ── */}
      <LazyScrollWipeCarousel slides={CINEMATIC_SLIDES} />

      {/* ── Floating inquiry CTA — existing component, eyebrow adapts label ── */}
      <FloatingCollectionCTA
        collectionName="The Elysian Band"
        eyebrow="Presentation"
        intent="Elysian Band Inquiry"
      />
    </main>
  )
}
