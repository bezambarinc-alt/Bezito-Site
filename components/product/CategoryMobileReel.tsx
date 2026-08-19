'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

    // ── Kick the first slide immediately — it's already in the DOM with src set ──
    const firstVideo = container.querySelector<HTMLVideoElement>('video')
    if (firstVideo) {
      const showFirst = () => firstVideo.classList.add(styles.videoPlaying)
      if (firstVideo.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        showFirst()
        firstVideo.play().catch(() => {})
      } else {
        firstVideo.addEventListener('canplay', () => {
          showFirst()
          firstVideo.play().catch(() => {})
        }, { once: true })
      }
    }

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
            // Ensure src is set (safety net if preloadIO missed it)
            if (!video.src && video.dataset.src) {
              video.src = video.dataset.src!
              video.load()
            }
            const play = () => {
              video.play().catch(() => {})
              video.classList.add(styles.videoPlaying)
            }
            if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
              play()
            } else {
              video.addEventListener('canplay', play, { once: true })
            }
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
        const poster   = p.specs.heroPosterUrl
        const isFirst  = i === 0

        return (
          <div key={p.slug} className={styles.slide} data-slide="">
            {/* Poster: always-visible background layer — eliminates black flash during video load.
                next/image handles hi-res srcset + fetchPriority for the first slide. */}
            {poster && (
              <Image
                src={poster}
                alt=""
                fill
                sizes="100vw"
                priority={isFirst}
                className={styles.poster}
              />
            )}

            {/* Video: starts invisible (opacity 0), fades in only on canplay */}
            {videoSrc ? (
              <video
                src={isFirst ? videoSrc : undefined}
                data-src={isFirst ? undefined : videoSrc}
                muted loop playsInline
                preload={isFirst ? 'metadata' : 'none'}
                className={styles.video}
              />
            ) : !poster ? (
              <div className={styles.placeholder} />
            ) : null}

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
