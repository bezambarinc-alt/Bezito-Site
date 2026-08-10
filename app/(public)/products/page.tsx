import { unstable_cache } from 'next/cache'
import { sql } from '@/lib/db'
import styles from './page.module.css'

type Product = {
  sku: string
  name: string
  category: string | null
  subtitle: string | null
  hero_visual: string | null
  editorial_visual: string | null
  metal: string | null
  stone_shape: string | null
}

// Cached query — invalidated by revalidateTag('products','max') on sync
const getProducts = unstable_cache(
  async () =>
    sql<Product>(
      `SELECT
         sku,
         name,
         specs->>'category'     AS category,
         specs->>'subtitle'     AS subtitle,
         specs->>'heroVideoUrl' AS hero_visual,
         specs->>'heroPosterUrl' AS editorial_visual,
         specs->>'metal'        AS metal,
         specs->>'gemStone'     AS stone_shape
       FROM products
       ORDER BY name ASC`
    ),
  ['products'],
  { tags: ['products'], revalidate: 3600 }
)

const CAT_ORDER = ['Rings', 'Bands', 'Earrings', 'Necklaces', 'Pendants', 'Bracelets']

export default async function ProductsPage() {
  const products = await getProducts()

  const byCategory: Record<string, Product[]> = {}
  for (const cat of CAT_ORDER) {
    const items = products.filter(p => p.category === cat)
    if (items.length) byCategory[cat] = items
  }
  // catch any categories not in canonical order
  for (const p of products) {
    if (p.category && !CAT_ORDER.includes(p.category) && !byCategory[p.category]) {
      byCategory[p.category] = products.filter(x => x.category === p.category)
    }
  }
  // uncategorised
  const uncategorised = products.filter(p => !p.category)

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span className={styles.brand}>Bez Ambar</span>
        <span className={styles.count}>{products.length} pieces</span>
      </header>

      <div className={styles.inner}>
        {Object.entries(byCategory).map(([cat, items]) => (
          <section key={cat} className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionLabel}>{cat}</span>
              <div className={styles.rule} />
            </div>
            <Grid products={items} />
          </section>
        ))}

        {uncategorised.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionLabel}>Other</span>
              <div className={styles.rule} />
            </div>
            <Grid products={uncategorised} />
          </section>
        )}
      </div>
    </main>
  )
}

function Grid({ products }: { products: Product[] }) {
  return (
    <div className={styles.grid}>
      {products.map(p => <Card key={p.sku} p={p} />)}
    </div>
  )
}

function Card({ p }: { p: Product }) {
  const isVideo = Boolean(
    p.hero_visual &&
    (p.hero_visual.includes('.mp4') || p.hero_visual.includes('/video/upload/'))
  )
  const poster = p.editorial_visual
    ?? p.hero_visual
        ?.replace('/upload/', '/upload/so_2.0,f_jpg,w_800,c_fit/')
        ?.replace(/\.mp4$/, '.jpg')

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {p.hero_visual && isVideo ? (
          <video
            autoPlay muted loop playsInline
            poster={poster ?? undefined}
            className={styles.mediaEl}
          >
            <source src={p.hero_visual} type="video/mp4" />
          </video>
        ) : p.hero_visual ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.hero_visual} alt={p.name} className={styles.mediaEl} />
        ) : (
          <div className={styles.mediaEl} />
        )}
        {p.category && <span className={styles.badge}>{p.category}</span>}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{p.name}</h3>
        {p.subtitle && <p className={styles.subtitle}>{p.subtitle}</p>}
        <p className={styles.sku}>{p.sku}</p>
      </div>
    </article>
  )
}
