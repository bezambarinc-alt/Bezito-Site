'use client'

import { useEffect, useState } from 'react'
import InquiryButton from './InquiryButton'
import styles from './FloatingCollectionCTA.module.css'

interface Props {
  collectionName: string
  intent?: string
}

/**
 * Floating bottom bar that appears once the user scrolls past the fold.
 * Stays anchored so the inquiry action is always one click away.
 */
export default function FloatingCollectionCTA({ collectionName, intent }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 120)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className={`${styles.bar} ${visible ? styles.visible : ''}`} aria-hidden={!visible}>
      <div className={styles.info}>
        <span className={styles.eyebrow}>Collection</span>
        <span className={styles.name}>{collectionName}</span>
      </div>
      <InquiryButton
        intent={intent ?? `${collectionName} Collection Inquiry`}
        className={styles.btn}
      >
        Inquire
      </InquiryButton>
    </div>
  )
}
