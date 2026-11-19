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

  // Carousel dots
  const carouselTrackRef = useRef<HTMLDivElement | null>(null)
  const [activeDot, setActiveDot] = useState(0)

  const openAt = useCallback((index: number, trigger: HTMLElement) => {
    triggerRef.current = trigger
    setLightboxIndex(index)
  }, [])

  const tileKeyDown = useCallback((index: number) => (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openAt(index, e.currentTarget)
    }
  }, [openAt])

  useEffect(() => {
    if (!isOpen) return
    closeBtnRef.current?.focus()
    return () => {
      triggerRef.current?.focus()
      triggerRef.current = null
    }
  }, [isOpen])

  // Media array — same order as before so lightbox indices stay stable
  const validSlots = slots.filter(Boolean)
  const media: MediaItem[] = [
    ...validSlots.map(src => ({ type: 'image' as const, src })),
    ...(videoUrl ? [{ type: 'video' as const, src: videoUrl }] : []),
    ...(closeupUrl ? [{ type: 'video' as const, src: closeupUrl }] : []),
  ]

  const videoLightboxIdx = validSlots.length
  const closeupLightboxIdx = validSlots.length + (videoUrl ? 1 : 0)
  const modelSlotIndex = modelSrc ? slots.indexOf(modelSrc) : -1

  const close = useCallback(() => { setZoomed(false); setLightboxIndex(null) }, [])
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
      if (e.key === 'Escape') { if (zoomed) setZoomed(false); else close() }
      if (!zoomed && e.key === 'ArrowLeft') prev()
      if (!zoomed && e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [lightboxIndex, zoomed, close, prev, next])

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

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!zoomedContainerRef.current) return
    dragRef.current = { active: true, moved: false, startX: e.clientX, startY: e.clientY, scrollLeft: zoomedContainerRef.current.scrollLeft, scrollTop: zoomedContainerRef.current.scrollTop }
  }, [])
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const d = dragRef.current
    if (!d.active || !zoomedContainerRef.current) return
    const dx = e.clientX - d.startX; const dy = e.clientY - d.startY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
    zoomedContainerRef.current.scrollLeft = d.scrollLeft - dx
    zoomedContainerRef.current.scrollTop = d.scrollTop - dy
  }, [])
  const onMouseUp = useCallback(() => {
    if (!dragRef.current.active) return
    const wasMoved = dragRef.current.moved
    dragRef.current.active = false; dragRef.current.moved = false
    if (!wasMoved) setZoomed(false)
  }, [])
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const now = Date.now()
    if (now - lastTapRef.current < 280) { e.preventDefault(); setZoomed(z => !z) }
    lastTapRef.current = now
  }, [])

  // Carousel scroll → update active dot
  const handleCarouselScroll = useCallback(() => {
    const track = carouselTrackRef.current
    if (!track || !track.children.length) return
    const itemWidth = track.scrollWidth / track.children.length
    setActiveDot(Math.min(track.children.length - 1, Math.round(track.scrollLeft / itemWidth)))
  }, [])

  const scrollToCarouselItem = useCallback((idx: number) => {
    const track = carouselTrackRef.current
    if (!track || !track.children.length) return
    const itemWidth = track.scrollWidth / track.children.length
    track.scrollTo({ left: idx * itemWidth, behavior: 'smooth' })
  }, [])

  // ── Gallery structure ──────────────────────────────────────────────────────
  // Desktop: all items in 2-col grid, ordered by --gallery-order CSS variable
  // Mobile: hero → [specCol via CSS order] → model → carousel (see pdp.module.css)

  // Hero is: video > iJewel > first slot image
  const heroIsVideo = !!videoUrl
  const heroIsIJewelItem = !videoUrl && heroIsIJewel && !!ijewelUrl
  const heroIsFirstSlot = !videoUrl && !heroIsIJewel && !!slots[0]

  // Desktop grid order for each piece (preserves current desktop layout)
  const heroDesktopOrder = heroIsVideo ? validSlots.length : heroIsIJewel ? -1 : 0
  const carouselSlots = slots
    .map((src, i) => ({ src, i }))
    .filter(({ src, i }) => {
      if (!src) return false
      if (heroIsFirstSlot && i === 0) return false   // first slot is hero
      if (i === modelSlotIndex) return false          // model shown separately
      return true
    })
  const carouselCount = carouselSlots.length + (closeupUrl ? 1 : 0)

  return (
    <>
      <div className={styles.galleryCol}>

        {/* ── HERO ── */}
        <div
          className={`${styles.galleryItem} ${styles.galleryHero}${heroIsFirstSlot ? ` ${styles.galleryItemClickable}` : ''}${heroIsVideo ? ` ${styles.galleryItemClickable}` : ''}`}
          style={{ '--gallery-order': heroDesktopOrder } as React.CSSProperties}
          onClick={heroIsVideo ? e => openAt(videoLightboxIdx, e.currentTarget) : heroIsFirstSlot ? e => openAt(0, e.currentTarget) : undefined}
          onKeyDown={heroIsVideo ? tileKeyDown(videoLightboxIdx) : heroIsFirstSlot ? tileKeyDown(0) : undefined}
          role={heroIsVideo || heroIsFirstSlot ? 'button' : undefined}
          tabIndex={heroIsVideo || heroIsFirstSlot ? 0 : undefined}
          aria-label={heroIsVideo ? `Play ${displayName} turntable video` : heroIsFirstSlot ? `View ${displayName} · view 1` : undefined}
        >
          {heroIsVideo && (
            <video autoPlay muted loop playsInline src={videoUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
          )}
          {heroIsIJewelItem && <IJewelViewer src={ijewelUrl!} title={displayName} />}
          {heroIsFirstSlot && slots[0] && (
            <Image
              src={cldUrl(slots[0], 'f_auto,q_auto:best,w_1500')}
              alt={`${displayName} · view 1`}
              fill unoptimized priority
              sizes="(max-width: 860px) 100vw, 27.5vw"
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
            />
          )}
        </div>

        {/* ── MODEL IMAGE ── */}
        {modelSlotIndex >= 0 && slots[modelSlotIndex] && (
          <div
            className={`${styles.galleryItem} ${styles.galleryModelItem} ${styles.galleryItemClickable}`}
            style={{ '--gallery-order': modelSlotIndex } as React.CSSProperties}
            onClick={e => openAt(modelSlotIndex, e.currentTarget)}
            onKeyDown={tileKeyDown(modelSlotIndex)}
            role="button"
            tabIndex={0}
            aria-label={`View ${displayName} on model`}
          >
            <Image
              src={cldUrl(slots[modelSlotIndex], 'f_auto,q_auto:best,w_1500')}
              alt={`${displayName} · model`}
              fill unoptimized
              sizes="(max-width: 860px) 100vw, 27.5vw"
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
            />
          </div>
        )}

        {/* ── CAROUSEL: remaining images + closeup ── */}
        {carouselCount > 0 && (
          <div className={styles.galleryCarousel}>
            <div className={styles.galleryCarouselTrack} ref={carouselTrackRef} onScroll={handleCarouselScroll}>
              {carouselSlots.map(({ src, i }) => (
                <div
                  key={i}
                  className={`${styles.galleryItem} ${styles.galleryCarouselItem} ${styles.galleryItemClickable}`}
                  style={{ '--gallery-order': i } as React.CSSProperties}
                  onClick={e => openAt(i, e.currentTarget)}
                  onKeyDown={tileKeyDown(i)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${displayName} · view ${i + 1}`}
                >
                  <Image
                    src={cldUrl(src, 'f_auto,q_auto:best,w_1500')}
                    alt={`${displayName} · view ${i + 1}`}
                    fill unoptimized
                    sizes="(max-width: 860px) 100vw, 27.5vw"
                    style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  />
                </div>
              ))}
              {closeupUrl && (
                <div
                  className={`${styles.galleryItem} ${styles.galleryCarouselItem} ${styles.galleryItemClickable}`}
                  style={{ '--gallery-order': closeupLightboxIdx } as React.CSSProperties}
                  onClick={e => openAt(closeupLightboxIdx, e.currentTarget)}
                  onKeyDown={tileKeyDown(closeupLightboxIdx)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Play ${displayName} close-up video`}
                >
                  <video autoPlay muted loop playsInline src={closeupUrl}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
                </div>
              )}
            </div>
            {carouselCount > 1 && (
              <div className={styles.galleryDots}>
                {Array.from({ length: carouselCount }, (_, i) => (
                  <button
                    key={i}
                    className={`${styles.galleryDot}${activeDot === i ? ` ${styles.galleryDotActive}` : ''}`}
                    onClick={() => scrollToCarouselItem(i)}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── LIGHTBOX ─────────────────────────────────────────────────────────── */}
      {activeItem && (
        <div
          className={styles.lightbox}
          onClick={zoomed ? undefined : close}
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
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

          {activeItem.type === 'video' ? (
            <div className={styles.lightboxImgWrap} onClick={e => e.stopPropagation()}>
              <video autoPlay loop playsInline controls src={activeItem.src}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
          ) : activeItem.src === modelSrc ? (
            <div className={styles.lightboxImgWrap} onClick={e => e.stopPropagation()}>
              <Image
                src={cldUrl(activeItem.src, 'f_auto,q_auto:best,w_3000')}
                alt={`${displayName} · view ${lightboxIndex! + 1}`}
                fill unoptimized sizes="100vw"
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
                fill unoptimized sizes="100vw"
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
