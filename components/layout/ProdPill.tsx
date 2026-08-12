'use client'

import { useDrawers } from './DrawerContext'
import styles from './ProdPill.module.css'

interface ProdPillProps {
  title?: string
  sku?: string
}

/** Sticky bottom pill — always visible from page load. Opens InquiryDrawer for this piece. */
export default function ProdPill({ title, sku }: ProdPillProps) {
  const { openInquiryDrawer } = useDrawers()

  return (
    <div className={`${styles.pill} ${styles.visible}`}>
      {title && <span className={styles.piece}>{title}</span>}
      <button
        className={styles.btn}
        onClick={() => openInquiryDrawer({ title, sku, intent: 'A Piece from the Collection' })}
      >
        Inquire About This Piece
      </button>
    </div>
  )
}
