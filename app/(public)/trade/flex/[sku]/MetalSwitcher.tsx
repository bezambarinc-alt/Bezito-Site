'use client'

import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { cldUrl } from '@/lib/cloudinary'
import styles from './pdp.module.css'

export interface MetalOption {
  key: string    // 'platinum' | 'rose_gold' | 'yellow_gold'
  label: string  // 'Platinum' | 'Rose Gold' | 'Yellow Gold'
  images: { front?: string; model?: string; top?: string; angled?: string; video?: string; closeup?: string }
}

/** Resolve the active metal from ?metal= — falls back to the first metal if absent/unknown. */
export function useSelectedMetal(metals: MetalOption[]): MetalOption | undefined {
  const searchParams = useSearchParams()
  const param = searchParams?.get('metal')
  return metals.find(m => m.key === param) ?? metals[0]
}

/** Client-rendered "Metal" spec value — follows ?metal= without a server round-trip. */
export function SelectedMetalValue({ metals }: { metals: MetalOption[] }) {
  return <>{useSelectedMetal(metals)?.label ?? null}</>
}

interface Props {
  metals: MetalOption[]
  slug: string   // product URL slug — used to build the ?metal= URL
}

export default function MetalSwitcher({ metals, slug }: Props) {
  const selectedKey = useSelectedMetal(metals)?.key

  if (metals.length <= 1) return null

  function handleClick(key: string) {
    // Shallow URL update: Next.js syncs native history.replaceState with
    // useSearchParams, so the gallery/spec re-render client-side with no
    // server request (router.replace would refetch the RSC payload).
    window.history.replaceState(null, '', `/trade/flex/${slug}?metal=${encodeURIComponent(key)}`)
  }

  return (
    <div className={styles.metalSection}>
      <p className={styles.metalLabel}>
        Metal: <span>{metals.find(m => m.key === selectedKey)?.label}</span>
      </p>
      <div className={styles.metalRow}>
        {metals.map(m => (
          <button
            key={m.key}
            type="button"
            aria-label={m.label}
            aria-pressed={m.key === selectedKey}
            className={`${styles.metalTile} ${m.key === selectedKey ? styles.metalTileActive : ''}`}
            onClick={() => handleClick(m.key)}
          >
            {m.images.front && (
              <Image
                src={cldUrl(m.images.front, 'c_crop,w_0.35,h_0.35,g_center/c_fill,w_160,h_160,f_auto,q_auto:best')}
                alt={m.label}
                fill
                unoptimized
                sizes="80px"
                style={{ objectFit: 'cover' }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
