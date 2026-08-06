import type { Metadata } from 'next'
import Image from 'next/image'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'The Elysian Cut™ — A Family of Cuts | Bez Ambar',
  description:
    'The Elysian Cut™ is a family of original step-cut geometries engineered for calibrated precision. Seven shapes, one philosophy. By Bez Ambar, Los Angeles.',
}

const CUTS = [
  {
    name: 'Pear',
    desc: 'The teardrop elongated. Step-cut crown, brilliant pavilion — fire and line held in one outline.',
    img: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1779091383/Jewelry%20Images/Stones/Elysian_cut_pear_sng4kq.jpg',
  },
  {
    name: 'Oval',
    desc: 'The most calibration-flexible of the seven. Elongation without sacrifice of the light line.',
    img: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1779074065/Jewelry%20Images/Stones/Elysian_cut_oval_qcdt5r.jpg',
  },
  {
    name: 'Marquise',
    desc: 'A boat-shaped prism. Maximizes face-up surface while holding Elysian proportion to the edge.',
    img: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1779091372/Jewelry%20Images/Stones/Elysian_cut_marquise_boraiy.jpg',
  },
  {
    name: 'Emerald',
    desc: 'The original step cut, taken further. Rectangular facets at the Elysian pavilion angle.',
    img: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1779091372/Jewelry%20Images/Stones/Elysian_cut_emerald_a1l5gv.jpg',
  },
  {
    name: 'Octagon',
    desc: 'Eight sides converging in measured symmetry. Architectural without being cold.',
    img: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1779091373/Jewelry%20Images/Stones/Elysian_cut_octagon_bucoa5.jpg',
  },
  {
    name: 'Hex',
    desc: 'Six-sided. Rare in fine jewelry. Native to the Elysian calibration system.',
    img: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1779091374/Jewelry%20Images/Stones/Elysian_cut_Hex_ywlwno.jpg',
  },
  {
    name: 'Triangle',
    desc: 'Three points held to Elysian proportion. Form, strictly kept, becomes its own fire.',
    img: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1779169849/Jewelry%20Images/Stones/Elysian_cut_triangle.282_w8c4ki.avif',
  },
]

export default function ElysianCutPage() {
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
            src="https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Rings/C0728_4K_1_smndkz.mp4"
            type="video/mp4"
          />
        </video>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>The Elysian Cut™</p>
          <h1 className={styles.heroTitle}>A Family<br />of Cuts</h1>
          <div className={styles.heroRule} />
          <p className={styles.heroLede}>
            An old idea — the step cut, centuries in the making — reborn across seven
            original geometries. Each engineered from the stone outward.
          </p>
        </div>
      </section>

      {/* ── Editorial intro ── */}
      <div className={styles.intro}>
        <div className={styles.introInner}>
          <p>The Elysian Cut™ is not a single shape. It is a system: a family of original step-cut geometries, each engineered from the stone outward — the line of the crown, the relationship of the pavilion, the angles that decide whether light becomes a flicker or a continuous line.</p>
        </div>
      </div>

      {/* ── Philosophy ── */}
      <section className={styles.philosophy}>
        <div className={styles.philosophyInner}>
          <div className={styles.philosophyNumber}>7</div>
          <div className={styles.philosophyProse}>
            <span className={styles.philosophyEyebrow}>The Philosophy</span>
            <h2 className={styles.philosophyHeading}>Calibration is the Discipline</h2>
            <p className={styles.philosophyBody}>
              Seven shapes. One calibration standard. Each Elysian geometry is defined
              not by outline alone but by the pavilion angle that determines how light
              enters and exits. The result is a family of cuts that share a visual
              language — a continuous line of brilliance — regardless of shape.
            </p>
            <p className={styles.philosophyBody}>
              The Elysian Cut™ entered production as a commercial calibrated stone —
              cut to exact, repeatable dimensions — so that multiple stones of the same
              shape could be set in sequence without visible gap or mismatch. That
              discipline is what separates it from a custom one-off. It is an
              engineered system, not an artistic improvisation.
            </p>
          </div>
        </div>
      </section>

      {/* ── Seven cuts grid ── */}
      <section className={styles.cutsSection}>
        <div className={styles.cutsSectionHeader}>
          <p className={styles.cutsSectionEyebrow}>Seven Geometries</p>
          <h2 className={styles.cutsSectionTitle}>The Elysian Family</h2>
        </div>
        <div className={styles.cutsGrid}>
          {CUTS.map((cut) => (
            <div key={cut.name} className={styles.cutCard}>
              <div className={styles.cutImg}>
                <Image
                  src={cut.img}
                  alt={`Elysian Cut™ ${cut.name} by Bez Ambar`}
                  fill
                  sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className={styles.cutInfo}>
                <h3 className={styles.cutName}>{cut.name}</h3>
                <p className={styles.cutDesc}>{cut.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.cta}>
        <p className={styles.ctaEyebrow}>The Elysian Band</p>
        <h2 className={styles.ctaTitle}>See It on the Finger</h2>
        <p className={styles.ctaBody}>
          The Elysian Pear and Oval bands are available through the atelier. Arrange a
          private viewing to experience the continuous line in person.
        </p>
        <a href="/contact" className={styles.ctaBtn}>Arrange a Consultation</a>
      </section>

    </main>
  )
}
