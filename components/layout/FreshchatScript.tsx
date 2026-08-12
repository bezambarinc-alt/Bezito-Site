'use client'

/**
 * FreshchatScript — loads the Freshchat web widget silently.
 *
 * The default floating launcher is hidden immediately after init —
 * we use the ConciergeDrawer's "Atelier Chat" row as the entry point instead.
 * Clicking that row calls window.fcWidget.open() directly.
 */

import { useEffect } from 'react'

const FRESHCHAT_TOKEN = '9d4aca9f-0c50-4500-9962-f8f437f537e0'
const FRESHCHAT_HOST  = 'https://bezambar-d3c42a2a96dc65517737052.freshchat.com'

declare global {
  interface Window {
    fcWidget?: {
      init: (cfg: Record<string, unknown>) => void
      open: () => void
      close: () => void
      hide: () => void
      show: () => void
      isOpen: () => boolean
      isLoaded: () => boolean
    }
  }
}

export default function FreshchatScript() {
  useEffect(() => {
    const SCRIPT_ID = 'Freshchat-js-sdk'
    if (document.getElementById(SCRIPT_ID)) return // already loaded

    const initWidget = () => {
      window.fcWidget?.init({
        token: FRESHCHAT_TOKEN,
        host: FRESHCHAT_HOST,
        config: {
          headerProperty: {
            backgroundColor: '#1a1a1a',
            foregroundColor: '#ffffff',
            fontName: 'Open Sans',
          },
          // Hide the launcher bubble — we surface chat via our own drawer
          launcher: { open: false },
        },
      })
      // Belt-and-suspenders: also call hide() once loaded
      window.fcWidget?.hide()
    }

    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.async = true
    script.src = `${FRESHCHAT_HOST}/js/widget.js`
    script.onload = initWidget
    document.head.appendChild(script)
  }, [])

  return null
}
