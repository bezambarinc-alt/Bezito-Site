'use client'

/**
 * ProductGallery — full-width image strip for product detail pages.
 * Matches Astro product template: horizontal scroll on mobile,
 * 2-up grid on desktop for still photography.
 */

import { useState } from 'react'
import Image from 'next/image'
import type { ProductMedia } from '@/types/products'
import styles from './ProductGallery.module.css'

interface Props {
  media: ProductMedia[]
  productName: string
}

export default function ProductGallery({ media, productName }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)

  // Only show image-type media (videos handled by HeroVideo above)
  const images = media.filter((m) => m.type !== 'video' && m.url)
  if (images.length === 0) return null

  const active = images[activeIdx]

  return (
    <div className={styles.gallery}>
      {/* Main image */}
      <div className={styles.main}>
        <div className={styles.mainFrame}>
          <Image
            src={active.url}
            alt={active.label ?? productName}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className={styles.mainImg}
            priority={activeIdx === 0}
          />
        </div>
      </div>

      {/* Thumbnails — only shown when 2+ images */}
      {images.length > 1 && (
        <div className={styles.thumbs} role="list" aria-label="Product views">
          {images.map((img, i) => (
            <button
              key={i}
              role="listitem"
              className={`${styles.thumb} ${i === activeIdx ? styles.thumbActive : ''}`}
              onClick={() => setActiveIdx(i)}
              aria-label={img.label ?? `View ${i + 1}`}
              aria-current={i === activeIdx}
            >
              <Image
                src={img.url}
                alt={img.label ?? `${productName} view ${i + 1}`}
                fill
                sizes="120px"
                className={styles.thumbImg}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
