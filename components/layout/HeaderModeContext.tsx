'use client'

/**
 * HeaderModeContext — the Header's transparent-vs-visible mode, decided in ONE
 * place (the layout, by route) instead of per-page markers.
 *
 * Model (locked 2026-08-08): nearly every hero on the site is a DARK hero, so:
 *   - DEFAULT = 'transparent'  (white header over dark hero — the common case)
 *   - EXCEPTIONS = 'light'     (ink header, for the few NON-hero white pages)
 *
 * The exception routes live in ONE list: VISIBLE_HEADER_ROUTES below. A single
 * <HeaderRouteMode/> in the layout reads the pathname and sets the mode. No page
 * ever tags itself — add a route here and it's done.
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

// 'transparent' = white header over a dark hero (DEFAULT — most pages)
// 'light'       = ink header, visible on a white/non-hero background
export type HeaderMode = 'transparent' | 'light'

/**
 * The ONLY place header mode is configured. Any route whose pathname starts with
 * one of these prefixes gets the ink ('light') header. Everything else is
 * transparent by default (dark-hero pages just work — zero per-page code).
 */
export const VISIBLE_HEADER_ROUTES: string[] = [
  '/blog',
  '/contact',
  '/privacy-policy',
  '/terms',
  '/warranty',
  '/retailers',
  '/ring-size-chart',
  '/legal',
]

export function modeForPath(pathname: string | null): HeaderMode {
  if (!pathname) return 'transparent'
  return VISIBLE_HEADER_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + '/'),
  )
    ? 'light'
    : 'transparent'
}

interface HeaderModeValue {
  mode: HeaderMode
  setMode: (m: HeaderMode) => void
}

const HeaderModeContext = createContext<HeaderModeValue | null>(null)

export function HeaderModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<HeaderMode>('transparent')
  const value = useMemo(() => ({ mode, setMode }), [mode])
  return <HeaderModeContext.Provider value={value}>{children}</HeaderModeContext.Provider>
}

/** Read the current header mode (used by the Header). */
export function useHeaderModeState(): HeaderMode {
  return useContext(HeaderModeContext)?.mode ?? 'transparent'
}

/**
 * HeaderRouteMode — mount ONCE in the layout. Sets header mode from the current
 * route via the single VISIBLE_HEADER_ROUTES list. This replaces all per-page
 * markers. Renders nothing.
 */
export function HeaderRouteMode() {
  const pathname = usePathname()
  const ctx = useContext(HeaderModeContext)
  useEffect(() => {
    ctx?.setMode(modeForPath(pathname))
  }, [ctx, pathname])
  return null
}
