import type { Metadata } from 'next'
import Image from 'next/image'
import InquiryButton from '@/components/common/InquiryButton'
import AtelierBanner from '@/components/common/AtelierBanner'
import StoryNav from './StoryNav'
import { ChapterReveal, AnimateChild } from './ChapterReveal'
import { CHAPTERS, STORY_YEARS } from '@/lib/data/story-chapters'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'The Story — Bez Ambar',
  description:
    'The history of Bez Ambar: from Jerusalem to Los Angeles, from the Princess Cut to the Elysian Cut™. Four decades of independent diamond design.',
  openGraph: {
    title: 'The Story · Bez Ambar',
    description:
      'Four decades of independent diamond design — the Princess Cut, the Blaze®, and everything that followed.',
    images: [
      {
        url: 'https://res.cloudinary.com/dlg2mou53/image/upload/c_fill,w_1200,h_630,g_auto,f_auto,q_auto/v1782876014/Jewelry%20Images/Necklaces/single-row-lifestyle.jpg',
      },
    ],
  },
}

export default function TheStoryPage() {
  return (
    <main>

      {/* ── Hero ── */}
      <section className={styles.hero} aria-label="The Story hero">
        <Image
          src="https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_1600/v1782876014/Jewelry%20Images/Necklaces/single-row-lifestyle.jpg"
          alt=""
          role="presentation"
          fill
          priority
          sizes="100vw"
          className={styles.heroBg}
        />
        <div className={styles.heroText}>
          <ChapterReveal className={styles.heroInner}>
            <AnimateChild><p className={styles.heroEyebrow}>Bez Ambar · Est. 1979</p></AnimateChild>
            <AnimateChild><h1 className={styles.heroTitle}>The Story</h1></AnimateChild>
            <AnimateChild>
              <p className={styles.heroLede}>
                From Jerusalem to Los Angeles. From a single diamond to four decades of independent design.
              </p>
            </AnimateChild>
          </ChapterReveal>
        </div>
      </section>

      {/* ── Intro ── */}
      <section className={styles.intro}>
        <ChapterReveal>
          <AnimateChild>
            <p>
              Every Bez Ambar piece carries a lineage. Not a brand story — an actual history
              of invention: cuts that changed the market, settings that changed how diamonds
              behave in metal, techniques adopted by the industry and attributed to everyone
              except the man who developed them.
            </p>
          </AnimateChild>
          <AnimateChild>
            <p>This is that history, told in order.</p>
          </AnimateChild>
          <AnimateChild>
            <div className={styles.scrollHint} aria-hidden="true">
              <span>Scroll</span>
              <div className={styles.scrollLine} />
            </div>
          </AnimateChild>
        </ChapterReveal>
      </section>

      {/* ── Timeline ── */}
      <div className={styles.timelineOuter} id="story-timeline">

        {/* Sticky year nav — client component */}
        <StoryNav years={STORY_YEARS} />

        {/* Chapters — server-rendered for SEO */}
        <div className={styles.chapters}>
          {CHAPTERS.map((ch) => {
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
                      <AnimateChild><h2 className={styles.headline}>{ch.headline}</h2></AnimateChild>
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
                        <AnimateChild><h2 className={styles.headline}>{ch.headline}</h2></AnimateChild>
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
                    <AnimateChild><h2 className={styles.headline}>{ch.headline}</h2></AnimateChild>
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

      {/* ── Closing CTA ── */}
      <section className={styles.cta}>
        <ChapterReveal>
          <AnimateChild><h2 className={styles.ctaTitle}>Stay in the atelier.</h2></AnimateChild>
          <AnimateChild>
            <p className={styles.ctaBody}>
              New work, private previews, and first access to bespoke commissions —
              for those who want to know before the public does.
            </p>
          </AnimateChild>
          <AnimateChild>
            <InquiryButton className={styles.ctaLink} intent="Bespoke Commission">
              Inquire about a bespoke commission →
            </InquiryButton>
          </AnimateChild>
        </ChapterReveal>
      </section>

      <AtelierBanner />
    </main>
  )
}
