'use client'

import { useDrawers } from '@/components/layout/DrawerContext'

interface Props {
  children: React.ReactNode
  intent?: string
  className?: string
}

/**
 * InquiryButton — client wrapper that opens the InquiryDrawer on click.
 * Use wherever a server component needs a drawer-trigger CTA (content pages,
 * closing CTAs, editorial links). Accepts any className so callers keep their
 * own styles without needing to become client components themselves.
 */
export default function InquiryButton({ children, intent = 'Private Consultation', className }: Props) {
  const { openInquiryDrawer } = useDrawers()
  return (
    <button
      type="button"
      className={className}
      onClick={() => openInquiryDrawer({ intent })}
    >
      {children}
    </button>
  )
}
