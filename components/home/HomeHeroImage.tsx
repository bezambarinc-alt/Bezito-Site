import Image from 'next/image'
import styles from './HomeHeroImage.module.css'

interface HomeHeroImageProps {
  imageUrl: string
  height: number
  eyebrow?: string
  title: string
  sub?: string
  /** When true, all overlay text renders in ink (#1a1a1a) — for light editorial images like SHHH */
  textDark?: boolean
  priority?: boolean
}

/**
 * Full-bleed editorial image with text overlay.
 * Matches Astro .hero-image (home.css):
 *   - eyebrow: var(--paper) = #faf7f2 (cream, not pure white)
 *   - title:   #ffffff (pure white)
 *   - sub:     var(--accent-warm) = #c9b896 (warm gold)
 * textDark overrides all three to var(--ink) for light-bg images.
 */
export default function HomeHeroImage({
  imageUrl,
  height,
  eyebrow,
  title,
  sub,
  textDark = false,
  priority = false,
}: HomeHeroImageProps) {
  return (
    <section
      className={`${styles.hero} ${textDark ? styles.textDark : ''}`}
      style={{ height: `${height}px` }}
    >
      <Image
        src={imageUrl}
        alt={title}
        fill
        priority={priority}
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />
      <div className={styles.overlay}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{title}</h1>
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>
    </section>
  )
}
