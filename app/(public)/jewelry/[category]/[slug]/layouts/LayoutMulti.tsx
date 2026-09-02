'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import AtelierBanner from '@/components/common/AtelierBanner'
import type { ProductLayoutProps } from './types'
import styles from './LayoutMulti.module.css'

/**
 * LayoutMulti — Multi-image / variation proposal template
 * Based on the saraydarian client presentation design.
 *
 * Use case: same piece shown in multiple metal options, angles, or variations.
 * Example: one ring presented in white gold, yellow gold, and rose gold.
 *
 * Layout:
 * 1. Sticky white header    — "Bez Ambar" wordmark
 * 2. Hero image             — full-width (up to 1200px), click to lightbox
 * 3. Piece identity         — eyebrow (subtitle) / display title / lede
 * 4. Image gallery          — 2-column grid of all available view images
 *                             (view1, view2, view3 + onHandPhoto if distinct from hero)
 *                             each image opens lightbox on click
 * 5. Spec table             — label / value rows, Inquiry row filtered
 * 6. Contact / Next Step    — dark warm bg, email + phone
 * 7. Footer                 — near-black, gold type
 * 8. Lightbox               — Esc or backdrop click to close
 *
 * Data mapping:
 *   product.name           → title
 *   product.specs.subtitle → eyebrow mark
 *   product.specs.lede     → editorial lede (italic, under title)
 *   heroPoster / onHandPhoto / views[0] → hero image (first non-null wins)
 *   views                  → gallery grid (up to 4 images with lightbox)
 *   specItems              → spec table rows
 */
export default function LayoutMulti({
  product,
  heroPoster,
  onHandPhoto,
  specItems,
  views,
}: ProductLayoutProps) {
  // Hero: first available image
  const heroImg = heroPoster ?? onHandPhoto ?? views.find(v => v.url)?.url ?? null

  // Gallery: all views with URLs. Optionally prepend onHandPhoto if distinct from hero.
  const galleryImages: { url: string; label: string }[] = []
  if (onHandPhoto && onHandPhoto !== heroImg) {
    galleryImages.push({ url: onHandPhoto, label: '' })
  }
  for (const v of views) {
    if (v.url) galleryImages.push({ url: v.url, label: v.label })
  }

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const { name: title, specs: s } = product
  const eyebrow   = s.subtitle ?? undefined
  const lede      = s.lede     ?? undefined

  // Esc closes lightbox
  useEffect(() => {
    if (!lightboxSrc) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxSrc(null) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [lightboxSrc])

  return (
    <div className={styles.root}>

      {/* ── 1. Header ── */}
      <header className={styles.header}>
        <span className={styles.logo}>Bez Ambar</span>
      </header>

      {/* ── 2. Hero image ── */}
      <div
        className={styles.heroMedia}
        onClick={() => heroImg && setLightboxSrc(heroImg)}
        role={heroImg ? 'button' : undefined}
        aria-label={heroImg ? `View ${title} full size` : undefined}
      >
        {heroImg && (
          <Image
            src={heroImg}
            alt={title}
            width={1400}
            height={1000}
            style={{ width: '100%', height: 'auto' }}
            priority
            className={styles.heroImg}
          />
        )}
      </div>

      {/* ── 3. Piece identity ── */}
      <div className={styles.identity}>
        {eyebrow && <p className={styles.mark}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {lede && <p className={styles.lede}>{lede}</p>}
      </div>

      {/* ── 4. Image gallery ── */}
      {galleryImages.length > 0 && (
        <section className={styles.gallery}>
          <div className={styles.galleryWrap}>
            {galleryImages.map((img, i) => (
              <div
                key={i}
                className={styles.galleryItem}
                onClick={() => setLightboxSrc(img.url)}
                role="button"
                aria-label={img.label ? `View ${img.label}` : `View image ${i + 1}`}
              >
                <Image
                  src={img.url}
                  alt={img.label || `${title} — variation ${i + 1}`}
                  width={1200}
                  height={900}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ width: '100%', height: 'auto' }}
                  className={styles.galleryImg}
                />
                {img.label && <p className={styles.galleryLabel}>{img.label}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. Spec table ── */}
      {specItems.length > 0 && (
        <section className={styles.specs}>
          <div className={styles.wrapNarrow}>
            <p className={styles.eyebrow}>Specifications</p>
            <h2 className={styles.specsHeading}>The Piece</h2>
            <table className={styles.specTable}>
              <tbody>
                {specItems
                  .filter(item => item.label !== 'Inquiry')
                  .map((item, i) => (
                    <tr key={i} className={styles.specRow}>
                      <th className={styles.specLabel}>{item.label}</th>
                      <td className={styles.specValue}>{item.body}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── 6. Contact ── */}
      <section className={styles.contact}>
        <div className={styles.wrapNarrow}>
          <p className={styles.eyebrow}>Next Step</p>
          <h2 className={styles.contactHeading}>A Conversation</h2>
          <p className={styles.contactBody}>
            Each variation shown can be refined further — stone size, finger size, metal finish,
            and final specifications are all adjustable. We&rsquo;d be glad to discuss.
          </p>
          <p className={styles.contactLine}>
            Bez Ambar&nbsp;&middot;&nbsp;
            <a href="mailto:bezambar@bezambar.com">bezambar@bezambar.com</a>
            &nbsp;&middot;&nbsp;
            <a href="tel:2136299191">(213) 629-9191</a>
          </p>
        </div>
      </section>

      {/* ── 7. Atelier banner ── */}
      <AtelierBanner />

      {/* ── 8. Lightbox ── */}
      {lightboxSrc && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal
          aria-label="Image lightbox"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            className={styles.lightboxClose}
            aria-label="Close"
            onClick={e => { e.stopPropagation(); setLightboxSrc(null) }}
          >
            ×
          </button>
          <div className={styles.lightboxStage} onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxSrc} alt={title} className={styles.lightboxImg} />
          </div>
        </div>
      )}

    </div>
  )
}
