import Link from 'next/link'
import InquiryButton from './InquiryButton'
import styles from './AtelierBanner.module.css'

export default function AtelierBanner() {
  return (
    <section className={styles.banner}>
      <div className={styles.inner}>
        <p className={styles.consultEyebrow}>The Bez Ambar Way</p>
        <h2 className={styles.headline}>We begin in the stone.</h2>
        <p className={styles.body}>
          Every piece starts with the cut. We shape the diamond to belong to the ring —
          releasing the fire already waiting inside it. It&apos;s sculpting with light.
        </p>
        <div className={styles.btnRow}>
          <InquiryButton intent="Virtual Appointment" className={styles.btn}>
            Begin with your stone.
          </InquiryButton>
        </div>

        <Link href="/archive" className={styles.archiveLink}>
          Every piece, catalogued. Visit the Archive →
        </Link>

        <div className={styles.rule} />

        <p className={styles.wordmark}>Bez Ambar</p>
      </div>
    </section>
  )
}
