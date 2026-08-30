import styles from './HomeSegment.module.css'
import ConciergeCtaButton from './ConciergeCtaButton'
import LazyVideo from '@/components/common/LazyVideo'
import FadeIn from '@/components/common/FadeIn'

export interface HomeSegmentProps {
  id?: string
  eyebrow: string
  title: string
  body: string
  imageUrl?: string
  videoUrl?: string
  posterUrl?: string
  reverse?: boolean
  ctaLabel?: string
  ctaHref?: string
  openConcierge?: boolean
  noMedia?: boolean
}

export default function HomeSegment({
  id,
  eyebrow,
  title,
  body,
  imageUrl,
  videoUrl,
  posterUrl,
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
      <section id={id} className={styles.noMedia}>
        <div className={styles.noMediaInner}><FadeIn>{textBlock}</FadeIn></div>
      </section>
    )
  }

  return (
    <section id={id} className={`${styles.segment} ${reverse ? styles.reverse : ''}`}>
      <div className={styles.media}>
        {videoUrl ? (
          <LazyVideo src={videoUrl} poster={posterUrl} className={styles.video} />
        ) : imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={title} className={styles.segmentImg} loading="lazy" />
        ) : null}
      </div>
      <div className={styles.text}><FadeIn delay={0.15}>{textBlock}</FadeIn></div>
    </section>
  )
}
