'use client'

/**
 * ArchiveDrawer — right-slide panel triggered when a GIF card is clicked.
 * Top: autoplay MP4 of the piece in motion.
 * Bottom: piece title + Ref + lightweight 2-field inquiry form.
 *
 * Follows the same scrim + slide-in pattern as InquiryDrawer.
 */

import { useEffect, useRef, useState } from 'react'
import { useDrawers } from '@/components/layout/DrawerContext'
import styles from './ArchiveDrawer.module.css'

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

export default function ArchiveDrawer() {
  const { active, close, archivePrefill } = useDrawers()
  const open = active === 'archive'

  const videoRef = useRef<HTMLVideoElement>(null)
  const [name, setName]     = useState('')
  const [email, setEmail]   = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errMsg, setErrMsg] = useState('')

  // Autoplay video when drawer opens; pause + reset when closed
  useEffect(() => {
    const vid = videoRef.current
    if (!vid) return
    if (open && archivePrefill.mp4Url) {
      vid.src = archivePrefill.mp4Url
      vid.load()
      vid.play().catch(() => {})
    } else {
      vid.pause()
      vid.src = ''
    }
  }, [open, archivePrefill.mp4Url])

  // Reset form when drawer opens with a new piece
  useEffect(() => {
    if (open) {
      setName('')
      setEmail('')
      setStatus('idle')
      setErrMsg('')
    }
  }, [open, archivePrefill.sku])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email) return
    setStatus('sending')
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          intent: 'archive-inquiry',
          page_slug: archivePrefill.sku || 'archive',
          message: `Archive inquiry — ${archivePrefill.title}${archivePrefill.sku ? ` (${archivePrefill.sku})` : ''}`,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      setStatus('success')
    } catch {
      setStatus('error')
      setErrMsg('Something went wrong. Please email us at bez@bezambar.com.')
    }
  }

  return (
    <>
      {/* Backdrop scrim */}
      <div
        className={`${styles.scrim} ${open ? styles.scrimOpen : ''}`}
        onClick={close}
        aria-hidden
      />

      {/* Drawer panel */}
      <aside
        className={`${styles.drawer} ${open ? styles.open : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Piece inquiry"
        aria-hidden={!open}
      >
        {/* Close */}
        <button className={styles.close} onClick={close} aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Video */}
        <div className={styles.videoWrap}>
          {archivePrefill.mp4Url ? (
            <video
              ref={videoRef}
              className={styles.video}
              muted
              loop
              playsInline
              preload="none"
            />
          ) : (
            <div className={styles.videoPlaceholder} aria-hidden />
          )}
        </div>

        {/* Piece identity */}
        <div className={styles.body}>
          <p className={styles.eyebrow}>In Motion</p>
          <h2 className={styles.title}>{archivePrefill.title || 'Bez Ambar'}</h2>
          {archivePrefill.sku && (
            <p className={styles.ref}>Ref. {archivePrefill.sku}</p>
          )}

          <hr className={styles.rule} />

          {status === 'success' ? (
            <div className={styles.success}>
              <p>You&apos;re on our list. We&apos;ll be in touch within one business day.</p>
              <button className={styles.submit} onClick={close}>Close</button>
            </div>
          ) : (
            <>
              <p className={styles.formHeading}>Begin a Conversation</p>
              <p className={styles.formSub}>Tell us you&apos;re interested. We&apos;ll take it from there.</p>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <label className={styles.field}>
                  <span className={styles.label}>Your Name</span>
                  <input
                    className={styles.input}
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="First and Last"
                    required
                    autoComplete="name"
                    disabled={status === 'sending'}
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Email Address</span>
                  <input
                    className={styles.input}
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    autoComplete="email"
                    disabled={status === 'sending'}
                  />
                </label>

                {status === 'error' && (
                  <p className={styles.err} role="alert">{errMsg}</p>
                )}

                <button
                  className={styles.submit}
                  type="submit"
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending…' : 'Request a Private Viewing'}
                </button>
              </form>
            </>
          )}

          {/* Contact footer */}
          <div className={styles.contact}>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Tel</span>
              <a href="tel:2136299191" className={styles.contactValue}>(213) 629-9191</a>
            </div>
            <div className={styles.contactRow}>
              <span className={styles.contactLabel}>Atelier</span>
              <span className={styles.contactValue}>611 Wilshire Blvd · Los Angeles</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
