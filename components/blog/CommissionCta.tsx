import InquiryButton from '@/components/common/InquiryButton'
import styles from './CommissionCta.module.css'

/**
 * CommissionCta — closing CTA on every blog post.
 * Dark box, editorial body, white ghost pill button (Patek-level restraint).
 */
export default function CommissionCta() {
  return (
    <div className={styles.box}>
      <h3 className={styles.title}>Commission a Piece of Your Own</h3>
      <p className={styles.body}>
        Every piece is designed and made in the Los Angeles atelier, from the
        first reading of the stone to the final pass of the setting wheel.
        Enquire to begin a commission.
      </p>
      <InquiryButton className={styles.btn} intent="Bespoke Commission">
        Enquire About a Commission
      </InquiryButton>
    </div>
  )
}
