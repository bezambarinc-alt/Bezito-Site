'use client'

/**
 * HeaderModeContext — transparent (white) vs light (ink) header.
 *
 * Detection strategy (Kevin, 2026-08-11):
 *   Check the DOM after each navigation — if <main> contains an autoplay
 *   video, the page has a dark video hero → white header.
 *   Otherwise → ink header. No list, no per-page tagging. Zero config.
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

export type HeaderMode = 'transparent' | 'light'

interface HeaderModeValue {
  mode: HeaderMode
  setMode: (m: HeaderMode) => void
}

const HeaderModeContext = createContext<HeaderModeValue | null>(null)

export function HeaderModeProvider({ children }: { children: React.ReactNode }) {
  // Default 'light' (ink) — safe on any background, corrected by DOM check below
  const [mode, setMode] = useState<HeaderMode>('light')
  const value = useMemo(() => ({ mode, setMode }), [mode])
  return <HeaderModeContext.Provider value={value}>{children}</HeaderModeContext.Provider>
}

export function useHeaderModeState(): HeaderMode {
  return useContext(HeaderModeContext)?.mode ?? 'light'
}

/**
 * Mount once in the root layout. After every navigation, checks whether
 * <main> contains an autoplay video (portrait hero or HeroVideo block).
 * Sets header white for video pages, ink for everything else.
 * rAF ensures the check runs after the page has committed to the DOM.
 */
export function HeaderRouteMode() {
  const pathname = usePathname()
  const ctx = useContext(HeaderModeContext)

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const hasHeroVideo = !!document.querySelector('main video[autoplay]')
      ctx?.setMode(hasHeroVideo ? 'transparent' : 'light')
    })
    return () => cancelAnimationFrame(raf)
  }, [pathname, ctx])

  return null
}
