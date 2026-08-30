import Image from 'next/image'
import styles from './HomeSegment.module.css'
import ConciergeCtaButton from './ConciergeCtaButton'
import LazyVideo from '@/components/common/LazyVideo'
import FadeIn from '@/components/common/FadeIn'

export interface HomeSegmentProps {
  id?: string             // maps to section id= (scroll anchors like #segment-foundation)
  eyebrow: string
  title: string
  body: string
  imageUrl?: string
  videoUrl?: string
  posterUrl?: string
  reverse?: boolean
  insetSquare?: boolean   // Astro: .segment__media--inset-square — 1:1 ratio with inner padding
  ctaLabel?: string
  ctaHref?: string
  openConcierge?: boolean // opens Concierge drawer
  noMedia?: boolean       // centered text-only segment (no media column)
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
  insetSquare = false,
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

  const mediaClass = [
    styles.media,
    insetSquare ? styles.insetSquare : '',
  ].filter(Boolean).join(' ')

  return (
    <section id={id} className={`${styles.segment} ${reverse ? styles.reverse : ''}`}>
      <div className={mediaClass}>
        {videoUrl ? (
          <LazyVideo src={videoUrl} poster={posterUrl} className={styles.video} />
        ) : imageUrl ? (
          // imageWrap is the positioned parent for Next.js Image fill
          <div className={styles.imageWrap}>
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="50vw"
              className={styles.segmentImg}
            />
          </div>
        ) : null}
      </div>
      <div className={styles.text}><FadeIn delay={0.15}>{textBlock}</FadeIn></div>
    </section>
  )
}
