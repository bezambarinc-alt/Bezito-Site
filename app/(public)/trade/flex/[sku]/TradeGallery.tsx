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
  closeupUrl?: string
}

type MediaItem = { type: 'image'; src: string } | { type: 'video'; src: string }

export default function TradeGallery({ slots, displayName, ijewelUrl, heroIsIJewel, videoUrl, closeupUrl }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const media: MediaItem[] = [
    ...slots.filter(Boolean).map(src => ({ type: 'image' as const, src })),
    ...(videoUrl ? [{ type: 'video' as const, src: videoUrl }] : []),
    ...(closeupUrl ? [{ type: 'video' as const, src: closeupUrl }] : []),
  ]

  const close = useCallback(() => setLightboxIndex(null), [])
  const prev = useCallback(() => setLightboxIndex(cur => cur !== null && cur > 0 ? cur - 1 : cur), [])
  const next = useCallback(() => setLightboxIndex(cur => cur !== null && cur < media.length - 1 ? cur + 1 : cur), [media.length])

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

  const activeItem = lightboxIndex !== null ? media[lightboxIndex] : null
  const hasPrev = lightboxIndex !== null && lightboxIndex > 0
  const hasNext = lightboxIndex !== null && lightboxIndex < media.length - 1
  const lightboxPos = lightboxIndex !== null ? `${lightboxIndex + 1} / ${media.length}` : null

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
          <div
            className={`${styles.galleryItem} ${styles.galleryItemClickable}`}
            onClick={() => setLightboxIndex(slots.filter(Boolean).length)}
          >
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
        {closeupUrl && (
          <div
            className={`${styles.galleryItem} ${styles.galleryItemClickable}`}
            onClick={() => setLightboxIndex(slots.filter(Boolean).length + (videoUrl ? 1 : 0))}
          >
            <video
              autoPlay
              muted
              loop
              playsInline
              src={closeupUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
          </div>
        )}
      </div>

      {activeItem && (
        <div className={styles.lightbox} onClick={close} role="dialog" aria-modal="true">
          <button className={styles.lightboxClose} onClick={close} aria-label="Close">✕</button>
          {hasPrev && (
            <button className={styles.lightboxPrev} onClick={e => { e.stopPropagation(); prev() }} aria-label="Previous">‹</button>
          )}
          {hasNext && (
            <button className={styles.lightboxNext} onClick={e => { e.stopPropagation(); next() }} aria-label="Next">›</button>
          )}
          <div className={styles.lightboxImgWrap} onClick={e => e.stopPropagation()}>
            {activeItem.type === 'video' ? (
              <video
                autoPlay
                loop
                playsInline
                controls
                src={activeItem.src}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <Image
                src={cldUrl(activeItem.src, 'f_auto,q_auto:best,w_3000')}
                alt={`${displayName} · view ${lightboxIndex! + 1}`}
                fill
                unoptimized
                sizes="100vw"
                style={{ objectFit: 'contain' }}
              />
            )}
          </div>
          {lightboxPos && (
            <p className={styles.lightboxCounter}>{lightboxPos}</p>
          )}
        </div>
      )}
    </>
  )
}
