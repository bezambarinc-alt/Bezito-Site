'use client'

import Link from 'next/link'
import { useDrawers } from './DrawerContext'
import styles from './ProdPill.module.css'

interface AdjacentProduct {
  slug: string
  name: string
}

interface ProdPillProps {
  title?: string
  sku?: string
  category?: string
  prevProduct?: AdjacentProduct | null
  nextProduct?: AdjacentProduct | null
}

/** Sticky bottom pill — piece name · inquiry CTA · optional prev/next navigation. */
export default function ProdPill({ title, sku, category, prevProduct, nextProduct }: ProdPillProps) {
  const { openInquiryDrawer } = useDrawers()
  const hasNav = !!(prevProduct || nextProduct)

  return (
    <div className={`${styles.pill} ${styles.visible} ${hasNav ? styles.pillWithNav : ''}`}>
      {prevProduct && category && (
        <>
          <Link
            href={`/jewelry/${category}/${prevProduct.slug}`}
            className={styles.navArrow}
            aria-label={`Previous: ${prevProduct.name}`}
          >
            ‹
          </Link>
          <span className={styles.navDivider} aria-hidden="true" />
        </>
      )}

      {title && <span className={styles.piece}>{title}</span>}

      <button
        className={styles.btn}
        onClick={() => openInquiryDrawer({ title, sku, intent: 'A Piece from the Collection' })}
      >
        Inquire About This Piece
      </button>

      {nextProduct && category && (
        <>
          <span className={styles.navDivider} aria-hidden="true" />
          <Link
            href={`/jewelry/${category}/${nextProduct.slug}`}
            className={styles.navArrow}
            aria-label={`Next: ${nextProduct.name}`}
          >
            ›
          </Link>
        </>
      )}
    </div>
  )
}
