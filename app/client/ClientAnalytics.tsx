'use client'

/**
 * ClientAnalytics — GA4 tracking for client pages (app/client/*).
 *
 * Client pages live OUTSIDE the (public) route group, so they do NOT inherit
 * the GA4 tag from (public)/layout.tsx. Before this component, client pages had
 * Clarity (from root layout) but NO GA4 at all — zero sessions/events reached
 * property G-92GPTNTY00. See the #tasks investigation (2026-11-01).
 *
 * Init pattern mirrors (public)/layout.tsx exactly — inline `afterInteractive`
 * scripts for the gtag.js loader + gtag('js')/config, so the dataLayer boot runs
 * with the library instead of from a React effect on a later tick. page_view is
 * fired by a separate per-navigation listener (same split as the site's
 * GAListener) so client→client SPA navigation is tracked too.
 *
 * No user-facing branding is exposed by analytics (event names + measurement ID
 * live in code only); client pages stay noindex + visually brand-stripped, so
 * routing this data to the main property is safe (confirmed by Bez/Kevin).
 *
 * NOTE: `client_slug` and `page_group` are sent as GA4 event params. To surface
 * them in reports they must be registered as custom dimensions in the GA4 UI
 * (Admin → Custom definitions). Until then the events still record, but the
 * params won't be filterable.
 */

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

const GA4_ID = 'G-92GPTNTY00'

function pushEvent(...args: unknown[]) {
  const w = window as Window & { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push(args)
}

function slugFromPath(pathname: string | null): string {
  return (pathname || '').replace(/^\/client\//, '').split('/')[0] || 'unknown'
}

export default function ClientAnalytics() {
  const pathname = usePathname()
  const slug = slugFromPath(pathname)
  const firedScroll = useRef<Set<number>>(new Set())
  const isFirstView = useRef(true)

  // page_view on initial load + every client-side navigation.
  // The inline init script below already called gtag('config') with
  // send_page_view:false, so EVERY page_view (including the first) is sent here,
  // tagged with client_slug. Reset scroll milestones on each navigation.
  useEffect(() => {
    // Skip the very first effect run only if the inline script hasn't defined
    // gtag yet is NOT a concern — we push straight to dataLayer, which gtag.js
    // replays on load. Fire on every pathname change.
    pushEvent('event', 'page_view', {
      page_path: pathname,
      page_location: typeof window !== 'undefined' ? window.location.href : undefined,
      page_title: typeof document !== 'undefined' ? document.title : undefined,
      client_slug: slug,
      page_group: 'client',
    })
    if (!isFirstView.current) {
      firedScroll.current = new Set()
    }
    isFirstView.current = false
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
          pushEvent('event', 'scroll_depth', {
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
  useEffect(() => {
    const playedVideos = new WeakSet<HTMLVideoElement>()

    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement)?.closest('a, button')
      if (!el) return

      const text = (el.textContent || '').trim().toLowerCase()
      if (el.tagName === 'BUTTON' && /inquire|private viewing|appointment/.test(text)) {
        pushEvent('event', 'inquiry_click', { client_slug: slug, label: text.slice(0, 60), page_group: 'client' })
        return
      }

      if (el.tagName === 'A') {
        const href = el.getAttribute('href') || ''
        if (/contact|inquire|mailto:/.test(href)) {
          pushEvent('event', 'inquiry_click', { client_slug: slug, link_url: href.slice(0, 120), page_group: 'client' })
        } else if (/^https?:\/\//.test(href) && !href.includes(window.location.host)) {
          pushEvent('event', 'outbound_click', { client_slug: slug, link_url: href.slice(0, 120), page_group: 'client' })
        }
      }
    }

    function onPlay(e: Event) {
      const v = e.target as HTMLVideoElement
      if (!(v instanceof HTMLVideoElement) || playedVideos.has(v)) return
      playedVideos.add(v)
      pushEvent('event', 'video_play', {
        client_slug: slug,
        video_src: (v.currentSrc || v.src || '').split('/').pop()?.slice(0, 80) || '',
        page_group: 'client',
      })
    }

    document.addEventListener('click', onClick, true)
    document.addEventListener('play', onPlay, true) // play doesn't bubble — capture
    return () => {
      document.removeEventListener('click', onClick, true)
      document.removeEventListener('play', onPlay, true)
    }
  }, [slug])

  return (
    <>
      {/* GA4 loader + init — mirrors (public)/layout.tsx. Respects Consent Mode
          v2 default set in root layout. send_page_view:false so the listener
          above owns every page_view (slug-tagged, SPA-aware). */}
      <Script
        id="ga4-client-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
      />
      <Script id="ga4-client-init" strategy="afterInteractive">{`
        window.dataLayer=window.dataLayer||[];
        function gtag(){dataLayer.push(arguments);}
        gtag('js',new Date());
        gtag('config','${GA4_ID}',{send_page_view:false});
      `}</Script>
    </>
  )
}
