import styles from './HomeHeroImage.module.css'

interface HomeHeroImageProps {
  imageUrl: string
  height: number
  eyebrow?: string
  title: string
  sub?: string
}

/**
 * Full-bleed editorial image with text overlay.
 * Uses CSS background-image so the section fills its block naturally —
 * same as ScrollWipeCarousel — avoiding Next.js Image fill constraints.
 */
export default function HomeHeroImage({
  imageUrl,
  height,
  eyebrow,
  title,
  sub,
}: HomeHeroImageProps) {
  return (
    <section
      className={styles.hero}
      style={{ height: `${height}px`, backgroundImage: `url('${imageUrl}')` }}
      aria-label={title}
    >
      <div className={styles.overlay}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2 className={styles.title}>{title}</h2>
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>
    </section>
  )
}
