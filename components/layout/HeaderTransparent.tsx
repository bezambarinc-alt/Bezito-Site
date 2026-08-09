'use client'

import { useHeaderMode } from './HeaderModeContext'

/**
 * HeaderTransparent — drop this client marker at the top of any page that has a
 * DARK hero at scrollY=0 (so the header should start transparent/white, then
 * turn solid on scroll). Server pages can render it directly.
 *
 *   export default function Page() {
 *     return (<><HeaderTransparent /> ...dark hero... </>)
 *   }
 *
 * Every other page needs nothing — the header defaults to 'light' (ink, visible
 * on white). This is the global guard against the invisible-header bug.
 */
export default function HeaderTransparent() {
  useHeaderMode('transparent')
  return null
}
