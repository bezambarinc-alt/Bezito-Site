import Image from 'next/image'
import styles from './HomeSegment.module.css'
import ConciergeCtaButton from './ConciergeCtaButton'

export interface HomeSegmentProps {
  eyebrow: string
  title: string
  body: string
  imageUrl?: string
  videoUrl?: string
  reverse?: boolean
  ctaLabel?: string
  ctaHref?: string
  openConcierge?: boolean // true for "Arrange a Private Consultation"
  noMedia?: boolean // true for "service" segment
}

export default function HomeSegment({
  eyebrow,
  title,
  body,
  imageUrl,
  videoUrl,
  reverse = false,
  ctaLabel,
  ctaHref,
  openConcierge = false,
  noMedia = false,
}: HomeSegmentProps) {
  const textBlock = (
    <>
      <p className="ba-eyebrow">{eyebrow}</p>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.body}>{body}</p>
      {openConcierge && ctaLabel ? (
        <ConciergeCtaButton label={ctaLabel} />
      ) : ctaHref && ctaLabel ? (
        <a href={ctaHref} className={styles.cta}>
          {ctaLabel} →
        </a>
      ) : null}
    </>
  )

  if (noMedia) {
    return (
      <section className={styles.noMedia}>
        <div className={styles.noMediaInner}>{textBlock}</div>
      </section>
    )
  }

  return (
    <section className={`${styles.segment} ${reverse ? styles.reverse : ''}`}>
      <div className={styles.media}>
        {videoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : imageUrl ? (
          <div className={styles.imageWrap}>
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="50vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ) : null}
      </div>
      <div className={styles.text}>{textBlock}</div>
    </section>
  )
}
