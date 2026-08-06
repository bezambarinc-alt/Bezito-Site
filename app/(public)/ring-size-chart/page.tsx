import type { Metadata } from 'next'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Ring Size Chart — Bez Ambar',
  description:
    'Find your ring size with the Bez Ambar measurement guide. String and diameter methods, US–to–mm conversion table, and professional fitting options.',
}

// US ring sizes with inside diameter in mm
const SIZE_TABLE = [
  { us: '4',    mm: '14.9' },
  { us: '4.5',  mm: '15.3' },
  { us: '5',    mm: '15.7' },
  { us: '5.5',  mm: '16.1' },
  { us: '6',    mm: '16.5' },
  { us: '6.5',  mm: '16.9' },
  { us: '7',    mm: '17.3' },
  { us: '7.5',  mm: '17.7' },
  { us: '8',    mm: '18.2' },
  { us: '8.5',  mm: '18.6' },
  { us: '9',    mm: '19.0' },
  { us: '9.5',  mm: '19.4' },
  { us: '10',   mm: '19.8' },
  { us: '10.5', mm: '20.2' },
  { us: '11',   mm: '20.6' },
  { us: '11.5', mm: '21.0' },
  { us: '12',   mm: '21.4' },
]

export default function RingSizeChartPage() {
  return (
    <main>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <video
          className={styles.heroVideo}
          autoPlay muted loop playsInline preload="none"
          aria-hidden="true"
        >
          <source
            src="https://res.cloudinary.com/dlg2mou53/video/upload/f_auto,q_auto/Jewelry%20Videos/Bands/4k_ovalcut_band_6_v1_rllzya.mp4"
            type="video/mp4"
          />
        </video>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Resources</p>
          <h1 className={styles.heroTitle}>Ring Size<br />Guide</h1>
          <div className={styles.heroRule} />
          <p className={styles.heroLede}>
            Measure at home or visit the atelier for a professional fitting.
            An accurate size is the foundation of a comfortable piece.
          </p>
        </div>
      </section>

      <div className={styles.body}>

        {/* ── Methods ── */}
        <section className={styles.methodsSection}>
          <div className={styles.methodsHeader}>
            <span className={styles.eyebrow}>How to Measure</span>
            <h2 className={styles.heading}>Two Methods at Home</h2>
            <p className={styles.intro}>Either method gives a reliable result. For the most precise sizing, we recommend a professional mandrel fitting at any jeweler — or visit us in Los Angeles.</p>
          </div>

          <div className={styles.methodsGrid}>
            <div className={styles.method}>
              <div className={styles.methodStep}>01</div>
              <h3 className={styles.methodName}>String or Paper Strip</h3>
              <ol className={styles.methodSteps}>
                <li>Cut a strip of paper about 6mm wide and 10cm long — or use a thin piece of string.</li>
                <li>Wrap it snugly around the base of the finger you intend to wear the ring on. Snug, not tight.</li>
                <li>Mark where the paper or string overlaps with a pen.</li>
                <li>Lay the strip flat and measure the length in millimeters from the end to your mark. This is your circumference.</li>
                <li>Divide by π (3.14159) to get your inside diameter in mm, then match to the table below.</li>
              </ol>
              <p className={styles.methodNote}>Tip: measure in the evening — fingers are slightly larger later in the day. If in doubt, size up half a size.</p>
            </div>

            <div className={styles.method}>
              <div className={styles.methodStep}>02</div>
              <h3 className={styles.methodName}>Existing Ring</h3>
              <ol className={styles.methodSteps}>
                <li>Find a ring that fits the intended finger well.</li>
                <li>Place it on a ruler and measure the inside diameter — the distance across the inside of the band — in millimeters.</li>
                <li>Match the measurement to the table below.</li>
              </ol>
              <p className={styles.methodNote}>Tip: if your measurement falls between two sizes, choose the larger one for comfort bands and the smaller one for narrow bands.</p>
            </div>
          </div>
        </section>

        {/* ── Size table ── */}
        <section className={styles.tableSection}>
          <span className={styles.eyebrow}>Reference</span>
          <h2 className={styles.heading}>Size Conversion</h2>
          <p className={styles.intro}>US ring sizes with their corresponding inside diameter in millimeters.</p>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>US Size</th>
                  <th>Inside Diameter (mm)</th>
                  <th>Inside Circumference (mm)</th>
                </tr>
              </thead>
              <tbody>
                {SIZE_TABLE.map((row) => (
                  <tr key={row.us}>
                    <td>{row.us}</td>
                    <td>{row.mm} mm</td>
                    <td>{(parseFloat(row.mm) * Math.PI).toFixed(1)} mm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Notes ── */}
        <section className={styles.notesSection}>
          <span className={styles.eyebrow}>Important Notes</span>
          <h2 className={styles.heading}>Before You Order</h2>
          <ul className={styles.notes}>
            <li>Ring size can vary by up to half a size depending on temperature, time of day, and hydration. Always measure at body temperature.</li>
            <li>Wide bands (over 6mm) fit tighter than narrow bands of the same nominal size. Size up half a size for wide-band pieces like Bez Ambar eternity bands.</li>
            <li>Knuckle size and finger tip size can differ. Measure the largest point the ring must pass over — the knuckle — and confirm the ring isn't too loose at the base.</li>
            <li>Every Bez Ambar piece can be resized after purchase. Contact the atelier to arrange a sizing appointment.</li>
          </ul>
        </section>

        {/* ── CTA ── */}
        <section className={styles.cta}>
          <p className={styles.ctaEyebrow}>Not Sure? Come In.</p>
          <h2 className={styles.ctaTitle}>Professional Fitting at the Atelier</h2>
          <p className={styles.ctaBody}>
            A mandrel fitting takes under five minutes and gives you an exact size.
            Visit us at 611 Wilshire Blvd, Los Angeles — by appointment.
          </p>
          <a href="/contact" className={styles.ctaBtn}>Schedule a Visit</a>
        </section>

      </div>
    </main>
  )
}
