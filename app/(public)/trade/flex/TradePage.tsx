'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { cldUrl } from '@/lib/cloudinary'
import s from './page.module.css'
import { TILES } from './editorial-tiles'
import type { EditorialTileConfig } from './editorial-tiles'

export interface FlexCardData {
  id: string
  sku: string
  slug?: string
  cut: 'round' | 'emerald' | 'asscher'
  ct: number
  ctLabel: string
  metals: Array<{ key: string; label: string; image: string }>
}

const PLACEHOLDER = 'https://res.cloudinary.com/dlg2mou53/image/upload/f_auto,q_auto/Jewelry%20Images/Bracelets/5FLX40ECN.png'

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
  ctLabel: string
  spec: string
  slug?: string
  metals?: MetalVariant[]
}

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
          {CUT_NAMES[piece.cut]}<span className={s.cardCt}>{(+piece.ct.toFixed(2)).toString()} {piece.ctLabel}</span>
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

function VideoTile({ config }: { config: EditorialTileConfig }) {
  return (
    <div className={`${s.tilewrap} ${s.tileSpan2}`}>
      <div className={s.videoTile}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={config.url} autoPlay muted loop playsInline />
      </div>
    </div>
  )
}

function ImageTile({ config }: { config: EditorialTileConfig }) {
  return (
    <div className={`${s.tilewrap} ${s.tileSpan2}`}>
      <div className={s.imageTile}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={config.url} alt={config.alt ?? ''} loading="lazy" />
      </div>
    </div>
  )
}

function EditorialTile() {
  const { url, alt, eyebrow, headline, bodyText } = TILES.tileC
  return (
    <div className={`${s.tilewrap} ${s.tileSpan2}`}>
      <div className={s.tile}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt ?? ''} loading="lazy" />
        <div className={s.tileIn}>
          {eyebrow && <p className={s.tileEyebrow}>{eyebrow}</p>}
          {headline && <p className={s.tileBig}>{headline}</p>}
          {bodyText && <p className={s.tileText}>{bodyText}</p>}
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
    ctLabel: c.ctLabel,
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
            {(() => {
              const cards = filtered.flatMap(expandPiece)
              const renderCard = ({ piece, metal }: { piece: Piece; metal?: MetalVariant }) => (
                <ProductCard key={metal ? `${piece.id}-${metal.key}` : piece.id} piece={piece} metal={metal} />
              )
              return (
                <>
                  {/* Row 1: 2 product cards + Tile A */}
                  {cards.slice(0, 2).map(renderCard)}
                  <VideoTile config={TILES.tileA} />
                  {/* Rows 2–3: 8 product cards (4 each) */}
                  {cards.slice(2, 10).map(renderCard)}
                  {/* Row 4: Tile B + 2 product cards */}
                  <ImageTile config={TILES.tileB} />
                  {cards.slice(10, 12).map(renderCard)}
                  {/* Remaining rows */}
                  {cards.slice(12).map(renderCard)}
                  {/* End: Tile C */}
                  <EditorialTile />
                </>
              )
            })()}
          </div>
        </div>
      </main>

    </>
  )
}
