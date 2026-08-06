import type { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'The Story — Bez Ambar',
  description:
    'The Bez Ambar story — four decades of cutting, inventing, and building. From Los Angeles, 1979, to the present.',
}

/**
 * Next.js enhancement: clean vertical timeline RSC.
 * No client JS required — pure HTML/CSS, printable, accessible.
 * Better mobile UX than Astro's complex horizontal scroll version.
 */

const CHAPTERS = [
  {
    year: '1979',
    headline: 'Los Angeles. The Beginning.',
    body: 'Bez Ambar arrives in Los Angeles and founds Ambar Diamonds Inc. He comes as a cutter — not a retailer. From the first day, the studio is where the work begins. Not where finished pieces arrive from somewhere else.',
  },
  {
    year: '1982',
    headline: 'The Princess Cut',
    body: 'The Quadrillion® cut is introduced: a square brilliant that delivers the fire of a round diamond inside a clean, modern geometry. The trade adopts it immediately. The world eventually calls it the Princess cut. Bez\'s cut, under a different name. It becomes the most popular diamond shape on Earth. The man who invented it keeps working.',
    note: 'Patent No. US4,393,671 · DeBeers Award, 1985',
  },
  {
    year: '1988',
    headline: 'The Laserset® Setting',
    body: 'The Laserset® is a rimless, prongless setting for square-cut diamonds. There is no metal at the edge of the stone. The diamond appears to float in the hand. It is the first setting of its kind.',
    note: 'Registered Trademark · Bez Ambar Inc.',
  },
  {
    year: '1992',
    headline: 'The Boundless Setting',
    body: 'The same logic, applied to round diamonds. The Boundless setting removes the prong from the round brilliant, letting the stone sit clean in the hand without the visual interruption of metal at its edge.',
  },
  {
    year: '1999',
    headline: 'Micro-Pavé',
    body: 'A new pavé technique enters the atelier. The industry eventually names it Micro-Pavé. It becomes one of the most widely used setting styles in fine jewelry worldwide. Bez had been doing it for years.',
  },
  {
    year: '2003',
    headline: 'The Blaze® Cut',
    body: 'The Blaze® cut is patented. Thirteen precisely aligned facets produce a starburst of light visible to the naked eye under white light. This effect is specific to the Blaze® geometry — it cannot be replicated by any other arrangement of facets. No other house in the world produces it.',
    note: 'Patent · Registered Trademark · Bez Ambar Inc.',
  },
  {
    year: '2015',
    headline: 'The Divine Cut®',
    body: 'The Divine Cut® is introduced — a round brilliant engineered for a specific quality of dispersion. Forty years of cutting practice, distilled into a geometry. Continuing the atelier\'s lifetime study of how light moves inside a stone.',
    note: 'Patent · Registered Trademark · Bez Ambar Inc.',
  },
  {
    year: '2024',
    headline: 'Still Here. Still Cutting.',
    body: 'The atelier remains at its bench in Los Angeles. Every diamond still evaluated by eye. Every piece still cut in-house. The practice hasn\'t changed. The city around it has. The work continues.',
  },
]

export default function TheStoryPage() {
  return (
    <main>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Bez Ambar · Est. 1979</p>
        <h1 className={styles.heroTitle}>The Story</h1>
        <p className={styles.heroLede}>
          Not a biography. A line from one cut to the next, from Los Angeles in 1979
          to the bench today.
        </p>
        <div className={styles.heroScroll} aria-hidden="true">
          <div className={styles.heroScrollLine} />
        </div>
      </section>

      {/* ── Intro prose ── */}
      <section className={styles.introSection}>
        <p className={styles.introPara}>
          Most people learn the name Bez Ambar through the Princess cut — the square brilliant
          that became the most popular diamond shape on Earth. Few know he invented it. Fewer
          still know that he kept building after that, for another forty years, in the same city,
          at the same bench.
        </p>
        <p className={styles.introPara}>
          This is the sequence of what he made, and when he made it.
        </p>
      </section>

      {/* ── Timeline ── */}
      <section className={styles.timeline}>
        {CHAPTERS.map((ch, i) => (
          <article key={ch.year} className={styles.chapter}>
            <div className={styles.chapterYear}>{ch.year}</div>
            <div className={styles.chapterContent}>
              <h2 className={styles.chapterHeadline}>{ch.headline}</h2>
              <p className={styles.chapterBody}>{ch.body}</p>
              {ch.note && (
                <p className={styles.chapterNote}>{ch.note}</p>
              )}
            </div>
          </article>
        ))}
      </section>

      {/* ── Closing pull quote ── */}
      <section className={styles.quote}>
        <blockquote className={styles.quoteText}>
          "I cut the diamond. Then I design the piece around it. That's how it's always worked."
        </blockquote>
        <cite className={styles.quoteAttr}>— Bez Ambar, Los Angeles</cite>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <p className={styles.ctaEyebrow}>Continue the Story</p>
        <h2 className={styles.ctaTitle}>Begin a Piece</h2>
        <p className={styles.ctaBody}>
          Every Bez Ambar commission starts with a conversation. The atelier is open
          by appointment at 611 Wilshire Blvd, Los Angeles.
        </p>
        <a href="/contact" className={styles.ctaBtn}>Arrange a Consultation</a>
      </section>

    </main>
  )
}
