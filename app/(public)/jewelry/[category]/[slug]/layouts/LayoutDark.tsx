'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import type { ProductLayoutProps } from './types'
import styles from './LayoutDark.module.css'

/**
 * LayoutDark — Dark editorial proposal template
 * Faithfully recreates the saul-ring client presentation design.
 *
 * 1. Sticky white header  — "Bez Ambar" wordmark
 * 2. Hero image           — centered, up to 1080px, click to open lightbox
 * 3. Piece identity       — eyebrow (subtitle) / h1 title
 * 4. Story section        — editorial copy split by double newlines;
 *                           first paragraph renders as large italic lede
 * 5. Spec table           — label / value rows (no accordion)
 * 6. Contact block        — warm dark bg, "A Conversation" CTA
 * 7. Footer               — near-black, gold type
 * 8. Lightbox             — Esc or backdrop click to close
 *
 * Data mapping:
 *   product.name           → title
 *   product.specs.subtitle → eyebrow mark
 *   product.specs.lede     → editorial copy (double-newline separated paragraphs)
 *   specItems              → spec table rows (Inquiry row is filtered out)
 *   heroPoster / onHandPhoto / views[0] → hero image (first non-null wins)
 */
export default function LayoutDark({
  product,
  heroPoster,
  onHandPhoto,
  specItems,
  views,
}: ProductLayoutProps) {
  const heroImg = heroPoster ?? onHandPhoto ?? views.find(v => v.url)?.url ?? null
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const { name: title, specs: s } = product
  const eyebrow   = s.subtitle ?? undefined
  const editorial = s.lede     ?? undefined

  // Split editorial text on double newlines so multi-paragraph copy renders correctly.
  // If the string contains no double newlines it's treated as one block.
  const paragraphs = editorial
    ? editorial.split(/\n\n+/).filter(Boolean)
    : []

  // Esc closes the lightbox
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
      <div className={styles.heroContent}>
        {eyebrow && <p className={styles.mark}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
      </div>

      {/* ── 4. Story / editorial copy ── */}
      {paragraphs.length > 0 && (
        <section className={styles.story}>
          <div className={styles.wrapNarrow}>
            <p className={styles.eyebrow}>The Design</p>
            {paragraphs.map((para, i) =>
              i === 0 ? (
                <p key={i} className={styles.editorialLede}>{para}</p>
              ) : (
                <p key={i} className={styles.editorialBody}>{para}</p>
              )
            )}
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
                  // The generic "Inquiry" row is copy-only and doesn't belong in a spec table
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

      {/* ── 6. Contact / Next Step ── */}
      <section className={styles.contact}>
        <div className={styles.wrapNarrow}>
          <p className={styles.eyebrow}>Next Step</p>
          <h2 className={styles.contactHeading}>A Conversation</h2>
          <p className={styles.contactBody}>
            This is a concept rendering — every dimension, stone size, and specification
            can be adjusted to fit the piece. We&rsquo;d be glad to discuss.
          </p>
          <p className={styles.contactLine}>
            Bez Ambar&nbsp;&middot;&nbsp;
            <a href="mailto:bezambar@bezambar.com">bezambar@bezambar.com</a>
            &nbsp;&middot;&nbsp;
            <a href="tel:2136299191">(213) 629-9191</a>
          </p>
        </div>
      </section>

      {/* ── 7. Footer ── */}
      <footer className={styles.footer}>
        <span className={styles.footerLogo}>Bez Ambar</span>
        <span>611 Wilshire Blvd · Los Angeles, CA 90017</span>
        <span>
          <a href="mailto:bezambar@bezambar.com">bezambar@bezambar.com</a>
          &nbsp;&middot;&nbsp;
          <a href="tel:2136299191">(213) 629-9191</a>
        </span>
        <span className={styles.footerTag}>Inventor of the Princess Cut · Since 1979</span>
      </footer>

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
          {/* stopPropagation on stage so clicking the image doesn't close */}
          <div className={styles.lightboxStage} onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxSrc} alt={title} className={styles.lightboxImg} />
          </div>
        </div>
      )}

    </div>
  )
}
