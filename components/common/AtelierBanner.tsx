import InquiryButton from './InquiryButton'
import styles from './AtelierBanner.module.css'

export default function AtelierBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.inner}>
        <h2 className={`ba-title ${styles.headline}`}>Every stone has one right shape. We find it.</h2>

        <p className={styles.body}>
          Bring us your stone, or let us find one for you.<br />
          The piece is designed around it.
        </p>

        <InquiryButton intent="Commission a Piece" className={styles.cta}>
          Bring Us Your Stone →
        </InquiryButton>

        <div className={styles.rule} />

        <p className={styles.wordmark}>Bez Ambar</p>
        <p className={styles.eyebrow}>Los Angeles · Est. 1979</p>
      </div>
    </section>
  )
}
