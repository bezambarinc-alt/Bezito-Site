'use client'

import { useDrawers } from '@/components/layout/DrawerContext'
import styles from './pdp.module.css'

interface Props {
  sku: string
  title: string
}

export default function TradeCTA({ sku, title }: Props) {
  const { openInquiryDrawer } = useDrawers()
  return (
    <button
      type="button"
      className={styles.ctaPill}
      onClick={() => openInquiryDrawer({ sku, title })}
    >
      Inquire About This Piece
    </button>
  )
}
