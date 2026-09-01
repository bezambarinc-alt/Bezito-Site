'use client'

import { useDrawers } from '@/components/layout/DrawerContext'
import styles from './ConciergeCtaButton.module.css'

export default function ConciergeCtaButton({ label }: { label: string }) {
  const { openConcierge } = useDrawers()
  return (
    <button
      className={styles.btn}
      onClick={() => openConcierge()}
    >
      {label} →
    </button>
  )
}
