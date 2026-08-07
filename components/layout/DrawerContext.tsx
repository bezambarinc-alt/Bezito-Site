'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

/**
 * Global drawer/overlay state. Any component can open panels without prop drilling.
 * Provider wraps {children} in app/layout.tsx.
 *
 * Panels: inquiry | concierge | search | menu | archive
 */

// ── Inquiry drawer ────────────────────────────────────────────────────────────

export interface InquiryPrefill {
  title?: string
  sku?: string
  intent?: string
  fromConcierge?: boolean
}

// ── Archive drawer ────────────────────────────────────────────────────────────

export interface ArchivePrefill {
  title: string
  sku: string
  mp4Url: string
}

// ── Context shape ─────────────────────────────────────────────────────────────

type ActivePanel = 'inquiry' | 'concierge' | 'search' | 'menu' | 'archive' | null

interface DrawerContextValue {
  active: ActivePanel
  inquiryPrefill: InquiryPrefill
  archivePrefill: ArchivePrefill
  openInquiryDrawer:  (prefill?: InquiryPrefill) => void
  openArchiveDrawer:  (entry: ArchivePrefill) => void
  openConcierge: () => void
  openSearch:    () => void
  openMenu:      () => void
  close:         () => void
}

const EMPTY_ARCHIVE: ArchivePrefill = { title: '', sku: '', mp4Url: '' }

const DrawerContext = createContext<DrawerContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive]               = useState<ActivePanel>(null)
  const [inquiryPrefill, setInquiryPrefill] = useState<InquiryPrefill>({})
  const [archivePrefill, setArchivePrefill] = useState<ArchivePrefill>(EMPTY_ARCHIVE)

  const openInquiryDrawer = useCallback((prefill: InquiryPrefill = {}) => {
    setInquiryPrefill(prefill)
    setActive('inquiry')
  }, [])

  const openArchiveDrawer = useCallback((entry: ArchivePrefill) => {
    setArchivePrefill(entry)
    setActive('archive')
  }, [])

  const openConcierge = useCallback(() => setActive('concierge'), [])
  const openSearch    = useCallback(() => setActive('search'),    [])
  const openMenu      = useCallback(() => setActive('menu'),      [])
  const close         = useCallback(() => setActive(null),        [])

  const value = useMemo<DrawerContextValue>(
    () => ({
      active,
      inquiryPrefill,
      archivePrefill,
      openInquiryDrawer,
      openArchiveDrawer,
      openConcierge,
      openSearch,
      openMenu,
      close,
    }),
    [active, inquiryPrefill, archivePrefill, openInquiryDrawer, openArchiveDrawer, openConcierge, openSearch, openMenu, close],
  )

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDrawers(): DrawerContextValue {
  const ctx = useContext(DrawerContext)
  if (!ctx) throw new Error('useDrawers must be used within a <DrawerProvider>')
  return ctx
}
