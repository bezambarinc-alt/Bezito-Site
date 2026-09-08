import type { Metadata } from 'next'
import HomeSegment from '@/components/home/HomeSegment'
import HomeHeroImage from '@/components/home/HomeHeroImage'
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

interface Variant {
  ref: string
  halfRef: string
  size: string
  desc: string
  full: { stones: number; carats: string; priceFrom: number; priceTo: number }
  half: { stones: number; carats: string; priceFrom: number; priceTo: number }
}

const VARIANTS: Variant[] = [
  {
    ref: '2ELS-25', halfRef: '2ELS-25H',
    size: '0.25 ct per stone',
    desc: 'The entry. Twenty-two Elysian ovals close the circle without interruption.',
    full: { stones: 22, carats: '5.50', priceFrom: 16852, priceTo: 27852 },
    half: { stones: 11, carats: '2.75', priceFrom: 8824,  priceTo: 14324 },
  },
  {
    ref: '2ELS-30', halfRef: '2ELS-30H',
    size: '0.30 ct per stone',
    desc: 'The line of light widens. The oval form begins to assert itself.',
    full: { stones: 21, carats: '6.51', priceFrom: 23484, priceTo: 37156 },
    half: { stones: 11, carats: '3.41', priceFrom: 12652, priceTo: 19816 },
  },
  {
    ref: '2ELS-50', halfRef: '2ELS-50H',
    size: '0.50 ct per stone',
    desc: 'Each stone readable on its own. The edge-to-edge setting keeps the eye moving.',
    full: { stones: 18, carats: '9.90', priceFrom: 46552, priceTo: 62392 },
    half: { stones: 9,  carats: '4.95', priceFrom: 23676, priceTo: 31596 },
  },
  {
    ref: '2ELS-70', halfRef: '2ELS-70H',
    size: '0.70 ct per stone',
    desc: 'The Elysian at full volume. Seventeen stones, nearly twelve carats, one circle.',
    full: { stones: 17, carats: '11.90', priceFrom: 60312, priceTo: 90060 },
    half: { stones: 7,  carats: '4.90',  priceFrom: 25412, priceTo: 37660 },
  },
]

function usd(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
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

      {/* ── Narrative — two column with video ── */}
      <HomeSegment
        eyebrow="The Oval Band"
        title="A Line You Never Take Off"
        body="Cut to fit its place, set to disappear. Every stone calibrated to the hand that wears it. The Elysian Cut™ takes the step-cut discipline — light in long, directional planes — and bends it into an oval form. Each stone edge to edge, no metal between them. Light enters one stone and travels the finger without interruption."
        videoUrl="https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.mp4"
        posterUrl="https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_1080/Jewelry%20Videos/Bracelets/the_elysian_4k_v1_1_ymddbz.jpg"
        reverse
      />

      {/* ── The Cut — oval stone editorial ── */}
      <HomeSegment
        eyebrow="Featuring the Elysian Cut™"
        title="Calibrated for the Oval"
        body="A baguette moves light in long, directional planes — that's the step cut at work. The Elysian Cut™ takes that discipline and bends it into an oval form: the broad, sweeping brilliance of a step cut, inside the curve of an oval. Set in a continuous ring, it reads not as a row of diamonds, but as a single, unbroken ribbon of light."
        imageUrl="https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_1100/v1779074065/Jewelry%20Images/Stones/Elysian_cut_oval_qcdt5r.jpg"
      />

      {/* ── Pull quote ── */}
      <section className="ba-pull-quote">
        <span className="ba-pull-quote__mark">&ldquo;</span>
        <p className="ba-pull-quote__text">
          The certificate grades the stone. The light tells the truth.
        </p>
        <span className="ba-pull-quote__attr">Bez Ambar</span>
      </section>

      {/* ── Dark image break ── */}
      <HomeHeroImage
        imageUrl="https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto:good/Jewelry%20Images/Bracelets/axiom-bracelet-model-shot.jpg"
        height={600}
        eyebrow="The Band"
        title="One Unbroken Line"
        sub="Designed and Made in Los Angeles"
      />

      {/* ── Pricing section ── */}
      <section className={styles.pricing}>
        <div className={styles.pricingHeader}>
          <p className={styles.pricingEyebrow}>Four Stone Sizes · Full Eternity &amp; Halfway</p>
          <h2 className={styles.pricingTitle}>The Elysian Band</h2>
        </div>

        <div className={styles.variantList}>
          {VARIANTS.map((v) => (
            <div key={v.ref} className={styles.variantStrip}>

              {/* Left — reference + description */}
              <div className={styles.stripLeft}>
                <span className={styles.stripRef}>{v.ref} · {v.halfRef}</span>
                <span className={styles.stripSize}>{v.size}</span>
                <p className={styles.stripDesc}>{v.desc}</p>
              </div>

              {/* Right — two price columns */}
              <div className={styles.stripRight}>
                <div className={styles.priceCol}>
                  <span className={styles.priceType}>Full Eternity</span>
                  <span className={styles.priceMeta}>{v.full.stones} stones · {v.full.carats} ct</span>
                  <span className={styles.priceRange}>
                    {usd(v.full.priceFrom)}<span className={styles.priceDash}> – </span>{usd(v.full.priceTo)}
                  </span>
                </div>
                <div className={`${styles.priceCol} ${styles.priceColHalf}`}>
                  <span className={styles.priceType}>Halfway</span>
                  <span className={styles.priceMeta}>{v.half.stones} stones · {v.half.carats} ct</span>
                  <span className={styles.priceRange}>
                    {usd(v.half.priceFrom)}<span className={styles.priceDash}> – </span>{usd(v.half.priceTo)}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

        <p className={styles.priceNote}>
          Price varies by diamond quality. Larger stones available upon request.
          Stones of 1 ct and 1.5 ct available — considerably rarer, and priced accordingly.
        </p>
      </section>

      {/* ── Coming Soon — Elysian Pear ── */}
      <HomeSegment
        eyebrow="Coming Soon"
        title="The Elysian Pear"
        body="A teardrop, reborn. The step-cut discipline applied to a pear shape — the next chapter in the line of brilliance. Pear Cut. Continuous Line. Each teardrop calibrated to the next, until light becomes the band itself."
        videoUrl="https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bracelets/4k_pearshape_bracelet_v1_awqjfc.mp4"
        posterUrl="https://res.cloudinary.com/dlg2mou53/video/upload/so_0,f_jpg,q_auto,w_1080/Jewelry%20Videos/Bracelets/4k_pearshape_bracelet_v1_awqjfc.jpg"
        reverse
      />

      {/* ── Closing CTA ── */}
      <PageCta
        eyebrow="The Elysian Band"
        title="Arrange a Private Viewing"
        body="Full eternity and halfway versions in four stone sizes. By private appointment, Los Angeles."
        drawer
        intent="Elysian Band Inquiry"
        ctaLabel="Inquire About the Band"
      />

      <AtelierBanner />

      <FloatingCollectionCTA
        collectionName="The Elysian Band"
        eyebrow="Presentation"
        intent="Elysian Band Inquiry"
      />
    </main>
  )
}
