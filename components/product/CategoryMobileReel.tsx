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
    const videos = containerRef.current?.querySelectorAll<HTMLVideoElement>('video[data-src]')
    if (!videos?.length) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) {
            if (!video.src) {
              video.src = video.dataset.src ?? ''
              video.load()
            }
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        }
      },
      { threshold: 0.5 },
    )

    videos.forEach((v) => io.observe(v))
    return () => io.disconnect()
  }, [])

  return (
    <div ref={containerRef} className={styles.reel}>
      {products.map((p) => {
        const video  = p.specs.heroVideoUrl
        const poster = p.specs.heroPosterUrl
        return (
          <div key={p.slug} className={styles.slide}>
            {video ? (
              <video
                data-src={video}
                poster={poster ?? undefined}
                muted loop playsInline preload="none"
                className={styles.video}
              />
            ) : poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt={p.name} className={styles.video} />
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
