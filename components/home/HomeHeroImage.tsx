import Image from 'next/image'
import styles from './HomeHeroImage.module.css'

interface HomeHeroImageProps {
  imageUrl: string
  height: number
  eyebrow?: string
  title: string
  sub?: string
  priority?: boolean
}

/**
 * Full-bleed editorial image with text overlay.
 * Matches Astro .hero-image (home.css):
 *   - eyebrow: var(--paper) = #faf7f2 (cream, not pure white)
 *   - title:   #ffffff (pure white)
 *   - sub:     var(--accent-warm) = #c9b896 (warm gold)
 */
export default function HomeHeroImage({
  imageUrl,
  height,
  eyebrow,
  title,
  sub,
  priority = false,
}: HomeHeroImageProps) {
  return (
    <section
      className={styles.hero}
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
        <h2 className={styles.title}>{title}</h2>
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>
    </section>
  )
}
