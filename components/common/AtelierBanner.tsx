import InquiryButton from './InquiryButton'
import styles from './AtelierBanner.module.css'

export default function AtelierBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.inner}>
        <p className={styles.consultEyebrow}>Private Consultation</p>
        <h2 className={styles.headline}>Meet the Concierge</h2>
        <p className={styles.body}>
          Every commission begins with a conversation. Our concierge is available for private
          consultations — in Los Angeles or virtually, wherever you are. Private clients,
          collectors, and industry partners welcome.
        </p>
        <div className={styles.btnRow}>
          <InquiryButton intent="In Person Appointment" className={styles.btn}>
            Arrange a Consultation
          </InquiryButton>
          <InquiryButton intent="Authorized Retailers" className={styles.btn}>
            Authorized Retailers
          </InquiryButton>
        </div>

        <div className={styles.rule} />

        <p className={styles.wordmark}>Bez Ambar</p>
        <p className={styles.estLine}>Los Angeles · Est. 1979</p>
      </div>
    </section>
  )
}
