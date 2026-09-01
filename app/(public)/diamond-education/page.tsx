import type { Metadata } from 'next'
import PageCta from '@/components/common/PageCta'
import ScrollSpyTabs from './ScrollSpyTabs'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Diamond Education — The 4Cs, Shapes & Anatomy | Bez Ambar',
  description:
    'Master the fundamentals of diamond quality. The 4Cs (cut, color, clarity, carat), diamond shapes, and how to select your stone — from the Bez Ambar atelier.',
}

/**
 * Next.js enhancement: anchor-based section navigation.
 * No client-side JavaScript needed — sections are always visible,
 * the tab bar scrolls to each section via native anchor links.
 * Each section has scroll-margin-top to clear the fixed header + tab bar.
 * This is shareable (#cut, #color, etc.), works without hydration, SSR-friendly.
 */
export default function DiamondEducationPage() {
  return (
    <main>

      {/* ── Dark video hero ── */}
      <section className={styles.hero}>
        <video
          className={styles.heroVideo}
          autoPlay muted loop playsInline preload="none"
          aria-hidden="true"
        >
          <source
            src="https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Rings/c0578_4k_v1_2160p_wwnfcz.mp4"
            type="video/mp4"
          />
        </video>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Diamond Education</p>
          <h1 className={styles.heroTitle}>The Language<br />of Light</h1>
          <div className={styles.heroRule} />
          <p className={styles.heroLede}>
            Four characteristics determine a diamond's quality. Understanding them is
            the difference between buying a certificate and choosing a stone you will
            wear for a lifetime.
          </p>
        </div>
      </section>

      {/* Scroll-spy tab bar — 'use client' component tracks active section via IntersectionObserver */}
      <ScrollSpyTabs />

      {/* ── Editorial intro ── */}
      <div className={styles.introEditorial}>
        <div className={styles.introEditorialInner}>
          <p>At the Bez Ambar atelier, every stone is evaluated against the same four criteria that have defined diamond quality since the mid-twentieth century. These are not abstract specifications — they are the language of light, translated into a grading system.</p>
        </div>
      </div>

      {/* ── The 4Cs Overview ── */}
      <section id="four-cs" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Where to Begin</span>
            <h2 className={styles.heading}>The Four Cs</h2>
            <p className={styles.intro}>Diamond quality is universally measured by four characteristics. Each plays a distinct role in the stone's beauty. Understanding how they interact will help you find the right stone at the right price.</p>
          </div>
          <div className={styles.fourCsGrid}>
            {[
              { letter: 'C', name: 'Cut', desc: 'How precisely the diamond is faceted. Determines how light enters, reflects, and exits. The most important of the four — a poor cut will dull even the finest stone.' },
              { letter: 'C', name: 'Color', desc: 'The absence of color in a white diamond. The GIA grades from D (colorless) to Z (light yellow). In the near-colorless range — G through J — color is invisible to the naked eye.' },
              { letter: 'C', name: 'Clarity', desc: 'The absence of internal inclusions and surface blemishes. Most are microscopic and invisible without magnification. Eye-clean stones at VS2 or SI1 are excellent value.' },
              { letter: 'C', name: 'Carat', desc: 'Weight, not size. One carat equals 200 milligrams. Larger stones are rarer, so price increases exponentially — a 2-carat stone of equal quality costs significantly more than twice a 1-carat.' },
            ].map((c) => (
              <div key={c.name} className={styles.cCard}>
                <div className={styles.cLetter}>{c.letter}</div>
                <div>
                  <h3 className={styles.cName}>{c.name}</h3>
                  <p className={styles.cDesc}>{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cut ── */}
      <section id="cut" className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={`${styles.eyebrow} ${styles.eyebrowWarm}`}>The Most Important C</span>
            <h2 className={`${styles.heading} ${styles.headingLight}`}>Cut</h2>
            <p className={`${styles.intro} ${styles.introLight}`}>Cut is not the shape of a diamond — it is the quality of its faceting. A diamond's ability to reflect light depends entirely on the precision of its proportions, symmetry, and polish.</p>
          </div>
          <div className={styles.prose}>
            <h3 className={styles.subheading}>What Cut Measures</h3>
            <p>The GIA evaluates cut on three dimensions: <strong>proportions</strong> — the relationship between table size, crown height, and pavilion depth; <strong>symmetry</strong> — how precisely the facets align; and <strong>polish</strong> — the condition of the surface at a microscopic level.</p>

            <h3 className={styles.subheading}>The Grade Scale</h3>
            <p>GIA cut grades range from Excellent through Very Good, Good, Fair, and Poor. At the Bez Ambar atelier, we work exclusively with Excellent-grade cuts. Not because the certificate requires it, but because the light demands it.</p>

            <h3 className={styles.subheading}>The Bez Ambar Cuts</h3>
            <p>Three of the cuts offered by this atelier — the Quadrillion® (Princess), the Blaze®, and the Divine Cut® — are proprietary geometries patented by Bez Ambar. They exist outside the GIA cut grade system because they predate it. Their quality is assessed at the bench, by the same cutter who designed the facet arrangement.</p>
          </div>
        </div>
      </section>

      {/* ── Color ── */}
      <section id="color" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Second C</span>
            <h2 className={styles.heading}>Color</h2>
            <p className={styles.intro}>Color in a white diamond refers to the presence or absence of a yellow or brown tint. The less color, the higher the grade — and typically, the higher the price.</p>
          </div>
          <div className={styles.prose}>
            <h3 className={styles.subheading}>The GIA Color Scale</h3>
            <p>The GIA grades white diamonds from D (perfectly colorless) through Z (light yellow or brown). The grades fall into groups: D-F (colorless), G-J (near colorless), K-M (faint), N-R (very light), S-Z (light).</p>

            <h3 className={styles.subheading}>What to Choose</h3>
            <p>In practice, color differences between adjacent grades are invisible to the naked eye, particularly in smaller stones or when set in yellow gold. At Bez Ambar, we recommend G-H for white gold or platinum settings, and I-J for yellow gold — where the metal masks any trace of warmth.</p>

            <h3 className={styles.subheading}>Fancy Color</h3>
            <p>Diamonds with strong, vivid color — yellows, pinks, blues, greens — are graded on a separate scale and priced by the intensity of their color rather than its absence. These are among the rarest and most valuable gems in the world.</p>
          </div>
        </div>
      </section>

      {/* ── Clarity ── */}
      <section id="clarity" className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Third C</span>
            <h2 className={styles.heading}>Clarity</h2>
            <p className={styles.intro}>Clarity describes the presence or absence of inclusions (internal) and blemishes (surface). Most inclusions in well-graded diamonds are microscopic and invisible without magnification.</p>
          </div>
          <div className={styles.prose}>
            <h3 className={styles.subheading}>The GIA Clarity Scale</h3>
            <p>FL (Flawless) — IF (Internally Flawless) — VVS1/VVS2 (Very Very Slightly Included) — VS1/VS2 (Very Slightly Included) — SI1/SI2 (Slightly Included) — I1/I2/I3 (Included).</p>

            <h3 className={styles.subheading}>What to Choose</h3>
            <p>For most buyers, VS2 or SI1 represents the ideal balance of quality and value. Inclusions at these grades are invisible to the naked eye but allow a meaningful price reduction over VS1 and above. At Bez Ambar, we inspect each stone under magnification to confirm eye-clarity before any piece is accepted for commission.</p>
          </div>
        </div>
      </section>

      {/* ── Carat ── */}
      <section id="carat" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Fourth C</span>
            <h2 className={styles.heading}>Carat</h2>
            <p className={styles.intro}>Carat is a unit of weight, not size. One carat equals exactly 200 milligrams. A diamond's face-up size (diameter) depends on both its carat weight and its cut proportions.</p>
          </div>
          <div className={styles.prose}>
            <h3 className={styles.subheading}>Weight vs Size</h3>
            <p>Two diamonds of the same carat weight can appear very different in size depending on their cut. A well-cut 1-carat round brilliant measures approximately 6.5mm across. A poorly cut stone of the same weight may measure significantly less — because the weight is buried in the pavilion, not distributed across the face.</p>

            <h3 className={styles.subheading}>The Price Curve</h3>
            <p>Diamond prices increase exponentially with carat weight. A 2-carat stone is significantly more than twice the price of a comparable 1-carat — because large stones are exponentially rarer. The threshold weights (0.50, 1.00, 1.50, 2.00 ct) carry price premiums. Stones just under these thresholds — 0.49, 0.98, 1.48 — offer meaningful value.</p>
          </div>
        </div>
      </section>

      {/* ── Shapes ── */}
      <section id="shapes" className={`${styles.section} ${styles.sectionDark}`}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={`${styles.eyebrow} ${styles.eyebrowWarm}`}>Beyond Round</span>
            <h2 className={`${styles.heading} ${styles.headingLight}`}>Diamond Shapes</h2>
            <p className={`${styles.intro} ${styles.introLight}`}>The shape of a diamond is a design decision. It affects how the stone looks on the hand, how light moves through it, and what it says about the piece it lives in.</p>
          </div>
          <div className={styles.shapesGrid}>
            {[
              { name: 'Round Brilliant', desc: 'The most popular shape. 58 facets engineered to maximize light return. The standard against which all others are measured.' },
              { name: 'Princess', desc: 'Square brilliant. Invented by Bez Ambar in 1982 under the name Quadrillion®. The second most popular shape in the world.' },
              { name: 'Oval', desc: 'Elongated brilliant. Appears larger per carat than round. Flattering on the finger — the elongation extends the hand.' },
              { name: 'Pear', desc: 'A teardrop. The pointed end is directional — it narrows the appearance of the finger when oriented down.' },
              { name: 'Marquise', desc: 'Two pointed ends. The most elongated of the standard shapes. Maximizes face-up size per carat.' },
              { name: 'Emerald', desc: 'Rectangular step cut. Emphasizes clarity over brilliance. Hall-of-mirrors effect — long, open flashes of light.' },
              { name: 'Cushion', desc: 'Square or rectangular with rounded corners. Classic. Was the dominant shape before the round brilliant was standardized.' },
              { name: 'Radiant', desc: 'Rectangular or square with cropped corners and brilliant-cut facets. Combines the shape of the emerald with the fire of the round.' },
            ].map((s) => (
              <div key={s.name} className={styles.shapeCard}>
                <h3 className={styles.shapeName}>{s.name}</h3>
                <p className={styles.shapeDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Anatomy ── */}
      <section id="anatomy" className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>The Structure</span>
            <h2 className={styles.heading}>Diamond Anatomy</h2>
            <p className={styles.intro}>A diamond is engineered in three parts. Understanding each helps you understand why one stone looks better than another of identical weight.</p>
          </div>
          <div className={styles.anatomyGrid}>
            <div className={styles.anatomyPart}>
              <h3 className={styles.anatomyName}>Crown</h3>
              <p className={styles.anatomyDesc}>The upper portion above the girdle. The crown captures light and directs it into the stone. A well-proportioned crown creates the "sparkle" visible in normal lighting.</p>
            </div>
            <div className={styles.anatomyPart}>
              <h3 className={styles.anatomyName}>Girdle</h3>
              <p className={styles.anatomyDesc}>The thin band at the widest point. The girdle is the setting contact zone — where prongs, bezels, and channels grip the stone. Too thin and the stone can chip; too thick and it adds weight without adding size.</p>
            </div>
            <div className={styles.anatomyPart}>
              <h3 className={styles.anatomyName}>Pavilion</h3>
              <p className={styles.anatomyDesc}>The lower portion below the girdle. The pavilion angle determines whether light exits through the table (desirable) or leaks out the sides (undesirable). The Elysian Cut™ and Blaze® both engineer their pavilion angle precisely to achieve their characteristic light behavior.</p>
            </div>
          </div>
        </div>
      </section>

      <PageCta
        eyebrow="Choose Your Stone"
        title="Talk to the Cutter"
        body="At Bez Ambar, stone selection is part of the commission process. We evaluate each stone by eye — not just by certificate. Arrange a consultation to begin."
        drawer
        intent="Commission a Piece"
        ctaLabel="Arrange a Consultation"
      />

    </main>
  )
}
