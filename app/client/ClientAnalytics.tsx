'use client'

/**
 * ClientAnalytics — GA4 tracking for client pages (app/client/*).
 *
 * Client pages live OUTSIDE the (public) route group, so they do NOT inherit
 * the GA4 tag from (public)/layout.tsx. Before this component, client pages had
 * Clarity (from root layout) but NO GA4 at all — zero sessions/events reached
 * property G-92GPTNTY00. See the #tasks investigation (2026-11-01).
 *
 * This loads the same GA4 property used site-wide and emits client-scoped
 * events. There is no user-facing branding exposed by analytics (event names
 * and the measurement ID live in code only), and client pages remain
 * noindex/nofollow + brand-stripped visually — so routing this data to the main
 * property is safe (confirmed by Bez/Kevin).
 *
 * Every event carries `client_slug` so client pages can be filtered as a
 * segment in GA4 without polluting main-site page reports.
 */

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const GA4_ID = 'G-92GPTNTY00'

type Gtag = (...args: unknown[]) => void

function gtag(...args: unknown[]) {
  const w = window as Window & { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push(args)
}

export default function ClientAnalytics() {
  const pathname = usePathname()
  // Client routes are /client/<slug>; derive slug from the path so the layout
  // (which has no access to the page's route params) can mount this directly.
  const slug = (pathname || '').replace(/^\/client\//, '').split('/')[0] || 'unknown'
  const firedScroll = useRef<Set<number>>(new Set())
  const didInit = useRef(false)

  // GA4 init + initial page_view (slug-tagged). Runs once per mount.
  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    const w = window as Window & { gtag?: Gtag }
    gtag('js', new Date())
    // Disable automatic page_view so we can send one tagged with client_slug.
    gtag('config', GA4_ID, { send_page_view: false, client_slug: slug })
    gtag('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      client_slug: slug,
      page_group: 'client',
    })
    // Expose gtag for downstream if some block ever wants it.
    w.gtag = w.gtag || (gtag as Gtag)
  }, [pathname, slug])

  // Scroll-depth milestones: 25 / 50 / 75 / 100 %.
  useEffect(() => {
    const thresholds = [25, 50, 75, 100]
    function onScroll() {
      const doc = document.documentElement
      const scrollable = doc.scrollHeight - doc.clientHeight
      if (scrollable <= 0) return
      const pct = Math.round((doc.scrollTop / scrollable) * 100)
      for (const t of thresholds) {
        if (pct >= t && !firedScroll.current.has(t)) {
          firedScroll.current.add(t)
          gtag('event', 'scroll_depth', {
            percent_scrolled: t,
            client_slug: slug,
            page_group: 'client',
          })
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [slug])

  // Delegated interaction tracking — no edits to shared block components.
  //  - inquiry_click: the InquireCta button + any ProdPill inquiry link
  //  - video_play:    first play of any hero/content video
  //  - outbound_click: clicks on links leaving the page
  useEffect(() => {
    const playedVideos = new WeakSet<HTMLVideoElement>()

    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement)?.closest('a, button')
      if (!el) return

      // Inquiry: the CTA <button> (InquireCta) or inquiry anchors.
      const text = (el.textContent || '').trim().toLowerCase()
      if (el.tagName === 'BUTTON' && /inquire|private viewing|appointment/.test(text)) {
        gtag('event', 'inquiry_click', { client_slug: slug, label: text.slice(0, 60), page_group: 'client' })
        return
      }

      if (el.tagName === 'A') {
        const href = el.getAttribute('href') || ''
        if (/contact|inquire|mailto:/.test(href)) {
          gtag('event', 'inquiry_click', { client_slug: slug, link_url: href.slice(0, 120), page_group: 'client' })
        } else if (/^https?:\/\//.test(href) && !href.includes(window.location.host)) {
          gtag('event', 'outbound_click', { client_slug: slug, link_url: href.slice(0, 120), page_group: 'client' })
        }
      }
    }

    function onPlay(e: Event) {
      const v = e.target as HTMLVideoElement
      if (!(v instanceof HTMLVideoElement) || playedVideos.has(v)) return
      playedVideos.add(v)
      gtag('event', 'video_play', {
        client_slug: slug,
        video_src: (v.currentSrc || v.src || '').split('/').pop()?.slice(0, 80) || '',
        page_group: 'client',
      })
    }

    document.addEventListener('click', onClick, true)
    // `play` doesn't bubble — capture phase catches it from any video.
    document.addEventListener('play', onPlay, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('play', onPlay, true)
    }
  }, [slug])

  return (
    <Script
      id="ga4-client"
      strategy="afterInteractive"
      src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
    />
  )
}
