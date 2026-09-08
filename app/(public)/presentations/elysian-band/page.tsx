import type { Metadata } from 'next'
import HomeSegment from '@/components/home/HomeSegment'
import FloatingCollectionCTA from '@/components/common/FloatingCollectionCTA'
import LazyVideo from '@/components/common/LazyVideo'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'THE ELYSIAN. — Bez Ambar',
  description:
    'The Elysian Band — a continuous circle of the Elysian Cut™. Full eternity and halfway versions in four stone sizes. Made in Los Angeles.',
}

// ── Variant data ──────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ElysianBandPage() {
  return (
    <main>

      {/* ── Hero — oval band, single slide ── */}
      <section className={styles.hero}>
        <video
          src="https://res.cloudinary.com/dlg2mou53/video/upload/h_1080,c_limit,q_auto/Jewelry%20Videos/Bands/4k_ovalcut_band_6_v1_rllzya.mp4"
          poster="https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_1080/Jewelry%20Videos/Bands/4k_ovalcut_band_6_v1_rllzya.jpg"
          autoPlay muted loop playsInline preload="auto"
          className={styles.heroVideo}
        />
        <div className={styles.heroGradient} aria-hidden />
        <div className={styles.heroOverlay}>
          <p className="ba-eyebrow">The Elysian Band</p>
          <h1 className={styles.heroHeadline}>A Line You Never Take Off</h1>
          <p className={styles.heroSub}>
            Cut to fit its place, set to disappear. Every stone calibrated to the hand that wears it.
            It doesn&rsquo;t announce itself; it stays.
          </p>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className={styles.intro}>
        <p className="ba-eyebrow">Featuring the Elysian Cut™</p>
        <h2 className={`ba-title ${styles.introTitle}`}>The Elysian.</h2>
        <p className={`ba-lede ${styles.introLede}`}>
          A baguette moves light in long, directional planes — that&rsquo;s the step cut at work.
          An oval softens the silhouette. The Elysian Cut™ takes that step-cut discipline and bends
          it into an oval form: the broad, sweeping brilliance of a baguette, inside the curve of an oval.
        </p>
        <p className={`ba-lede ${styles.introLede}`}>
          Each stone is set edge to edge — no metal, no interruption. Light enters one stone and
          travels the finger in one unbroken line. Set in a full circle, it reads less like a row of
          diamonds than a continuous ribbon of light.
        </p>
      </section>

      {/* ── 4 alternating segments ── */}
      {VARIANTS.map((v, i) => (
        <section key={v.ref} className={`${styles.segment} ${i % 2 === 1 ? styles.segReverse : ''}`}>

          <div className={styles.segMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v.imageUrl} alt={`The Elysian Band ${v.ref}`} loading="lazy" />
          </div>

          <div className={styles.segText}>
            <p className="ba-eyebrow">Full Eternity</p>
            <h2 className={`ba-title ${styles.segTitle}`}>{v.ref}</h2>
            <p className={`ba-lede ${styles.segBody}`}>{v.desc}</p>

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

      {/* ── Band in motion ── */}
      <HomeSegment
        eyebrow="In Motion"
        title="One Unbroken Line"
        body="The name states the intent: the Elysian — a place made entirely of light. Designed and made in Los Angeles. Full eternity and halfway versions in four stone sizes, by private appointment."
        videoUrl="https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bands/2ELS25.mp4"
        posterUrl="https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_1080/Jewelry%20Videos/Bands/2ELS25.jpg"
      />

      {/* ── Bottom cinematic — pear band, single slide ── */}
      <section className={styles.cinematic}>
        <LazyVideo
          src="https://res.cloudinary.com/dlg2mou53/video/upload/h_1080,c_limit,q_auto/Jewelry%20Videos/Bands/Pearshape_HD_hlvl8l.mp4"
          poster="https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_1080/Jewelry%20Videos/Bands/Pearshape_HD_hlvl8l.jpg"
          muted loop playsInline
          className={styles.cinematicVideo}
        />
        <div className={styles.heroGradient} aria-hidden />
        <div className={styles.heroOverlay}>
          <p className="ba-eyebrow">The Elysian Pear Band</p>
          <h2 className={styles.heroHeadline}>Pear Cut. Continuous Line.</h2>
          <p className={styles.heroSub}>
            Each teardrop calibrated to the next, until light becomes the band itself.
          </p>
        </div>
      </section>

      {/* ── Floating inquiry ── */}
      <FloatingCollectionCTA
        collectionName="The Elysian Band"
        eyebrow="Presentation"
        intent="Elysian Band Inquiry"
      />

    </main>
  )
}
