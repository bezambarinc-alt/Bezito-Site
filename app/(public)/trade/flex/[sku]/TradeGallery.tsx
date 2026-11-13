'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
  modelSrc?: string
}

type MediaItem = { type: 'image'; src: string } | { type: 'video'; src: string }

export default function TradeGallery({ slots, displayName, ijewelUrl, heroIsIJewel, videoUrl, closeupUrl, modelSrc }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [zoomed, setZoomed] = useState(false)
  const zoomedContainerRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef({ active: false, moved: false, startX: 0, startY: 0, scrollLeft: 0, scrollTop: 0 })
  const lastTapRef = useRef(0)
  const closeBtnRef = useRef<HTMLButtonElement | null>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const isOpen = lightboxIndex !== null

  // Open the lightbox from a tile, remembering the tile so focus can return to it.
  const openAt = useCallback((index: number, trigger: HTMLElement) => {
    triggerRef.current = trigger
    setLightboxIndex(index)
  }, [])

  // Keyboard activation for role="button" tiles (Enter / Space)
  const tileKeyDown = useCallback((index: number) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openAt(index, e.currentTarget)
    }
  }, [openAt])

  // Focus management: focus Close on open, restore focus to the trigger on close
  useEffect(() => {
    if (!isOpen) return
    closeBtnRef.current?.focus()
    return () => {
      triggerRef.current?.focus()
      triggerRef.current = null
    }
  }, [isOpen])

  const media: MediaItem[] = [
    ...slots.filter(Boolean).map(src => ({ type: 'image' as const, src })),
    ...(videoUrl ? [{ type: 'video' as const, src: videoUrl }] : []),
    ...(closeupUrl ? [{ type: 'video' as const, src: closeupUrl }] : []),
  ]

  const close = useCallback(() => {
    setZoomed(false)
    setLightboxIndex(null)
  }, [])

  const prev = useCallback(() => {
    setZoomed(false)
    setLightboxIndex(cur => cur !== null && cur > 0 ? cur - 1 : cur)
  }, [])

  const next = useCallback(() => {
    setZoomed(false)
    setLightboxIndex(cur => cur !== null && cur < media.length - 1 ? cur + 1 : cur)
  }, [media.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomed) setZoomed(false)
        else close()
      }
      if (!zoomed && e.key === 'ArrowLeft') prev()
      if (!zoomed && e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, zoomed, close, prev, next])

  // Center the scroll when entering zoom mode
  useEffect(() => {
    if (!zoomed || !zoomedContainerRef.current) return
    const el = zoomedContainerRef.current
    requestAnimationFrame(() => {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2
      el.scrollTop = (el.scrollHeight - el.clientHeight) / 2
    })
  }, [zoomed])

  const activeItem = lightboxIndex !== null ? media[lightboxIndex] : null
  const hasPrev = lightboxIndex !== null && lightboxIndex > 0
  const hasNext = lightboxIndex !== null && lightboxIndex < media.length - 1
  const lightboxPos = lightboxIndex !== null ? `${lightboxIndex + 1} / ${media.length}` : null

  // Desktop drag-to-pan
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!zoomedContainerRef.current) return
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      scrollLeft: zoomedContainerRef.current.scrollLeft,
      scrollTop: zoomedContainerRef.current.scrollTop,
    }
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const d = dragRef.current
    if (!d.active || !zoomedContainerRef.current) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
    zoomedContainerRef.current.scrollLeft = d.scrollLeft - dx
    zoomedContainerRef.current.scrollTop = d.scrollTop - dy
  }, [])

  const onMouseUp = useCallback(() => {
    if (!dragRef.current.active) return
    const wasMoved = dragRef.current.moved
    dragRef.current.active = false
    dragRef.current.moved = false
    if (!wasMoved) setZoomed(false)
  }, [])

  // Mobile double-tap to toggle
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const now = Date.now()
    if (now - lastTapRef.current < 280) {
      e.preventDefault()
      setZoomed(z => !z)
    }
    lastTapRef.current = now
  }, [])

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
            onClick={src ? e => openAt(i, e.currentTarget) : undefined}
            onKeyDown={src ? tileKeyDown(i) : undefined}
            role={src ? 'button' : undefined}
            tabIndex={src ? 0 : undefined}
            aria-label={src ? `View ${displayName} · view ${i + 1}` : undefined}
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
            onClick={e => openAt(slots.filter(Boolean).length, e.currentTarget)}
            onKeyDown={tileKeyDown(slots.filter(Boolean).length)}
            role="button"
            tabIndex={0}
            aria-label={`Play ${displayName} turntable video`}
          >
            <video
              autoPlay muted loop playsInline src={videoUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
          </div>
        )}
        {closeupUrl && (
          <div
            className={`${styles.galleryItem} ${styles.galleryItemClickable}`}
            onClick={e => openAt(slots.filter(Boolean).length + (videoUrl ? 1 : 0), e.currentTarget)}
            onKeyDown={tileKeyDown(slots.filter(Boolean).length + (videoUrl ? 1 : 0))}
            role="button"
            tabIndex={0}
            aria-label={`Play ${displayName} close-up video`}
          >
            <video
              autoPlay muted loop playsInline src={closeupUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            />
          </div>
        )}
      </div>

      {activeItem && (
        <div
          className={styles.lightbox}
          onClick={zoomed ? undefined : close}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          {/* Zoomed pan container — rendered first so buttons sit above it in paint order */}
          {activeItem.type === 'image' && zoomed && activeItem.src !== modelSrc && (
            <div
              ref={zoomedContainerRef}
              className={styles.lightboxZoomed}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchEnd={onTouchEnd}
              onClick={e => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cldUrl(activeItem.src, 'f_auto,q_auto:best,w_3000')}
                alt={`${displayName} · view ${lightboxIndex! + 1}`}
                className={styles.lightboxZoomedImg}
                draggable={false}
              />
            </div>
          )}

          <button ref={closeBtnRef} className={styles.lightboxClose} onClick={close} aria-label="Close">✕</button>
          {hasPrev && (
            <button className={styles.lightboxPrev} onClick={e => { e.stopPropagation(); prev() }} aria-label="Previous">‹</button>
          )}
          {hasNext && (
            <button className={styles.lightboxNext} onClick={e => { e.stopPropagation(); next() }} aria-label="Next">›</button>
          )}

          {/* Fit view (image) or video */}
          {activeItem.type === 'video' ? (
            <div className={styles.lightboxImgWrap} onClick={e => e.stopPropagation()}>
              <video
                autoPlay loop playsInline controls src={activeItem.src}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          ) : activeItem.src === modelSrc ? (
            // Model image: fit only, no zoom, default cursor, no touch zoom
            <div className={styles.lightboxImgWrap} onClick={e => e.stopPropagation()}>
              <Image
                src={cldUrl(activeItem.src, 'f_auto,q_auto:best,w_3000')}
                alt={`${displayName} · view ${lightboxIndex! + 1}`}
                fill
                unoptimized
                sizes="100vw"
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : !zoomed ? (
            <div
              className={`${styles.lightboxImgWrap} ${styles.lightboxImgFit}`}
              onClick={e => { e.stopPropagation(); setZoomed(true) }}
            >
              <Image
                src={cldUrl(activeItem.src, 'f_auto,q_auto:best,w_3000')}
                alt={`${displayName} · view ${lightboxIndex! + 1}`}
                fill
                unoptimized
                sizes="100vw"
                style={{ objectFit: 'contain' }}
              />
            </div>
          ) : null}

          {lightboxPos && !zoomed && (
            <p className={styles.lightboxCounter}>{lightboxPos}</p>
          )}
        </div>
      )}
    </>
  )
}
