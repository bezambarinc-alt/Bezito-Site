'use client'

/**
 * ArchiveModal — center-screen modal matching Astro `.am-panel`:
 *   left 60%  = autoplay MP4 of the piece in motion
 *   right 40% = "Inquiring about <piece>" + 2-field inquiry form
 *
 * Deep-linking: open state is driven by the `?id=<slug>` URL param (owned by
 * ArchiveClient). This component is presentational — it receives the resolved
 * entry + an onClose callback. ESC / backdrop click call onClose, which clears
 * the URL param.
 */

import { useEffect, useRef, useState } from 'react'
import type { ArchiveEntry } from '@/lib/data/archive-constants'
import styles from './ArchiveModal.module.css'

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

interface Props {
  entry: ArchiveEntry | null
  onClose: () => void
}

export default function ArchiveModal({ entry, onClose }: Props) {
  const open = entry !== null
  const videoRef = useRef<HTMLVideoElement>(null)
  const nameRef  = useRef<HTMLInputElement>(null)

  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errMsg, setErrMsg] = useState('')

  // Autoplay video on open; pause + clear on close
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    if (open && entry?.mp4Url) {
      vid.src = entry.mp4Url
      vid.load()
      vid.play().catch(() => {})
    } else {
      vid.pause()
      vid.removeAttribute('src')
      vid.load()
    }
  }, [open, entry?.mp4Url])

  // Reset form + focus name when opening a new piece; lock body scroll
  useEffect(() => {
    if (!open) return
    setName(''); setEmail(''); setStatus('idle'); setErrMsg('')
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => nameRef.current?.focus(), 60)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = ''
    }
  }, [open, entry?.slug])

  // ESC to close
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !entry) return
    setStatus('sending')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          intent: 'archive-inquiry',
          // SKU goes to the dedicated leads.sku column. page_slug is the archive
          // piece's own slug (not a page FK), left for reference only.
          sku: entry.sku || null,
          page_slug: entry.slug,
          message: `Archive inquiry — ${entry.title}`,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setStatus('error')
      setErrMsg('Something went wrong. Please email us at bez@bezambar.com.')
    }
  }

  if (!open || !entry) return null

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Piece detail">
      <div className={styles.backdrop} onClick={onClose} aria-hidden />
      <div className={styles.panel}>
        <button className={styles.close} onClick={onClose} aria-label="Close">✕</button>

        {/* Left — video */}
        <div className={styles.videoCol}>
          <video ref={videoRef} className={styles.video} muted loop playsInline preload="none" />
        </div>

        {/* Right — form */}
        <div className={styles.formCol}>
          {status === 'success' ? (
            <div className={styles.success}>
              <div className={styles.successMark} aria-hidden>✦</div>
              <h3>Your inquiry has been received.</h3>
              <p>A member of our team will be in touch within one business day.</p>
            </div>
          ) : (
            <>
              <p className={styles.eyebrow}>Inquiring about</p>
              {/* Title only — matches Astro (amPieceTitle = title). SKU is NOT
                  appended here: the seeded title often already embeds the
                  C-number/SKU, which caused a doubled ref (e.g. "… C-1234 · C-1234").
                  The SKU still travels in the lead payload below. */}
              <p className={styles.pieceTitle}>{entry.title}</p>
              <h2 className={styles.heading}>Connect with the Atelier</h2>
              <p className={styles.subhead}>We respond personally within one business day.</p>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="am-name">Your Name</label>
                  <input
                    ref={nameRef}
                    id="am-name"
                    className={styles.input}
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="First and Last"
                    required
                    autoComplete="name"
                    disabled={status === 'sending'}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="am-email">Email Address</label>
                  <input
                    id="am-email"
                    className={styles.input}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    autoComplete="email"
                    disabled={status === 'sending'}
                  />
                </div>

                <p className={styles.privacy}>Your enquiry is private and handled directly by Bez&apos;s team.</p>

                {status === 'error' && <p className={styles.err} role="alert">{errMsg}</p>}

                <button className={styles.submit} type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Send Inquiry'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
