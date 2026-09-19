import type { Metadata } from 'next'
import Image from 'next/image'
import PageCta from '@/components/common/PageCta'
import AtelierBanner from '@/components/common/AtelierBanner'
import TimelineNav from './TimelineNav'
import { ChapterReveal, AnimateChild } from './ChapterReveal'
import { STATS } from '@/lib/data/about-content'
import { ABOUT_CHAPTERS, ABOUT_YEARS } from '@/lib/data/about-timeline'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: { absolute: 'About Bez Ambar — Artist, Designer & Inventor of the Princess Cut' },
  description:
    'About Bez Ambar: Israeli-American diamond artist, designer, and inventor of the Princess cut. Three patented cuts. One atelier in Los Angeles, since 1979.',
  openGraph: {
    title: 'About Bez Ambar',
    description: 'Inventor of the Princess Cut. Four decades of chiseling light from a Los Angeles atelier.',
  },
}

export default function AboutPage() {
  return (
    <main>

      {/* ── Portrait hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroImg}>
          <Image
            src="https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_1600/v1785629661/Diamond_Design_Hero_eoykbn.avif"
            alt="Bez Ambar — inventor of the Princess Cut, Los Angeles atelier"
            fill
            priority
            sizes="100vw"
            className={styles.heroPhoto}
          />
        </div>
        <div className={styles.heroOverlay}>
          <p className={styles.heroEyebrow}>The Inventor</p>
          <h1 className={styles.heroTitle}>Bez Ambar</h1>
          <p className={styles.heroLede}>
            He cuts the diamond. Then he designs the piece around it. For forty-five
            years, those two acts have been inseparable — the artist and the craftsman
            working from the same hands.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <div className={styles.statsWrap}>
        <div className={styles.stats}>
          {STATS.map((s) => (
            <div key={s.number} className={styles.stat}>
              <div className={styles.statNumber}>{s.number}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Prose intro ── */}
      <div className={styles.intro}>
        <div className={styles.introInner}>
          <h2 className={styles.introHeading}>One Atelier. One Discipline.</h2>
          <div className={styles.introText}>
            <p>Most jewelry houses source pre-cut diamonds. Some cut their own — using other people&apos;s geometries. Bez Ambar designs the facets themselves, executes every cut in-house, and shapes each stone to fit its exact position in the piece.</p>
            <p>That discipline began in 1979, when Bez arrived in Los Angeles as a cutter. It hasn&apos;t changed. Every diamond that leaves this atelier has been evaluated, cut, and set by the same team that designed the geometry it was cut to.</p>
            <p>The Princess cut, the Blaze®, the Divine Cut® — three patented diamond geometries invented at 611 Wilshire. Each one a different answer to the same question: how does light move inside a stone, and how do you make it move better?</p>
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <section className={styles.timeline}>
        <div className={styles.timelineHeader}>
          <p className={styles.timelineEyebrow}>Four Decades</p>
          <h2 className={styles.timelineTitle}>The History</h2>
          <p className={styles.timelineIntro}>
            A line from Los Angeles, 1979, to the present. Not a legacy — an ongoing practice.
          </p>
        </div>

        <div className={styles.timelineOuter} id="about-timeline">
          {/* Sticky year nav — client component */}
          <TimelineNav years={ABOUT_YEARS} />

          {/* Chapters — server-rendered for SEO */}
          <div className={styles.chapters}>
            {ABOUT_CHAPTERS.map((ch) => {
              const chapterClass = [
                styles.chapter,
                styles[`layout_${ch.layout}`],
                ch.reverse ? styles.reverse : '',
              ].filter(Boolean).join(' ')

              return (
                <ChapterReveal
                  key={ch.year}
                  id={`year-${ch.year}`}
                  data-year={ch.year}
                  className={chapterClass}
                >
                  {/* horz: year left, text right */}
                  {ch.layout === 'horz' && (
                    <div className={styles.inner}>
                      <AnimateChild><div className={styles.ynum}>{ch.year}</div></AnimateChild>
                      <div>
                        <AnimateChild><h3 className={styles.headline}>{ch.headline}</h3></AnimateChild>
                        <AnimateChild><div className={styles.body}><p>{ch.body}</p></div></AnimateChild>
                        {ch.pullquote && (
                          <AnimateChild>
                            <blockquote className={styles.pullquote}>{ch.pullquote}</blockquote>
                          </AnimateChild>
                        )}
                      </div>
                    </div>
                  )}

                  {/* split: text + media side-by-side */}
                  {ch.layout === 'split' && (
                    <>
                      <AnimateChild><div className={styles.ynum}>{ch.year}</div></AnimateChild>
                      <div className={styles.inner}>
                        <div>
                          <AnimateChild><h3 className={styles.headline}>{ch.headline}</h3></AnimateChild>
                          <AnimateChild><div className={styles.body}><p>{ch.body}</p></div></AnimateChild>
                          {ch.pullquote && (
                            <AnimateChild>
                              <blockquote className={styles.pullquote}>{ch.pullquote}</blockquote>
                            </AnimateChild>
                          )}
                        </div>
                        <AnimateChild>
                          <figure className={styles.media}>
                            {ch.video ? (
                              <video
                                src={ch.video.src}
                                poster={ch.video.poster}
                                autoPlay muted loop playsInline preload="none"
                              />
                            ) : ch.img ? (
                              <Image
                                src={ch.img.src}
                                alt={ch.img.alt}
                                width={600}
                                height={400}
                                loading="lazy"
                                className={styles.chapterImg}
                              />
                            ) : null}
                          </figure>
                        </AnimateChild>
                      </div>
                    </>
                  )}

                  {/* normal: stacked */}
                  {ch.layout === 'normal' && (
                    <>
                      <AnimateChild><div className={styles.ynum}>{ch.year}</div></AnimateChild>
                      <AnimateChild><h3 className={styles.headline}>{ch.headline}</h3></AnimateChild>
                      <AnimateChild><div className={styles.body}><p>{ch.body}</p></div></AnimateChild>
                      {ch.pullquote && (
                        <AnimateChild>
                          <blockquote className={styles.pullquote}>{ch.pullquote}</blockquote>
                        </AnimateChild>
                      )}
                      {(ch.img || ch.video) && (
                        <AnimateChild>
                          <figure className={`${styles.media} ${styles.mediaBelow}`}>
                            {ch.video ? (
                              <video
                                src={ch.video.src}
                                poster={ch.video.poster}
                                autoPlay muted loop playsInline preload="none"
                              />
                            ) : ch.img ? (
                              <Image
                                src={ch.img.src}
                                alt={ch.img.alt}
                                width={600}
                                height={400}
                                loading="lazy"
                                className={styles.chapterImg}
                              />
                            ) : null}
                          </figure>
                        </AnimateChild>
                      )}
                    </>
                  )}
                </ChapterReveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <PageCta
        eyebrow="Private Consultation"
        title="Meet Bez in Los Angeles"
        body="Every commission begins with a conversation. Bez is present at every meeting. Arrange a private viewing at 611 Wilshire Blvd."
        drawer
        intent="In Person Appointment"
        ctaLabel="Arrange a Visit"
      />

      <AtelierBanner />
    </main>
  )
}
