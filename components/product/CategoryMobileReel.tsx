'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Product } from '@/types/products'
import styles from './CategoryMobileReel.module.css'

interface Props {
  products: Product[]
  category: string
}

/** A product is renderable in the reel only if it has a hero video OR a hero
 *  image. Video takes precedence; image-hero pieces render as <img>. Anything
 *  with neither is skipped entirely (no blank slide). */
function mediaFor(p: Product): { kind: 'video' | 'image'; url: string } | null {
  if (p.specs.heroVideoUrl) return { kind: 'video', url: p.specs.heroVideoUrl }
  if (p.specs.heroPosterUrl) return { kind: 'image', url: p.specs.heroPosterUrl }
  return null
}

export default function CategoryMobileReel({ products, category }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  // Slugs whose media 404s / fails to decode at runtime — dropped from the reel.
  const [failed, setFailed] = useState<Set<string>>(new Set())
  const markFailed = (slug: string) =>
    setFailed((prev) => (prev.has(slug) ? prev : new Set(prev).add(slug)))

  // Only pieces with usable, not-yet-failed media get a slide.
  const slides = products
    .map((p) => ({ p, media: mediaFor(p) }))
    .filter((s): s is { p: Product; media: { kind: 'video' | 'image'; url: string } } =>
      s.media !== null && !failed.has(s.p.slug),
    )

  // Re-attach observers whenever the rendered slide set changes (e.g. a failed
  // piece is dropped) so lazy src/play still fires on the survivors.
  const renderKey = slides.map((s) => s.p.slug).join('|')

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Ensure src is set, then play. Video is visible from the start; play()
    // drives buffering. A failed load bubbles to the <video> onError handler.
    const activate = (video: HTMLVideoElement) => {
      if (!video.src && video.dataset.src) {
        video.src = video.dataset.src
        video.load()
      }
      video.play().catch(() => {})
    }

    // Kick the first video slide immediately (if the first slide is a video).
    const firstVideo = container.querySelector<HTMLVideoElement>('video')
    if (firstVideo) activate(firstVideo)

    // Preload: buffer video slides one viewport before they're needed.
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

    // Play/pause video slides when they settle on screen. Image slides have no
    // <video>, so querySelector returns null and they're skipped harmlessly.
    const playIO = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target.querySelector<HTMLVideoElement>('video')
          if (!video) continue
          if (entry.isIntersecting) activate(video)
          else video.pause()
        }
      },
      { root: container, threshold: 0.85 },
    )

    const slideEls = container.querySelectorAll<HTMLElement>('[data-slide]')
    slideEls.forEach((s) => {
      preloadIO.observe(s)
      playIO.observe(s)
    })

    return () => {
      preloadIO.disconnect()
      playIO.disconnect()
    }
  }, [renderKey])

  if (slides.length === 0) return null

  return (
    <div ref={containerRef} className={styles.reel}>
      {slides.map(({ p, media }, i) => {
        const isFirst = i === 0

        return (
          <div key={p.slug} className={styles.slide} data-slide="">
            {media.kind === 'video' ? (
              <video
                src={isFirst ? media.url : undefined}
                data-src={isFirst ? undefined : media.url}
                muted loop playsInline
                preload={isFirst ? 'auto' : 'none'}
                className={styles.video}
                onError={() => markFailed(p.slug)}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.url}
                alt={p.name}
                loading={isFirst ? 'eager' : 'lazy'}
                className={styles.video}
                onError={() => markFailed(p.slug)}
              />
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
