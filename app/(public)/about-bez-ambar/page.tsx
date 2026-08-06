import type { Metadata } from 'next'
import Image from 'next/image'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'About Bez Ambar — Artist, Designer & Inventor of the Princess Cut',
  description:
    'About Bez Ambar: Israeli-American diamond artist, designer, and inventor of the Princess cut. Three patented cuts. One atelier in Los Angeles, since 1979.',
  openGraph: {
    title: 'About Bez Ambar',
    description: 'Inventor of the Princess Cut. Four decades of chiseling light from a Los Angeles atelier.',
  },
}

const STATS = [
  { number: '1979', label: 'Founded in Los Angeles' },
  { number: '3',    label: 'Patented Diamond Cuts' },
  { number: '45+',  label: 'Years of Innovation' },
  { number: '1982', label: 'Inventor of the Princess Cut' },
]

const TIMELINE = [
  {
    year: '1979',
    title: 'Los Angeles. The Beginning.',
    body: 'Bez Ambar arrives in Los Angeles and founds Ambar Diamonds Inc. He comes as a cutter, not a retailer. From the first day, the studio is where the work begins — not where finished pieces arrive from somewhere else.',
  },
  {
    year: '1982',
    title: 'The Princess Cut',
    body: 'The Quadrillion® cut is introduced: a square brilliant that delivers the fire of a round diamond inside a clean, modern geometry. The trade adopts it immediately. The world eventually calls it the Princess cut. It becomes the most popular diamond shape on Earth.',
    imgUrl: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_600/v1775786208/Jewelry%20Images/Stones/Quadrillion_owciyv.jpg',
    imgAlt: 'The Quadrillion® Princess Cut diamond by Bez Ambar, 1982',
  },
  {
    year: '1985',
    title: 'The DeBeers Award',
    body: 'The ATW Quadrillion® ring receives the DeBeers Award, one of the diamond industry\'s most recognized honors. The cut is now an industry standard.',
  },
  {
    year: '1988',
    title: 'The Laserset® Setting',
    body: 'The Laserset® is a rimless, prongless setting for square-cut diamonds. There is no metal at the edge of the stone. The diamond appears to float in the hand. It is the first setting of its kind.',
  },
  {
    year: '1992',
    title: 'The Boundless Setting',
    body: 'The same logic, applied to round diamonds. The Boundless setting removes the prong from the round brilliant, letting the stone sit clean in the hand without the visual interruption of metal at its edge.',
  },
  {
    year: '1999',
    title: 'Micro-Pavé',
    body: 'A new pavé technique enters the Bez Ambar atelier. The industry eventually names it Micro-Pavé. It is now one of the most widely used setting styles in fine jewelry.',
  },
  {
    year: '2003',
    title: 'The Blaze® Cut',
    body: 'The Blaze® cut is patented. Thirteen precisely aligned facets produce a starburst of light visible to the naked eye under white light. This effect is specific to the Blaze® geometry. No other house in the world produces it.',
  },
  {
    year: '2015',
    title: 'The Divine Cut®',
    body: 'The Divine Cut® is introduced: a round brilliant engineered for a specific quality of dispersion, continuing the atelier\'s forty-year study of how light moves inside a cut stone.',
  },
]

export default function AboutPage() {
  return (
    <main>

      {/* ── Portrait hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroImg}>
          <Image
            src="https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_1600/v1785629661/Diamond_Design_Hero_eoykbn.avif"
            alt="Bez Ambar — inventor of the Princess Cut, Los Angeles atelier"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          />
        </div>
        <div className={styles.heroOverlay}>
          <p className={styles.heroEyebrow}>The Inventor</p>
          <h1 className={styles.heroTitle}>Bez Ambar</h1>
          <p className={styles.heroLede}>
            He cuts the diamond. Then he designs the piece around it. For forty-five
            years, those two acts have been inseparable — the artist and the craftsman
            working from the same hands.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className={styles.statsWrap}>
        <div className={styles.stats}>
          {STATS.map((s) => (
            <div key={s.number} className={styles.stat}>
              <div className={styles.statNumber}>{s.number}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Prose intro ── */}
      <div className={styles.intro}>
        <div className={styles.introInner}>
          <h2 className={styles.introHeading}>One Atelier. One Discipline.</h2>
          <div className={styles.introText}>
            <p>Most jewelry houses source pre-cut diamonds. Some cut their own — using other people's geometries. Bez Ambar designs the facets themselves, executes every cut in-house, and shapes each stone to fit its exact position in the piece.</p>
            <p>That discipline began in 1979, when Bez arrived in Los Angeles as a cutter. It hasn't changed. Every diamond that leaves this atelier has been evaluated, cut, and set by the same team that designed the geometry it was cut to.</p>
            <p>The Princess cut, the Blaze®, the Divine Cut® — three patented diamond geometries invented at 611 Wilshire. Each one a different answer to the same question: how does light move inside a stone, and how do you make it move better?</p>
          </div>
        </div>
      </div>

      {/* ── Timeline — vertical RSC (Next.js enhancement over Astro's JS-heavy horizontal) ── */}
      <section className={styles.timeline}>
        <div className={styles.timelineHeader}>
          <p className={styles.timelineEyebrow}>Four Decades</p>
          <h2 className={styles.timelineTitle}>The History</h2>
          <p className={styles.timelineIntro}>
            A line from Los Angeles, 1979, to the present. Not a legacy — an ongoing
            practice.
          </p>
        </div>

        <div className={styles.timelineList}>
          {TIMELINE.map((entry) => (
            <div key={entry.year} className={styles.tlEntry}>
              <div className={styles.tlYear}>{entry.year}</div>
              <div className={styles.tlContent}>
                <h3 className={styles.tlTitle}>{entry.title}</h3>
                <p className={styles.tlBody}>{entry.body}</p>
                {entry.imgUrl && (
                  <div className={styles.tlImg}>
                    <Image
                      src={entry.imgUrl}
                      alt={entry.imgAlt ?? entry.title}
                      fill
                      sizes="(max-width: 900px) 100vw, 50vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <p className={styles.ctaEyebrow}>Private Consultation</p>
        <h2 className={styles.ctaTitle}>Meet Bez in Los Angeles</h2>
        <p className={styles.ctaBody}>
          Every commission begins with a conversation. Bez is present at every
          meeting. Arrange a private viewing at 611 Wilshire Blvd.
        </p>
        <a href="/contact" className={styles.ctaBtn}>Arrange a Visit</a>
      </section>

    </main>
  )
}
