import styles from './HomeHeroImage.module.css'

interface HomeHeroImageProps {
  imageUrl: string
  height: number
  eyebrow?: string
  title: string
  sub?: string
}

export default function HomeHeroImage({
  imageUrl,
  height,
  eyebrow,
  title,
  sub,
}: HomeHeroImageProps) {
  return (
    <section className={styles.hero} style={{ height: `${height}px` }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="" className={styles.heroImg} loading="lazy" />
      <div className={styles.overlay}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h2 className={styles.title}>{title}</h2>
        {sub && <p className={styles.sub}>{sub}</p>}
      </div>
    </section>
  )
}
