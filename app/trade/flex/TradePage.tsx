'use client'

import React, { useState, useEffect, useRef } from 'react'
import s from './page.module.css'

const CL = 'https://res.cloudinary.com/dlg2mou53/'
const vidUrl = (p: string) => `${CL}video/upload/w_900,c_limit,q_auto/${p}.mp4`
const posterUrl = (p: string) => `${CL}video/upload/so_1,f_jpg,w_900,c_fit/${p}.jpg`
const imgUrl = (p: string) => `${CL}image/upload/f_auto,q_auto,w_900/${p}`

interface Piece {
  id: string
  cut: 'round' | 'emerald' | 'asscher'
  name: string
  ref: string
  ct: number
  spec: string
  v: string
  w: string
}

const PIECES: Piece[] = [
  {
    id: 'em40', cut: 'emerald', name: 'Flex Emerald 40', ref: 'C0834 · 5FLX40ECNS', ct: 31.29,
    spec: '80 emerald-cut diamonds, 0.375 ct each · G–H, VS',
    v: 'v1782855871/Jewelry%20Videos/Bracelets/emerald-cut-flex-bracelet-c0834-2026',
    w: 'v1787210681/Jewelry%20Images/Bracelets/c0834-model.avif',
  },
  {
    id: 'as33', cut: 'asscher', name: 'Flex Asscher 33', ref: 'C0754 · 5FLX33ASC2', ct: 55.89,
    spec: 'Quarter-carat Asscher cuts in two rows · G, VS',
    v: 'v1787618091/Jewelry%20Videos/Bracelets/C0754',
    w: 'v1787618096/Jewelry%20Images/Bracelets/c0754-model.avif',
  },
  {
    id: 'r65', cut: 'round', name: 'Flex Round 65', ref: '5FLX65R', ct: 27.20,
    spec: 'One-carat round brilliants, single row',
    v: 'v1788225453/Jewelry%20Videos/Bracelets/5FLX65R',
    w: 'v1788225458/Jewelry%20Images/Bracelets/5FLX65R-model.avif',
  },
  {
    id: 'r30', cut: 'round', name: 'Flex Round 30', ref: '5FLX30', ct: 5.48,
    spec: 'Round brilliants in a close prong setting · H, VS2',
    v: 'v1788208658/Jewelry%20Videos/Bracelets/5FLX30',
    w: 'v1788212027/Jewelry%20Images/Bracelets/5FLX30-model.avif',
  },
  {
    id: 'r25', cut: 'round', name: 'Flex Round 25', ref: '5FLX25', ct: 4.06,
    spec: 'Fine round brilliants, each held separately · H, VS2',
    v: 'v1788299317/Jewelry%20Videos/Bracelets/5FLX25',
    w: 'v1787967418/Jewelry%20Images/Bracelets/C0722-model.avif',
  },
]

const CUT_LABELS = {
  round: 'Round brilliant',
  emerald: 'Emerald cut',
  asscher: 'Asscher cut',
}

const CUTS = [
  { key: 'all',     label: 'All',     count: PIECES.length },
  { key: 'round',   label: 'Round',   count: PIECES.filter(p => p.cut === 'round').length },
  { key: 'emerald', label: 'Emerald', count: PIECES.filter(p => p.cut === 'emerald').length },
  { key: 'asscher', label: 'Asscher', count: PIECES.filter(p => p.cut === 'asscher').length },
]

function ProductCard({ piece, onAsk }: { piece: Piece; onAsk: (id: string) => void }) {
  const [view, setView] = useState<'motion' | 'worn'>('motion')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (view === 'motion') v.play().catch(() => {})
    else v.pause()
  }, [view])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (!('IntersectionObserver' in window)) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && view === 'motion') v.play().catch(() => {})
        else v.pause()
      },
      { threshold: 0.45 }
    )
    obs.observe(v)
    return () => obs.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <article className={s.card}>
      <div className={s.media}>
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={posterUrl(piece.v)}
          aria-label={`${piece.name} turning`}
          style={{ opacity: view === 'motion' ? 1 : 0, transition: 'opacity 0.45s ease' }}
        >
          <source src={vidUrl(piece.v)} type="video/mp4" />
        </video>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={s.worn}
          src={imgUrl(piece.w)}
          alt={`${piece.name} on the wrist`}
          loading="lazy"
          style={{ opacity: view === 'worn' ? 1 : 0, transition: 'opacity 0.45s ease' }}
        />
        <span className={s.ref}>{piece.ref}</span>
        <div className={s.views} role="group" aria-label="View">
          <button type="button" aria-pressed={view === 'motion'} onClick={() => setView('motion')}>In motion</button>
          <button type="button" aria-pressed={view === 'worn'}   onClick={() => setView('worn')}>On the wrist</button>
        </div>
      </div>
      <div>
        <div className={`${s.label} ${s.eyebrow}`}>{CUT_LABELS[piece.cut]}</div>
        <h3 className={s.cardTitle}>{piece.name}</h3>
      </div>
      <p className={s.spec}><b>{piece.ct.toFixed(2)} ct</b> total · {piece.spec}</p>
      <div className={s.row}>
        <span className={s.metals}>
          <span className={`${s.sw} ${s.wg}`} title="18K white gold" />
          <span className={`${s.sw} ${s.pt}`} title="Platinum" />
          18K white gold · Platinum
        </span>
        <button className={s.ask} type="button" onClick={() => onAsk(piece.id)}>Trade price</button>
      </div>
    </article>
  )
}

function EditorialTile() {
  return (
    <div className={`${s.card} ${s.tilewrap}`}>
      <div className={s.tile}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgUrl('v1787210681/Jewelry%20Images/Bracelets/c0834-model.avif')} alt="" loading="lazy" />
        <div className={s.tileIn}>
          <div className={s.label}>How it closes</div>
          <p className={s.tileBig}>It opens over the hand and returns to the wrist.</p>
          <p className={s.tileText}>A spring spine runs under the stones, so the line stays unbroken all the way around.</p>
        </div>
      </div>
    </div>
  )
}

function TradeForm({ defaultChecked }: { defaultChecked: Set<string> }) {
  const [selections, setSelections] = useState<Set<string>>(new Set(defaultChecked))
  const [allRange, setAllRange] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    setSelections(prev => new Set([...prev, ...defaultChecked]))
  }, [defaultChecked])

  function toggle(id: string) {
    setSelections(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = e.currentTarget
    const name  = (f.elements.namedItem('name')  as HTMLInputElement).value.trim()
    const store = (f.elements.namedItem('store') as HTMLInputElement).value.trim()
    const email = (f.elements.namedItem('email') as HTMLInputElement).value.trim()
    if (!name || !store || !/^\S+@\S+\.\S+$/.test(email)) {
      setErr('Please add your name, store, and a valid email so we can send the line sheet.')
      return
    }
    setErr('')
    const city    = (f.elements.namedItem('city')    as HTMLInputElement).value.trim()
    const message = (f.elements.namedItem('message') as HTMLTextAreaElement).value.trim()
    const chosen  = PIECES.filter(p => selections.has(p.id)).map(p => p.name)
    if (allRange) chosen.push('The full Flex range')
    const body = `Name: ${name}\nStore: ${store}\nCity: ${city}\nEmail: ${email}\nInterested in: ${chosen.join(', ') || 'The Flex collection'}\n\n${message}`
    window.location.href = `mailto:bez@bezambar-atelier.com?subject=${encodeURIComponent('Flex line sheet request · ' + store)}&body=${encodeURIComponent(body)}`
    setSubmitted(true)
  }

  return (
    <form className={s.form} onSubmit={handleSubmit} noValidate>
      <label className={`${s.fieldLabel} ${s.f}`} htmlFor="f-name">
        Your name
        <input id="f-name" name="name" autoComplete="name" required />
      </label>
      <label className={`${s.fieldLabel} ${s.f}`} htmlFor="f-store">
        Store
        <input id="f-store" name="store" autoComplete="organization" required />
      </label>
      <label className={`${s.fieldLabel} ${s.f}`} htmlFor="f-email">
        Email
        <input id="f-email" name="email" type="email" autoComplete="email" required />
      </label>
      <label className={`${s.fieldLabel} ${s.f}`} htmlFor="f-city">
        City and state
        <input id="f-city" name="city" autoComplete="address-level2" />
      </label>
      <fieldset className={s.full}>
        <legend>Interested in</legend>
        <div className={s.picks}>
          {PIECES.map(p => (
            <label key={p.id} htmlFor={`pick-${p.id}`}>
              <input
                type="checkbox"
                id={`pick-${p.id}`}
                checked={selections.has(p.id)}
                onChange={() => toggle(p.id)}
              />
              {p.name}
            </label>
          ))}
          <label htmlFor="pick-all">
            <input
              type="checkbox"
              id="pick-all"
              checked={allRange}
              onChange={e => setAllRange(e.target.checked)}
            />
            The full range
          </label>
        </div>
      </fieldset>
      <label className={`${s.fieldLabel} ${s.f} ${s.full}`} htmlFor="f-msg">
        Message
        <textarea id="f-msg" name="message" placeholder="Sizes, metals, or a time to talk" />
      </label>
      <div className={`${s.full} ${s.submitRow}`}>
        <button className={s.btnSubmit} type="submit">Request the line sheet</button>
        <p className={s.formnote}>Opens your email with your request filled in.</p>
      </div>
      {err      && <div className={`${s.done} ${s.full}`}>{err}</div>}
      {submitted && <div className={`${s.done} ${s.full}`}>Your email app should open with the request filled in. If it doesn&rsquo;t, write to bez@bezambar-atelier.com.</div>}
    </form>
  )
}

export default function TradePage() {
  const [activeCut, setActiveCut] = useState('all')
  const [sortOrder, setSortOrder] = useState('feat')
  const [checkedPieces, setCheckedPieces] = useState<Set<string>>(new Set())

  const filtered = PIECES
    .filter(p => activeCut === 'all' || p.cut === activeCut)
    .slice()
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.ct - b.ct
      if (sortOrder === 'desc') return b.ct - a.ct
      return 0
    })

  function handleAsk(id: string) {
    setCheckedPieces(prev => new Set([...prev, id]))
    const el = document.getElementById('trade')
    el?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    setTimeout(() => document.getElementById('f-name')?.focus({ preventScroll: true }), 500)
  }

  return (
    <>
      {/* Promo bar */}
      <div className={s.promo}>
        For the trade · The Flex collection{' '}
        <a href="#trade">Request the line sheet →</a>
      </div>

      {/* Minimal trade header */}
      <header className={s.siteHeader}>
        <div className={s.wrap}>
          <div className={s.hdrLeft}>Los Angeles · Est. 1979</div>
          <a className={s.wordmark} href="https://www.bezambar.com" rel="noopener">
            Bez Ambar
            <small>Designer of the Princess Cut</small>
          </a>
          <div className={s.hdrRight}>
            <a className={s.btn} href="#trade">Trade inquiry</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className={s.hero} aria-label="Flex bracelet in motion">
        <video
          autoPlay muted loop playsInline preload="metadata"
          poster="https://res.cloudinary.com/dlg2mou53/video/upload/so_1,f_jpg,w_1600,c_fit/v1782855871/Jewelry%20Videos/Bracelets/emerald-cut-flex-bracelet-c0834-2026.jpg"
        >
          <source
            src="https://res.cloudinary.com/dlg2mou53/video/upload/w_1920,c_limit,q_auto/v1782855871/Jewelry%20Videos/Bracelets/emerald-cut-flex-bracelet-c0834-2026.mp4"
            type="video/mp4"
          />
        </video>
        <div className={s.heroCap}>
          <div className={s.wrap}>
            <div>
              <div className={s.label}>The Flex collection</div>
              <h2>One line of diamonds.<br /><em>No clasp.</em></h2>
            </div>
            <a className={`${s.btn} ${s.btnLight}`} href="#collection">View the collection</a>
          </div>
        </div>
      </section>

      {/* Collection */}
      <main id="collection" style={{ background: 'var(--ba-paper, #faf7f2)' }}>
        <div className={s.wrap}>
          <nav className={s.crumbs} aria-label="Breadcrumb">
            For the trade<span>/</span>Bracelets<span>/</span>Flex
          </nav>
          <div className={s.intro}>
            <div>
              <h1>The Flex Bracelet</h1>
              <div className={s.facts}>
                <div><b>3 cuts</b>Round, emerald, Asscher</div>
                <div><b>4 to 56 ct</b>Total diamond weight</div>
                <div><b>No clasp</b>Opens over the hand</div>
              </div>
            </div>
            <p>
              A continuous line of natural diamonds on a flexible gold spine. The bracelet stretches
              open over the hand and closes back to the wrist, so there is no clasp to break the line.
              Every stone is cut and matched in our Los Angeles atelier, and each size is made in 18K
              white gold or platinum.
            </p>
          </div>
        </div>

        {/* Filter rail */}
        <div className={s.rail}>
          <div className={s.wrap}>
            <div className={s.chips} role="group" aria-label="Filter by cut">
              {CUTS.map(c => (
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
            {filtered.map((piece, i) => (
              <React.Fragment key={piece.id}>
                <ProductCard piece={piece} onAsk={handleAsk} />
                {i === 1 && <EditorialTile />}
              </React.Fragment>
            ))}
            {filtered.length < 2 && <EditorialTile />}
          </div>
        </div>
      </main>

      {/* Range table */}
      <section className={s.band} aria-labelledby="range-h">
        <div className={`${s.wrap} ${s.two}`}>
          <div>
            <div className={`${s.label} ${s.goldText}`}>The full range</div>
            <h2 id="range-h">Every size, made to order</h2>
            <p>
              The five pieces above are filmed. The full Flex range runs from a fine 2&nbsp;mm line
              to a one-carat-per-stone statement, in rounds and in emerald cuts set either across the
              band or along it.
            </p>
            <p>
              Stone counts and total weights depend on wrist size. The figures here are calculated
              for a 52&nbsp;mm inner diameter.
            </p>
          </div>
          <div>
            <div className={s.tbl}>
              <table>
                <thead>
                  <tr>
                    <th>Cut</th>
                    <th>Per stone</th>
                    <th>Stones</th>
                    <th>Total weight</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Round<small>Prong set, single row</small></td>
                    <td>0.03 – 1.00 ct</td>
                    <td>80 – 29</td>
                    <td>≈ 2.6 – 29.1 ct</td>
                  </tr>
                  <tr>
                    <td>Emerald, east-west<small>Long axis across the band</small></td>
                    <td>0.10 – 1.00 ct</td>
                    <td>56 – 26</td>
                    <td>≈ 5.6 – 26.4 ct</td>
                  </tr>
                  <tr>
                    <td>Emerald, north-south<small>Long axis along the band</small></td>
                    <td>from 0.10 ct</td>
                    <td>from 76</td>
                    <td>from ≈ 7.6 ct</td>
                  </tr>
                  <tr>
                    <td>Asscher<small>Two rows, edge to edge</small></td>
                    <td>0.25 ct</td>
                    <td>Two rows</td>
                    <td>≈ 55.9 ct</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className={s.sizes} aria-label="Wrist sizes">
              <div><b>XS</b>6.0 in · 152 mm</div>
              <div><b>S</b>6.5 in · 165 mm</div>
              <div><b>M</b>7.0 in · 178 mm</div>
              <div><b>L</b>7.5 in · 191 mm</div>
            </div>
            <p className={s.note}>Circumference by wrist size. Larger sizes on request.</p>
          </div>
        </div>
      </section>

      {/* Trade inquiry */}
      <section className={s.tradeSection} id="trade" aria-labelledby="trade-h">
        <div className={`${s.wrap} ${s.two}`}>
          <div>
            <div className={`${s.label} ${s.goldText}`}>For retailers</div>
            <h2 id="trade-h">Carry Flex in your store</h2>
            <p>
              Bez Ambar has made fine jewelry in Los Angeles since 1979, cutting and setting our own
              stones and supplying some of the best-known houses in the trade. Flex is now open to a
              small number of retailers.
            </p>
            <ul className={s.points}>
              <li>Line sheet with trade pricing for every size</li>
              <li>Pieces available from atelier inventory, with any size made to order</li>
              <li>Natural diamonds, matched by hand, in 18K white gold or platinum</li>
              <li>Lifetime warranty on craftsmanship and materials</li>
            </ul>
            <div className={s.contact}>
              <span className={s.label}>Or write to Bez directly</span>
              <a href="mailto:bez@bezambar-atelier.com">bez@bezambar-atelier.com</a>
              <a href="tel:+12136299191">(213) 629-9191</a>
              <span style={{ color: 'var(--tf-muted, #7d776f)' }}>
                611 Wilshire Blvd, Los Angeles, CA 90017 · by appointment
              </span>
            </div>
          </div>
          <TradeForm defaultChecked={checkedPieces} />
        </div>
      </section>

      {/* Footer */}
      <footer className={s.footer}>
        <div className={s.wrap}>
          <div>
            <div className={s.footerWm}>Bez Ambar</div>
            <div style={{ marginTop: 8 }}>Designer of the Princess Cut · Los Angeles · Est. 1979</div>
          </div>
          <div style={{ display: 'grid', gap: 4 }}>
            <a href="https://www.bezambar.com" rel="noopener">bezambar.com</a>
            <span>611 Wilshire Blvd, Los Angeles, CA 90017</span>
            <span>© 1979–2026 Bez Ambar, Inc.</span>
          </div>
        </div>
      </footer>
    </>
  )
}
