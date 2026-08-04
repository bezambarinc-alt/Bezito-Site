'use client'

import type { InquireCtaBlock } from '@/types/blocks'
import { useDrawers } from '@/components/layout/DrawerContext'
import styles from './InquireCta.module.css'

/** "Private Viewing" section — button opens the InquiryDrawer, pre-populated. */
export default function InquireCta({ block }: { block: InquireCtaBlock }) {
  const { openInquiryDrawer } = useDrawers()
  return (
    <section className={styles.cta}>
      <div className={styles.inner}>
        <p className="ba-eyebrow">By Appointment</p>
        <h2 className={styles.title}>{block.title ?? 'Request a Private Viewing'}</h2>
        <p className={styles.body}>
          {block.body ??
            'Each piece is presented privately at our Los Angeles atelier or by virtual appointment.'}
        </p>
        <button
          className={styles.btn}
          onClick={() =>
            openInquiryDrawer({
              title: block.pieceTitle,
              sku: block.sku,
              intent: 'A Piece from the Collection',
            })
          }
        >
          {block.btnLabel ?? 'Inquire'}
        </button>
      </div>
    </section>
  )
}
