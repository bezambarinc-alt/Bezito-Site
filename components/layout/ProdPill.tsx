'use client'

import { useEffect, useState } from 'react'
import { useDrawers } from './DrawerContext'
import styles from './ProdPill.module.css'

interface ProdPillProps {
  title?: string
  sku?: string
}

/** Sticky bottom pill that opens the InquiryDrawer pre-populated for this piece. */
export default function ProdPill({ title, sku }: ProdPillProps) {
  const { openInquiryDrawer } = useDrawers()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`${styles.pill} ${visible ? styles.visible : ''}`}>
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
