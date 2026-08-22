import type { Metadata } from 'next'
import Image from 'next/image'
import PageCta from '@/components/common/PageCta'
import { ELYSIAN_CUTS } from '@/lib/data/elysian-cuts'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'The Elysian Cut™ — A Family of Cuts | Bez Ambar',
  description:
    'The Elysian Cut™ is a family of original step-cut geometries engineered for calibrated precision. Seven shapes, one philosophy. By Bez Ambar, Los Angeles.',
}

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
        <div className={styles.heroOverlay} aria-hidden />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>The Elysian Cut™</p>
          <h1 className={styles.heroTitle}>A Family<br />of Cuts</h1>
          <div className={styles.heroRule} aria-hidden />
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
          <div className={styles.philosophyNumber} aria-hidden>7</div>
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
          {ELYSIAN_CUTS.map((cut) => (
            <div key={cut.name} className={styles.cutCard}>
              <div className={styles.cutImg}>
                <Image
                  src={cut.img}
                  alt={`Elysian Cut™ ${cut.name} by Bez Ambar`}
                  fill
                  sizes="(max-width: 600px) 50vw, (max-width: 900px) 33vw, 25vw"
                  className={styles.cutPhoto}
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
      <PageCta
        eyebrow="The Elysian Band"
        title="See It on the Finger"
        body="The Elysian Pear and Oval bands are available through the atelier. Arrange a private viewing to experience the continuous line in person."
        drawer
        intent="Elysian Band"
        ctaLabel="Arrange a Consultation"
      />

    </main>
  )
}
