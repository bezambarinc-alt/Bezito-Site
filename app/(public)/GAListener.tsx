'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

// Fires GA4 page_view + FB PageView on every client-side navigation.
// The initial page load is already tracked by gtag('config', ..., {send_page_view:true})
// and fbq('track','PageView') in layout.tsx — this component skips the first render
// to avoid double-counting, then fires on every subsequent route change.
export default function GAListener() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isFirst = useRef(true)

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false
      return
    }
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '')
    const w = window as Window & { gtag?: (...args: unknown[]) => void; fbq?: (...args: unknown[]) => void }
    w.gtag?.('event', 'page_view', { page_path: url })
    w.fbq?.('track', 'PageView')
  }, [pathname, searchParams])

  return null
}
