'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import IJewelViewer from '@/components/pdp/IJewelViewer'
import { cldUrl } from '@/lib/cloudinary'
import styles from './pdp.module.css'

interface Props {
  slots: string[]
  displayName: string
  ijewelUrl: string | null
  heroIsIJewel: boolean
  videoUrl?: string
}

export default function TradeGallery({ slots, displayName, ijewelUrl, heroIsIJewel, videoUrl }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const realIndices = slots.map((s, i) => (s ? i : -1)).filter(i => i >= 0)

  const close = useCallback(() => setLightboxIndex(null), [])

  const prev = useCallback(() => {
    setLightboxIndex(cur => {
      if (cur === null) return null
      const idx = realIndices.lastIndexOf(realIndices.filter(i => i < cur).at(-1) ?? -1)
      const prevI = realIndices.filter(i => i < cur).at(-1)
      return prevI !== undefined ? prevI : cur
    })
  }, [realIndices])

  const next = useCallback(() => {
    setLightboxIndex(cur => {
      if (cur === null) return null
      const nextI = realIndices.find(i => i > cur)
      return nextI !== undefined ? nextI : cur
    })
  }, [realIndices])

  useEffect(() => {
    if (lightboxIndex === null) return
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, close, prev, next])

  const hasPrev = lightboxIndex !== null && realIndices.some(i => i < lightboxIndex)
  const hasNext = lightboxIndex !== null && realIndices.some(i => i > lightboxIndex)
  const lightboxSrc = lightboxIndex !== null ? slots[lightboxIndex] : null
  const lightboxPos = lightboxIndex !== null
    ? `${realIndices.indexOf(lightboxIndex) + 1} / ${realIndices.length}`
    : null

  return (
    <>
      <div className={styles.galleryCol}>
        {heroIsIJewel && ijewelUrl && (
          <div className={styles.galleryItem}>
            <IJewelViewer src={ijewelUrl} title={displayName} />
          </div>
        )}
        {slots.map((src, i) => (
          <div
            key={i}
            className={src ? `${styles.galleryItem} ${styles.galleryItemClickable}` : styles.galleryItem}
            onClick={src ? () => setLightboxIndex(i) : undefined}
          >
            {src && (
              <Image
                src={cldUrl(src, 'f_auto,q_auto:best,w_1500')}
                alt={`${displayName} · view ${i + 1}`}
                fill
                unoptimized
                priority={i === 0 && !heroIsIJewel}
                sizes="(max-width: 860px) 50vw, 27.5vw"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
              />
            )}
          </div>
        ))}
        {videoUrl && (
          <div className={styles.galleryItem}>
            <video
              autoPlay
              muted
              loop
              playsInline
              src={videoUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
          </div>
        )}
      </div>

      {lightboxIndex !== null && lightboxSrc && (
        <div className={styles.lightbox} onClick={close} role="dialog" aria-modal="true">
          <button className={styles.lightboxClose} onClick={close} aria-label="Close">✕</button>
          {hasPrev && (
            <button className={styles.lightboxPrev} onClick={e => { e.stopPropagation(); prev() }} aria-label="Previous">‹</button>
          )}
          {hasNext && (
            <button className={styles.lightboxNext} onClick={e => { e.stopPropagation(); next() }} aria-label="Next">›</button>
          )}
          <div className={styles.lightboxImgWrap} onClick={e => e.stopPropagation()}>
            <Image
              src={cldUrl(lightboxSrc, 'f_auto,q_auto:best,w_3000')}
              alt={`${displayName} · view ${lightboxIndex + 1}`}
              fill
              unoptimized
              sizes="100vw"
              style={{ objectFit: 'contain' }}
            />
          </div>
          {lightboxPos && (
            <p className={styles.lightboxCounter}>{lightboxPos}</p>
          )}
        </div>
      )}
    </>
  )
}
