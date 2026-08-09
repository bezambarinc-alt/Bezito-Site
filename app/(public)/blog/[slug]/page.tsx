import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlogPost, getBlogCards } from '@/lib/data/blog'
import { blogCategoryLabel } from '@/lib/data/blog-constants'
import BlogBody from '@/components/blog/BlogBody'
import Reveal from '@/components/blog/Reveal'
import styles from './page.module.css'

export const dynamic = 'force-dynamic'

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return d
  }
}

/** Pull the FAQ JSON-LD pairs out of the body (**Q?** para → answer). */
function extractFaq(body: string): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = []
  const re = /\*\*([^*]+\?)\*\*\s*\n?([^\n][^]*?)(?=\n\s*\n|\n\*\*|$)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body))) {
    const q = m[1].trim()
    const a = m[2].replace(/\s+/g, ' ').trim()
    if (q && a) out.push({ q, a })
  }
  return out
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) return { title: 'Journal — Bez Ambar' }
  const ogImage = post.heroImage ?? undefined
  return {
    title: `${post.title} | Bez Ambar`,
    description: post.excerpt,
    alternates: { canonical: `https://bezambar.com/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: `${post.title} | Bez Ambar`,
      description: post.excerpt,
      url: `https://bezambar.com/blog/${post.slug}`,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  }
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPost(slug)
  if (!post) notFound()

  const faq = post.schemaFaq ? extractFaq(post.body) : []

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updatedDate ?? post.date,
    url: `https://bezambar.com/blog/${post.slug}`,
    author: { '@type': 'Person', name: post.author },
    publisher: { '@type': 'Organization', name: 'Bez Ambar' },
    image: post.heroImage ?? undefined,
  }
  const faqLd = faq.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null

  // Related: three other live posts, same category first.
  const cards = await getBlogCards()
  const related = [
    ...cards.filter((c) => c.slug !== post.slug && c.category === post.category),
    ...cards.filter((c) => c.slug !== post.slug && c.category !== post.category),
  ].slice(0, 3)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      <main className={styles.post} data-pagefind-body>
        <Reveal as="header" className={styles.hero}>
          <p className={styles.cat}>{blogCategoryLabel(post.category)}</p>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.meta}>
            {post.author} <span>&middot;</span> {fmtDate(post.date)}
          </p>
        </Reveal>

        {post.heroVideo ? (
          <Reveal className={`${styles.heroMedia} ${styles.heroVideo}`}>
            <video autoPlay muted loop playsInline poster={post.heroImage ?? undefined}>
              <source src={post.heroVideo} type="video/mp4" />
            </video>
          </Reveal>
        ) : post.heroImage ? (
          <Reveal className={styles.heroMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.heroImage} alt={post.heroImageAlt ?? post.title} />
          </Reveal>
        ) : null}

        <Reveal className={styles.content}>
          <BlogBody markdown={post.body} />
        </Reveal>

        <Reveal className={styles.cta}>
          <div className={styles.ctaBox}>
            <h3>Commission a Piece of Your Own</h3>
            <p>
              Every piece is designed and made in the Los Angeles atelier, from the
              first reading of the stone to the final pass of the setting wheel.
              Enquire to begin a commission.
            </p>
            <Link href="/contact">Enquire About a Commission</Link>
          </div>
        </Reveal>

        {related.length > 0 && (
          <section className={styles.related}>
            <h2>Related Articles</h2>
            <div className={styles.relatedGrid}>
              {related.map((c, i) => (
                <Reveal key={c.slug} delay={i * 90}>
                  <Link href={`/blog/${c.slug}`} className={styles.relatedCard}>
                    <div className={styles.relatedImg}>
                      {c.heroImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.heroImage}
                          alt={c.heroImageAlt ?? c.title}
                          loading="lazy"
                        />
                      )}
                    </div>
                    <h4>{c.title}</h4>
                    <p className={styles.relatedDate}>{fmtDate(c.date)}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
