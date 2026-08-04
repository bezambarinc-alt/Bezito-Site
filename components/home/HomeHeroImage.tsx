import Image from 'next/image'
import styles from './HomeHeroImage.module.css'

interface HomeHeroImageProps {
  imageUrl: string
  height: number
  eyebrow?: string
  title: string
  sub?: string
  textDark?: boolean
  priority?: boolean
}

export default function HomeHeroImage({
  imageUrl,
  height,
  eyebrow,
  title,
  sub,
  textDark = false,
  priority = false,
}: HomeHeroImageProps) {
  const color = textDark ? '#1a1a1a' : 'var(--ba-white)'

  return (
    <section className={styles.hero} style={{ height: `${height}px` }}>
      <Image
        src={imageUrl}
        alt={title}
        fill
        priority={priority}
        sizes="100vw"
        style={{ objectFit: 'cover' }}
      />
      <div className={styles.overlay}>
        {eyebrow ? (
          <p className={styles.eyebrow} style={{ color }}>
            {eyebrow}
          </p>
        ) : null}
        <h1 className={styles.title} style={{ color }}>
          {title}
        </h1>
        {sub ? (
          <p className={styles.sub} style={{ color }}>
            {sub}
          </p>
        ) : null}
      </div>
    </section>
  )
}
