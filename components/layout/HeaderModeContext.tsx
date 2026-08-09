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

// 'light'  = ink header, visible on white backgrounds (the SAFE default)
// 'transparent' = white header, for dark-hero pages that opt in
export type HeaderMode = 'light' | 'transparent'

interface HeaderModeValue {
  mode: HeaderMode
  setMode: (m: HeaderMode) => void
}

const HeaderModeContext = createContext<HeaderModeValue | null>(null)

export function HeaderModeProvider({ children }: { children: React.ReactNode }) {
  // SAFE DEFAULT: 'light' (ink header) so every page is visible on white unless
  // it explicitly opts into 'transparent'. Prevents the invisible-header bug
  // globally — pages can no longer be broken by omission.
  const [mode, setMode] = useState<HeaderMode>('light')
  const value = useMemo(() => ({ mode, setMode }), [mode])
  return <HeaderModeContext.Provider value={value}>{children}</HeaderModeContext.Provider>
}

/** Read the current header mode (used by the Header). */
export function useHeaderModeState(): HeaderMode {
  return useContext(HeaderModeContext)?.mode ?? 'light'
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
    return () => ctx?.setMode('light') // reset to the safe default on unmount
  }, [ctx, mode])
}
