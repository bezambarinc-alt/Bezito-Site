'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { cldUrl } from '@/lib/cloudinary'
import s from './page.module.css'

export interface FlexCardData {
  id: string
  sku: string
  slug?: string
  cut: 'round' | 'emerald' | 'asscher'
  ct: number
  metals: Array<{ key: string; label: string; image: string }>
}

const PLACEHOLDER = 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto/Jewelry%20Images/Bracelets/5FLX40ECN.png'
const LIFESTYLE_IMG = 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto,w_900/v1787210681/Jewelry%20Images/Bracelets/c0834-model.avif'

interface MetalVariant {
  key: string
  label: string
  image: string
}

interface Piece {
  id: string
  cut: 'round' | 'emerald' | 'asscher'
  name: string
  ref: string
  ct: number
  spec: string
  slug?: string
  metals?: MetalVariant[]
}

const PIECES: Piece[] = [
  {
    id: 'em40', cut: 'emerald', name: 'Flex Emerald 40', ref: 'C0834 · 5FLX40ECNS', ct: 31.29,
    spec: '80 emerald-cut diamonds, 0.375 ct each · G–H, VS',
  },
  {
    id: 'as33', cut: 'asscher', name: 'Flex Asscher 33', ref: 'C0754 · 5FLX33ASC2', ct: 55.89,
    spec: 'Quarter-carat Asscher cuts in two rows · G, VS',
  },
  {
    id: 'r65', cut: 'round', name: 'Flex Round 65', ref: '5FLX65R', ct: 27.20,
    spec: 'One-carat round brilliants, single row',
  },
  {
    id: 'r30', cut: 'round', name: 'Flex Round 30', ref: '5FLX30', ct: 5.48,
    spec: 'Round brilliants in a close prong setting · H, VS2',
  },
  {
    id: 'r25', cut: 'round', name: 'Flex Round 25', ref: '5FLX25', ct: 4.06,
    spec: 'Fine round brilliants, each held separately · H, VS2',
  },
  // EC products (trade-only, link to PDP)
  { id: 'em100ew', cut: 'emerald', name: 'EXTENT · Emerald 100 EW', ref: '5FLXEM100E', ct: 1.00, spec: 'Emerald cut, east-west · 1.00 ct per stone', slug: 'extent-emerald-100-ew' },
  { id: 'em75ew',  cut: 'emerald', name: 'EXTENT · Emerald 75 EW',  ref: '5FLXEM70E',  ct: 0.75, spec: 'Emerald cut, east-west · 0.75 ct per stone', slug: 'extent-emerald-70-ew' },
  { id: 'em50ew',  cut: 'emerald', name: 'EXTENT · Emerald 50 EW',  ref: '5FLXEM50E',  ct: 0.50, spec: 'Emerald cut, east-west · 0.50 ct per stone', slug: 'extent-emerald-50-ew' },
  { id: 'em40ew',  cut: 'emerald', name: 'EXTENT · Emerald 40 EW',  ref: '5FLXEM40E',  ct: 0.40, spec: 'Emerald cut, east-west · 0.40 ct per stone', slug: 'extent-emerald-40-ew' },
  { id: 'em30ew',  cut: 'emerald', name: 'EXTENT · Emerald 30 EW',  ref: '5FLXEM30E',  ct: 0.30, spec: 'Emerald cut, east-west · 0.30 ct per stone', slug: 'extent-emerald-30-ew' },
  { id: 'em25ew',  cut: 'emerald', name: 'EXTENT · Emerald 25 EW',  ref: '5FLXEM25E',  ct: 0.25, spec: 'Emerald cut, east-west · 0.25 ct per stone', slug: 'extent-emerald-25-ew' },
  { id: 'em20ew',  cut: 'emerald', name: 'EXTENT · Emerald 20 EW',  ref: '5FLXEM20E',  ct: 0.20, spec: 'Emerald cut, east-west · 0.20 ct per stone', slug: 'extent-emerald-20-ew' },
  { id: 'em15ew',  cut: 'emerald', name: 'EXTENT · Emerald 15 EW',  ref: '5FLXEM15E',  ct: 0.15, spec: 'Emerald cut, east-west · 0.15 ct per stone', slug: 'extent-emerald-15-ew' },
  { id: 'em10ew',  cut: 'emerald', name: 'EXTENT · Emerald 10 EW',  ref: '5FLXEM10E',  ct: 0.10, spec: 'Emerald cut, east-west · 0.10 ct per stone', slug: 'extent-emerald-10-ew' },
  { id: 'em100ns', cut: 'emerald', name: 'EXTENT · Emerald 100 NS', ref: '5FLXEM100N', ct: 1.00, spec: 'Emerald cut, north-south · 1.00 ct per stone', slug: 'extent-emerald-100-ns' },
  { id: 'em75ns',  cut: 'emerald', name: 'EXTENT · Emerald 75 NS',  ref: '5FLXEM70N',  ct: 0.75, spec: 'Emerald cut, north-south · 0.75 ct per stone', slug: 'extent-emerald-70-ns' },
  { id: 'em50ns',  cut: 'emerald', name: 'EXTENT · Emerald 50 NS',  ref: '5FLXEM50N',  ct: 0.50, spec: 'Emerald cut, north-south · 0.50 ct per stone', slug: 'extent-emerald-50-ns',
    metals: [
      { key: 'platinum',    label: 'Platinum',    image: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto/v1794024385/Jewelry%20Images/Bracelets/5FLXEM50N/5FLXEM50N_Platinum_Front.png' },
      { key: 'rose_gold',   label: 'Rose Gold',   image: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto/v1794024392/Jewelry%20Images/Bracelets/5FLXEM50N/5FLXEM50N_RoseGold_Front.png' },
      { key: 'yellow_gold', label: 'Yellow Gold', image: 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto/v1794024398/Jewelry%20Images/Bracelets/5FLXEM50N/5FLXEM50N_YellowGold_Front.png' },
    ],
  },
  { id: 'em40ns',  cut: 'emerald', name: 'EXTENT · Emerald 40 NS',  ref: '5FLXEM40N',  ct: 0.40, spec: 'Emerald cut, north-south · 0.40 ct per stone', slug: 'extent-emerald-40-ns' },
  { id: 'em30ns',  cut: 'emerald', name: 'EXTENT · Emerald 30 NS',  ref: '5FLXEM30N',  ct: 0.30, spec: 'Emerald cut, north-south · 0.30 ct per stone', slug: 'extent-emerald-30-ns' },
  { id: 'em25ns',  cut: 'emerald', name: 'EXTENT · Emerald 25 NS',  ref: '5FLXEM25N',  ct: 0.25, spec: 'Emerald cut, north-south · 0.25 ct per stone', slug: 'extent-emerald-25-ns' },
  { id: 'em20ns',  cut: 'emerald', name: 'EXTENT · Emerald 20 NS',  ref: '5FLXEM20N',  ct: 0.20, spec: 'Emerald cut, north-south · 0.20 ct per stone', slug: 'extent-emerald-20-ns' },
  { id: 'em15ns',  cut: 'emerald', name: 'EXTENT · Emerald 15 NS',  ref: '5FLXEM15N',  ct: 0.15, spec: 'Emerald cut, north-south · 0.15 ct per stone', slug: 'extent-emerald-15-ns' },
  { id: 'em10ns',  cut: 'emerald', name: 'EXTENT · Emerald 10 NS',  ref: '5FLXEM10N',  ct: 0.10, spec: 'Emerald cut, north-south · 0.10 ct per stone', slug: 'extent-emerald-10-ns' },
]

const CUT_NAMES = {
  round: 'Extent Flex Bracelet, Round Brilliant',
  emerald: 'Extent Flex Bracelet, Emerald Cut',
  asscher: 'Extent Flex Bracelet, Asscher Cut',
}

function getSKU(ref: string) {
  const idx = ref.indexOf(' · ')
  return idx >= 0 ? ref.slice(idx + 3) : ref
}

// CUTS is computed dynamically from dbCards in TradePage — see useMemo below

function ProductCard({ piece, metal }: { piece: Piece; metal?: MetalVariant }) {
  const image = metal?.image ?? PLACEHOLDER
  const href = piece.slug
    ? metal
      ? `/trade/flex/${piece.slug}?metal=${metal.key}`
      : `/trade/flex/${piece.slug}`
    : null

  const cardInner = (
    <>
      <div className={s.media}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cldUrl(image, 'f_auto,q_auto:best,w_1500')}
          alt={metal ? `${piece.name} · ${metal.label}` : piece.name}
          loading="lazy"
          style={{ width: '100%', display: 'block', objectFit: 'cover' }}
        />
      </div>
      <div>
        <p className={s.cardEyebrow}>{getSKU(piece.ref)}</p>
        <p className={s.cardTitle}>
          {CUT_NAMES[piece.cut]}<span className={s.cardCt}>{(+piece.ct.toFixed(2)).toString()} ct tw</span>
        </p>
        {metal && <p className={s.cardMetal}>{metal.label}</p>}
      </div>
    </>
  )

  return href
    ? <Link href={href} className={s.card} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>{cardInner}</Link>
    : <article className={s.card}>{cardInner}</article>
}

function expandPiece(piece: Piece): Array<{ piece: Piece; metal?: MetalVariant }> {
  if (piece.metals && piece.metals.length > 0) {
    return piece.metals.map(metal => ({ piece, metal }))
  }
  return [{ piece }]
}

function EditorialTile() {
  return (
    <div className={`${s.card} ${s.tilewrap} ${s.tileSpan2}`}>
      <div className={s.tile}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LIFESTYLE_IMG} alt="" loading="lazy" />
        <div className={s.tileIn}>
          <p className={s.tileEyebrow}>How it closes</p>
          <p className={s.tileBig}>It opens over the hand and returns to the wrist.</p>
          <p className={s.tileText}>A spring spine runs under the stones, so the line stays unbroken all the way around.</p>
        </div>
      </div>
    </div>
  )
}



export default function TradePage({ dbCards }: { dbCards: FlexCardData[] }) {
  const [activeCut, setActiveCut] = useState('all')
  const [sortOrder, setSortOrder] = useState('feat')

  // Convert server-fetched card data to Piece objects for the grid
  const gridPieces = useMemo(() => dbCards.map(c => ({
    id: c.id,
    cut: c.cut,
    name: CUT_NAMES[c.cut],
    ref: c.sku,
    ct: c.ct,
    spec: '',
    slug: c.slug,
    metals: c.metals,
  } as Piece)), [dbCards])

  // Compute filter pill counts from actual grid cards (each metal = 1 visible card)
  const cuts = useMemo(() => {
    let round = 0, emerald = 0, asscher = 0
    for (const c of dbCards) {
      const n = c.metals.length
      if (c.cut === 'round')   round += n
      if (c.cut === 'emerald') emerald += n
      if (c.cut === 'asscher') asscher += n
    }
    const total = round + emerald + asscher
    return [
      { key: 'all',     label: 'All',     count: total,   visible: true },
      { key: 'round',   label: 'Round',   count: round,   visible: round > 0 },
      { key: 'emerald', label: 'Emerald', count: emerald, visible: emerald > 0 },
      { key: 'asscher', label: 'Asscher', count: asscher, visible: asscher > 0 },
    ]
  }, [dbCards])

  const filtered = gridPieces
    .filter(p => activeCut === 'all' || p.cut === activeCut)
    .slice()
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.ct - b.ct
      if (sortOrder === 'desc') return b.ct - a.ct
      return 0
    })

  return (
    <>
      {/* Hero image */}
      <section className={s.hero} aria-label="Flex bracelet">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          src="https://res.cloudinary.com/dlg2mou53/video/upload/w_1920,c_limit,q_auto/v1782855871/Jewelry%20Videos/Bracelets/emerald-cut-flex-bracelet-c0834-2026.mp4"
          className={s.heroImg}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className={s.heroCap}>
          <div className={s.wrap}>
            <div>
              <span className={s.heroEyebrow}>Bez Ambar · Los Angeles</span>
              <h1 className={s.heroTitle}>Extent™ Flex Bracelet</h1>
            </div>
          </div>
        </div>
      </section>

      {/* Collection */}
      <main id="collection" style={{ background: '#fff' }}>
        <div className={s.wrap}>
          <nav className={s.crumbs} aria-label="Breadcrumb">
            For the Trade<span>/</span>Bracelets<span>/</span>Extent
          </nav>
          <div className={s.intro}>
            <div>
              <h2 className={`ba-title ${s.introTitle}`}>One line of diamonds. No clasp.</h2>
            </div>
            <p>
              A continuous line of natural diamonds on a flexible gold spine. The bracelet stretches
              open over the hand and closes back to the wrist, so there is no clasp to break the line.
              Every stone is cut and matched in our Los Angeles atelier, and each size is made in platinum, 18K rose gold or 18K yellow gold.
            </p>
          </div>
        </div>

        {/* Filter rail */}
        <div className={s.rail}>
          <div className={s.wrap}>
            <div className={s.chips} role="group" aria-label="Filter by cut">
              {cuts.filter(c => c.visible).map(c => (
                <button
                  key={c.key}
                  className={s.chip}
                  type="button"
                  aria-pressed={activeCut === c.key}
                  onClick={() => setActiveCut(c.key)}
                >
                  {c.label}<span className={s.chipN}>{c.count}</span>
                </button>
              ))}
            </div>
            <label className={s.sort} htmlFor="sort-select">
              Sort
              <select id="sort-select" value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="feat">Featured</option>
                <option value="asc">Carat weight, low to high</option>
                <option value="desc">Carat weight, high to low</option>
              </select>
            </label>
          </div>
        </div>

        {/* Product grid */}
        <div className={s.wrap}>
          <div className={s.grid}>
            {filtered.flatMap(expandPiece).map(({ piece, metal }) => (
              <ProductCard key={metal ? `${piece.id}-${metal.key}` : piece.id} piece={piece} metal={metal} />
            ))}
            <EditorialTile />
          </div>
        </div>
      </main>

    </>
  )
}
