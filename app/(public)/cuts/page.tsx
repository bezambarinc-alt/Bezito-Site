import type { Metadata } from 'next'
import Image from 'next/image'
import PageCta from '@/components/common/PageCta'
import AtelierBanner from '@/components/common/AtelierBanner'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'The Cuts — Bez Ambar',
  description:
    'Three patented diamond cuts invented at the Bez Ambar atelier: the Quadrillion® (Princess), the Blaze®, and the Divine Cut®.',
}

const CUTS = [
  {
    id: 'quadrillion',
    eyebrow: '1982 · Patented · DeBeers Award',
    name: 'Quadrillion® — The Princess Cut',
    body: 'A square brilliant with chevron facets that direct light inward and back up through the table. The trade adopted it immediately. The world eventually called it the Princess cut — Bez\'s cut, under a different name. It became the most popular diamond shape on Earth. The man who invented it kept working.',
    imageUrl: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1775786208/Jewelry%20Images/Stones/Quadrillion_owciyv.jpg',
    imageAlt: 'Quadrillion® Princess Cut diamond by Bez Ambar',
    reverse: false,
  },
  {
    id: 'blaze',
    eyebrow: 'Patented · Registered Trademark',
    name: 'Blaze®',
    body: 'Thirteen precisely aligned facets produce a starburst of light visible to the naked eye under white light. This effect is specific to the Blaze® geometry — it cannot be replicated by any other arrangement of facets. No other house in the world produces it. The starburst is not a coincidence of polish. It is the result.',
    imageUrl: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1775786208/Jewelry%20Images/Stones/Quadrillion_owciyv.jpg',
    imageAlt: 'Blaze® diamond cut by Bez Ambar — starburst facet pattern',
    reverse: true,
  },
  {
    id: 'divine',
    eyebrow: 'Patented · Registered Trademark',
    name: 'Divine Cut®',
    body: 'A round brilliant engineered for a specific quality of dispersion. Forty years of cutting practice, distilled into a geometry that takes the round diamond further than any standardized round could go. Continuing the atelier\'s lifetime study of how light moves inside a cut stone.',
    imageUrl: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1775786208/Jewelry%20Images/Stones/Quadrillion_owciyv.jpg',
    imageAlt: 'Divine Cut® diamond by Bez Ambar',
    reverse: false,
  },
]

export default function CutsPage() {
  return (
    <main>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Bez Ambar</p>
        <h1 className={styles.heroTitle}>The Cuts</h1>
        <p className={styles.heroLede}>
          Three patented diamond geometries invented at the Los Angeles atelier.
          Each one a different answer to the same question: how does light move
          inside a cut stone?
        </p>
      </section>

      {/* ── Cut segments ── */}
      {CUTS.map((cut) => (
        <section
          key={cut.id}
          id={`cut-${cut.id}`}
          className={`${styles.segment} ${cut.reverse ? styles.reverse : ''}`}
        >
          <div className={styles.media}>
            <Image
              src={cut.imageUrl}
              alt={cut.imageAlt}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              className={styles.cutImg}
            />
          </div>
          <div className={styles.content}>
            <p className={styles.cutEyebrow}>{cut.eyebrow}</p>
            <h2 className={styles.cutName}>{cut.name}</h2>
            <p className={styles.cutBody}>{cut.body}</p>
          </div>
        </section>
      ))}

      <PageCta
        eyebrow="Experience the Cuts"
        title="See Them in Person"
        body="The difference between a Bez Ambar cut and any other becomes clear under direct light. Arrange a private viewing at the Los Angeles atelier."
        drawer
        intent="A Piece from the Collection"
        ctaLabel="Arrange a Consultation"
      />

      <AtelierBanner />
    </main>
  )
}
