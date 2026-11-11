'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { cldUrl } from '@/lib/cloudinary'
import styles from './pdp.module.css'

export interface MetalOption {
  key: string    // 'platinum' | 'rose_gold' | 'yellow_gold'
  label: string  // 'Platinum' | 'Rose Gold' | 'Yellow Gold'
  images: { front?: string; model?: string; top?: string; angled?: string; video?: string; closeup?: string }
}

interface Props {
  metals: MetalOption[]
  slug: string   // product URL slug — used for router.replace
}

export default function MetalSwitcher({ metals, slug }: Props) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const selectedKey = searchParams?.get('metal') ?? metals[0]?.key

  if (metals.length <= 1) return null

  function handleClick(key: string) {
    router.replace(`/trade/flex/${slug}?metal=${key}`, { scroll: false })
  }

  return (
    <div className={styles.metalSection}>
      <p className={styles.metalLabel}>
        Metal: <span>{metals.find(m => m.key === selectedKey)?.label ?? metals[0]?.label}</span>
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
