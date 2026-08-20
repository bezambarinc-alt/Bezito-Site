'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/products'
import styles from './CategoryMobileReel.module.css'

interface Props {
  products: Product[]
  category: string
}

export default function CategoryMobileReel({ products, category }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // ── Ensure src is set, then play. No poster/opacity gate anymore — the
    //    video is visible from the start; play() drives buffering. ──
    const activate = (video: HTMLVideoElement) => {
      if (!video.src && video.dataset.src) {
        video.src = video.dataset.src
        video.load()
      }
      video.play().catch(() => {})
    }

    // ── Kick the first slide immediately — it's already in the DOM with src set ──
    const firstVideo = container.querySelector<HTMLVideoElement>('video')
    if (firstVideo) activate(firstVideo)

    // ── Preload: buffer slides one full viewport before they're needed ─────────
    const preloadIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const video = entry.target.querySelector<HTMLVideoElement>('video[data-src]')
          if (video && !video.src) {
            video.src = video.dataset.src!
            video.load()
          }
        }
      },
      { root: container, rootMargin: '100% 0px', threshold: 0 },
    )

    // ── Play/pause: engage only when slide is fully settled on screen ──────────
    const playIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target.querySelector<HTMLVideoElement>('video')
          if (!video) continue

          if (entry.isIntersecting) {
            activate(video)
          } else {
            video.pause()
          }
        }
      },
      { root: container, threshold: 0.85 },
    )

    const slides = container.querySelectorAll<HTMLElement>('[data-slide]')
    slides.forEach((s) => {
      preloadIO.observe(s)
      playIO.observe(s)
    })

    return () => {
      preloadIO.disconnect()
      playIO.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className={styles.reel}>
      {products.map((p, i) => {
        const videoSrc = p.specs.heroVideoUrl
        const isFirst  = i === 0

        return (
          <div key={p.slug} className={styles.slide} data-slide="">
            {/* Video only — no poster layer. First slide loads eagerly; the rest
                are lazily attached via data-src by the preload/play observers. */}
            {videoSrc ? (
              <video
                src={isFirst ? videoSrc : undefined}
                data-src={isFirst ? undefined : videoSrc}
                muted loop playsInline
                preload={isFirst ? 'auto' : 'none'}
                className={styles.video}
              />
            ) : (
              <div className={styles.placeholder} />
            )}

            <div className={styles.gradient} aria-hidden />
            <div className={styles.overlay}>
              <span className={styles.eyebrow}>ref. {p.sku}</span>
              <h2 className={styles.name}>{p.name}</h2>
              {p.specs.subtitle && <p className={styles.sub}>{p.specs.subtitle}</p>}
              <Link href={`/jewelry/${category}/${p.slug}`} className={styles.link}>
                View piece
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
