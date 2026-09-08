import type { Metadata } from 'next'
import ScrollWipeCarousel from '@/components/common/ScrollWipeCarousel'
import LazyScrollWipeCarousel from '@/components/common/LazyScrollWipeCarousel'
import HomeSegment from '@/components/home/HomeSegment'
import FloatingCollectionCTA from '@/components/common/FloatingCollectionCTA'
import { HERO_SLIDES, CINEMATIC_SLIDES } from '@/lib/data/home-slides'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'THE ELYSIAN. — Bez Ambar',
  description:
    'The Elysian Band — a continuous circle of the Elysian Cut™. Full eternity and halfway versions in four stone sizes. Made in Los Angeles.',
}

// ── Variant data with actual product images ────────────────────────────────────

interface Variant {
  ref: string
  imageUrl: string
  desc: string
  stones: number
  carats: string
  priceFrom: number
  priceTo: number
  halfRef: string
  halfStones: number
  halfCarats: string
  halfFrom: number
  halfTo: number
}

const VARIANTS: Variant[] = [
  {
    ref: '2ELS-25',
    imageUrl: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_1100/Jewelry%20Images/Bands/2ELS-25_n7nkk4.png',
    desc: 'The entry to the line — the smallest Elysian, and the purest reading of the idea. Twenty-two stones close the circle without a visible seam.',
    stones: 22, carats: '5.50', priceFrom: 16852, priceTo: 27852,
    halfRef: '2ELS-25H', halfStones: 11, halfCarats: '2.75', halfFrom: 8824, halfTo: 14324,
  },
  {
    ref: '2ELS-30',
    imageUrl: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_1100/Jewelry%20Images/Bands/2ELS-30_r1chph.png',
    desc: 'A step up in presence. The elongated form begins to assert itself — the line of light widens without losing its continuity.',
    stones: 21, carats: '6.51', priceFrom: 23484, priceTo: 37156,
    halfRef: '2ELS-30H', halfStones: 11, halfCarats: '3.41', halfFrom: 12652, halfTo: 19816,
  },
  {
    ref: '2ELS-50',
    imageUrl: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_1100/Jewelry%20Images/Bands/2ELS-50_gydi1e.png',
    desc: 'The center of the range. Each stone is large enough to be read on its own, yet the edge-to-edge setting keeps the eye moving — around, not across.',
    stones: 18, carats: '9.90', priceFrom: 46552, priceTo: 62392,
    halfRef: '2ELS-50H', halfStones: 9, halfCarats: '4.95', halfFrom: 23676, halfTo: 31596,
  },
  {
    ref: '2ELS-70',
    imageUrl: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_1100/Jewelry%20Images/Bands/2ELS-70_dovft0.png',
    desc: 'The statement of the line. Seventeen stones, nearly twelve carats, one continuous circle — the Elysian at full volume.',
    stones: 17, carats: '11.90', priceFrom: 60312, priceTo: 90060,
    halfRef: '2ELS-70H', halfStones: 7, halfCarats: '4.90', halfFrom: 25412, halfTo: 37660,
  },
]

function usd(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ElysianBandPage() {
  return (
    <main>

      {/* ── Top hero carousel — same HERO_SLIDES as home page:
            "The Magic of Light" + "A Line You Never Take Off" ── */}
      <ScrollWipeCarousel slides={HERO_SLIDES} headingLevel="h1" />

      {/* ── Intro — "Featuring the Elysian Cut™" / "The Elysian." ── */}
      <section className={styles.intro}>
        <p className={styles.introEyebrow}>Featuring the Elysian Cut™</p>
        <h2 className={styles.introTitle}>The Elysian.</h2>
        <p className={styles.introBody}>
          A baguette moves light in long, directional planes — that&rsquo;s the step cut at work.
          An oval softens the silhouette. The Elysian Cut™ takes that step-cut discipline and bends
          it into an oval form: the broad, sweeping brilliance of a baguette, inside the curve of an oval.
        </p>
        <p className={styles.introBody}>
          Each stone is set edge to edge — no metal, no interruption. Light enters one stone and
          travels the finger in one unbroken line. Set in a full circle, it reads less like a row of
          diamonds than a continuous ribbon of light.
        </p>
      </section>

      {/* ── 4 alternating segments — each variant with its product image ──
            Mirrors reference page structure exactly ── */}
      {VARIANTS.map((v, i) => (
        <section key={v.ref} className={`${styles.segment} ${i % 2 === 1 ? styles.segReverse : ''}`}>

          <div className={styles.segMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v.imageUrl} alt={`The Elysian Band ${v.ref}`} loading="lazy" />
          </div>

          <div className={styles.segText}>
            <p className={styles.segEyebrow}>Full Eternity</p>
            <h2 className={styles.segTitle}>{v.ref}</h2>
            <p className={styles.segBody}>{v.desc}</p>

            <p className={styles.specLine}>
              <strong>{v.stones} stones</strong> · {v.carats} ct total
            </p>
            <p className={styles.price}>
              {usd(v.priceFrom)} – {usd(v.priceTo)}
              <small>Price varies by diamond quality</small>
            </p>

            <p className={`${styles.specLine} ${styles.halfLabel}`}>
              <strong>{v.halfRef}</strong> · Halfway · {v.halfStones} stones · {v.halfCarats} ct
            </p>
            <p className={styles.price}>
              {usd(v.halfFrom)} – {usd(v.halfTo)}
              <small>Price varies by diamond quality</small>
            </p>
          </div>

        </section>
      ))}

      {/* ── "In Motion" segment — the band video + "One Unbroken Line" ── */}
      <HomeSegment
        eyebrow="In Motion"
        title="One Unbroken Line"
        body="The name states the intent: the Elysian — a place made entirely of light. Designed and made in Los Angeles. Full eternity and halfway versions in four stone sizes, by private appointment."
        videoUrl="https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bands/2ELS25.mp4"
        posterUrl="https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_1080/Jewelry%20Videos/Bands/2ELS25.jpg"
      />

      {/* ── Bottom cinematic carousel — CINEMATIC_SLIDES:
            "Coming Soon — The Elysian Pear" + "Pear Cut. Continuous Line." ── */}
      <LazyScrollWipeCarousel slides={CINEMATIC_SLIDES} />

      {/* ── Floating inquiry CTA — existing component ── */}
      <FloatingCollectionCTA
        collectionName="The Elysian Band"
        eyebrow="Presentation"
        intent="Elysian Band Inquiry"
      />

    </main>
  )
}
