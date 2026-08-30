import InquiryButton from './InquiryButton'
import styles from './AtelierBanner.module.css'

export default function AtelierBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.inner}>
        <h2 className={`ba-title ${styles.headline}`}>We Transform Stones Into Art.</h2>

        <p className={styles.body}>
          In partnership with diamond cutters, color stone dealers, and retailers. All inquiries welcome.
        </p>

        <InquiryButton intent="Bring Us Your Stone" className={styles.cta}>
          Bring Us Your Stone →
        </InquiryButton>

        <div className={styles.rule} />

        <p className={styles.wordmark}>Bez Ambar</p>
        <p className={styles.eyebrow}>Los Angeles · Est. 1979</p>
      </div>
    </section>
  )
}
