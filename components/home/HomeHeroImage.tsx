import styles from './HomeHeroImage.module.css'

interface HomeHeroImageProps {
  imageUrl: string
  height: number
  eyebrow?: string
  title: string
  body?: string
  sub?: string
  textPosition?: 'center' | 'right-upper'
}

export default function HomeHeroImage({
  imageUrl,
  height,
  eyebrow,
  title,
  body,
  sub,
  textPosition = 'center',
}: HomeHeroImageProps) {
  const overlayClass = [
    styles.overlay,
    textPosition === 'right-upper' ? styles.overlayRight : '',
  ].filter(Boolean).join(' ')

  return (
    <section className={`${styles.hero} ${styles[`hero--h${height}`] ?? ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" className={styles.heroImg} loading="lazy" />
      <div className={overlayClass}>
        <div className={styles.textBlock}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 className={styles.title}>{title}</h2>
          {body && <p className={styles.body}>{body}</p>}
          {sub && <p className={styles.sub}>{sub}</p>}
        </div>
      </div>
    </section>
  )
}
