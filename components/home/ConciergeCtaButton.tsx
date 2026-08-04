'use client'

import { useDrawers } from '@/components/layout/DrawerContext'
import styles from './ConciergeCtaButton.module.css'

export default function ConciergeCtaButton({ label }: { label: string }) {
  const { openInquiryDrawer } = useDrawers()
  return (
    <button
      className={styles.btn}
      onClick={() => openInquiryDrawer({ intent: 'consultation' })}
    >
      {label} →
    </button>
  )
}
