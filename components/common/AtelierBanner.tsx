import InquiryButton from './InquiryButton'
import styles from './AtelierBanner.module.css'

export default function AtelierBanner() {
  return (
    <section className={styles.banner}>
      {/* Chiseled letterform — SVG text with engraved light effect */}
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Los Angeles · Est. 1979</p>

        <svg
          className={styles.wordmark}
          viewBox="0 0 900 140"
          aria-label="Atelier Bez Ambar"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="chisel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.08" />
              <stop offset="38%"  stopColor="#c9a96e" stopOpacity="0.72" />
              <stop offset="52%"  stopColor="#f0dbb0" stopOpacity="0.95" />
              <stop offset="66%"  stopColor="#c9a96e" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.04" />
            </linearGradient>
            <linearGradient id="chiselHi" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#ffffff" stopOpacity="0.0" />
              <stop offset="45%"  stopColor="#ffffff" stopOpacity="0.18" />
              <stop offset="55%"  stopColor="#ffffff" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Shadow layer — depth */}
          <text
            x="450" y="108"
            textAnchor="middle"
            className={styles.shadowText}
            dy="2" dx="1.5"
          >
            BEZ AMBAR
          </text>

          {/* Base fill — chiseled gold gradient */}
          <text
            x="450" y="108"
            textAnchor="middle"
            className={styles.baseText}
            fill="url(#chisel)"
          >
            BEZ AMBAR
          </text>

          {/* Highlight layer — specular glint */}
          <text
            x="450" y="108"
            textAnchor="middle"
            className={styles.baseText}
            fill="url(#chiselHi)"
          >
            BEZ AMBAR
          </text>
        </svg>

        <p className={styles.tagline}>
          Most jewelers set a stone. We choose it, then draw the piece around it.
        </p>

        <InquiryButton intent="Private Consultation" className={styles.cta}>
          Consult us →
        </InquiryButton>

        <div className={styles.rule} />
      </div>
    </section>
  )
}
