import InquiryButton from './InquiryButton'
import styles from './AtelierBanner.module.css'

export default function AtelierBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Los Angeles · Est. 1979</p>

        <h2 className={styles.headline}>Bez Ambar</h2>

        <p className={styles.tagline}>
          We transform stones into art.
        </p>

        <p className={styles.body}>
          In partnership with diamond cutters, color stone dealers, and retailers. All inquiries welcome.
        </p>

        <InquiryButton intent="Bring Us Your Stone" className={styles.cta}>
          Bring Us Your Stone →
        </InquiryButton>

        <div className={styles.rule} />
      </div>
    </section>
  )
}
