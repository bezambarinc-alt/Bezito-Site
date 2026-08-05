'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/**
 * Global drawer/overlay state. Any component can call openInquiryDrawer(...) /
 * openConcierge() / openSearch() / openMenu() without prop drilling.
 * The provider wraps {children} in app/layout.tsx.
 */

export interface InquiryPrefill {
  title?: string
  sku?: string
  intent?: string
  fromConcierge?: boolean
}

type ActivePanel = 'inquiry' | 'concierge' | 'search' | 'menu' | null

interface DrawerContextValue {
  active: ActivePanel
  inquiryPrefill: InquiryPrefill
  openInquiryDrawer: (prefill?: InquiryPrefill) => void
  openConcierge: () => void
  openSearch: () => void
  openMenu: () => void
  close: () => void
}

const DrawerContext = createContext<DrawerContextValue | null>(null)

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<ActivePanel>(null)
  const [inquiryPrefill, setInquiryPrefill] = useState<InquiryPrefill>({})

  const openInquiryDrawer = useCallback((prefill: InquiryPrefill = {}) => {
    setInquiryPrefill(prefill)
    setActive('inquiry')
  }, [])
  const openConcierge = useCallback(() => setActive('concierge'), [])
  const openSearch = useCallback(() => setActive('search'), [])
  const openMenu = useCallback(() => setActive('menu'), [])
  const close = useCallback(() => setActive(null), [])

  const value = useMemo<DrawerContextValue>(
    () => ({ active, inquiryPrefill, openInquiryDrawer, openConcierge, openSearch, openMenu, close }),
    [active, inquiryPrefill, openInquiryDrawer, openConcierge, openSearch, openMenu, close],
  )

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
}

export function useDrawers(): DrawerContextValue {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('useDrawers must be used within a <DrawerProvider>')
  return ctx
}
