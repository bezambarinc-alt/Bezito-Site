'use client'

/**
 * HeaderModeContext — lets any PAGE declare how the shared Header should render,
 * instead of the Header sniffing routes with usePathname (brittle, couples the
 * shared component to specific paths).
 *
 * This is the Next.js-idiomatic equivalent of Astro's per-page prop:
 *   <Layout headerLight={true}>   ->   useHeaderMode('light')
 *
 * A page with a WHITE hero calls `useHeaderMode('light')` on mount; the Header
 * reads the mode from context. When the page unmounts we reset to 'default'
 * (transparent/white text for dark-hero pages) so navigation stays correct.
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type HeaderMode = 'default' | 'light'

interface HeaderModeValue {
  mode: HeaderMode
  setMode: (m: HeaderMode) => void
}

const HeaderModeContext = createContext<HeaderModeValue | null>(null)

export function HeaderModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<HeaderMode>('default')
  const value = useMemo(() => ({ mode, setMode }), [mode])
  return <HeaderModeContext.Provider value={value}>{children}</HeaderModeContext.Provider>
}

/** Read the current header mode (used by the Header). */
export function useHeaderModeState(): HeaderMode {
  return useContext(HeaderModeContext)?.mode ?? 'default'
}

/**
 * Declare the header mode for the current page. Call once at the top of a
 * client page/section. Resets to 'default' on unmount.
 *
 *   useHeaderMode('light')   // white-hero page — dark header
 */
export function useHeaderMode(mode: HeaderMode) {
  const ctx = useContext(HeaderModeContext)
  useEffect(() => {
    ctx?.setMode(mode)
    return () => ctx?.setMode('default')
  }, [ctx, mode])
}
