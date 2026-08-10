import { unstable_cache } from 'next/cache'
import { sql } from '@/lib/db'

type Product = {
  sku: string
  name: string
  category: string | null
  subtitle: string | null
  hero_visual: string | null
  editorial_visual: string | null
  metal: string | null
  stone_shape: string | null
  featured: boolean
  sort_order: number
}

const getProducts = unstable_cache(
  async () =>
    sql<Product>(
      `SELECT sku, name, category, subtitle, hero_visual, editorial_visual,
              metal, stone_shape, featured, sort_order
       FROM products
       WHERE active = true
       ORDER BY featured DESC, sort_order ASC, name ASC`
    ),
  ['products'],
  { tags: ['products'], revalidate: 3600 }
)

const CAT_ORDER = ['Rings','Bands','Earrings','Necklaces','Pendants','Bracelets']

export default async function ProductsPage() {
  const products = await getProducts()

  const featured = products.filter(p => p.featured)
  const byCategory: Record<string, Product[]> = {}
  for (const cat of CAT_ORDER) {
    const items = products.filter(p => p.category === cat)
    if (items.length) byCategory[cat] = items
  }
  for (const p of products) {
    if (p.category && !CAT_ORDER.includes(p.category) && !byCategory[p.category]) {
      byCategory[p.category] = products.filter(x => x.category === p.category)
    }
  }

  return (
    <main style={{ background:'#080808', minHeight:'100vh', paddingBottom:80 }}>

      <header style={{
        padding:'28px 48px', borderBottom:'1px solid #1a1a1a',
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <span style={{ color:'#c9a84c', fontFamily:'Georgia,serif', letterSpacing:'0.22em', fontSize:12, textTransform:'uppercase' }}>
          Bez Ambar
        </span>
        <span style={{ color:'#3a3a3a', fontSize:11, letterSpacing:'0.1em' }}>
          {products.length} pieces
        </span>
      </header>

      <div style={{ maxWidth:1380, margin:'0 auto', padding:'0 40px' }}>

        {featured.length > 0 && (
          <Section label="Featured">
            <Grid products={featured} large />
          </Section>
        )}

        {Object.entries(byCategory).map(([cat, items]) => (
          <Section key={cat} label={cat}>
            <Grid products={items} />
          </Section>
        ))}

      </div>
    </main>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop:64 }}>
      <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:32 }}>
        <span style={{
          color:'#c9a84c', fontFamily:'Georgia,serif', fontSize:10,
          letterSpacing:'0.35em', textTransform:'uppercase', whiteSpace:'nowrap',
        }}>
          {label}
        </span>
        <div style={{ flex:1, height:1, background:'#181818' }} />
      </div>
      {children}
    </section>
  )
}

function Grid({ products, large = false }: { products: Product[]; large?: boolean }) {
  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:`repeat(auto-fill, minmax(${large ? 400 : 300}px, 1fr))`,
      gap:20,
    }}>
      {products.map(p => <Card key={p.sku} p={p} large={large} />)}
    </div>
  )
}

function Card({ p, large }: { p: Product; large: boolean }) {
  const isVideo = p.hero_visual?.includes('.mp4') || p.hero_visual?.includes('/video/upload/')
  const poster  = p.editorial_visual
    ?? p.hero_visual
        ?.replace('/upload/', '/upload/so_2.0,f_jpg,w_800,c_fit/')
        ?.replace(/\.mp4$/, '.jpg')

  return (
    <article style={{ background:'#101010', border:'1px solid #181818', overflow:'hidden' }}>

      {/* Media */}
      <div style={{ aspectRatio:'4/5', overflow:'hidden', background:'#0c0c0c', position:'relative' }}>
        {p.hero_visual && isVideo ? (
          <video autoPlay muted loop playsInline poster={poster ?? undefined}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}>
            <source src={p.hero_visual} type="video/mp4" />
          </video>
        ) : p.hero_visual ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={p.hero_visual} alt={p.name}
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
        ) : (
          <div style={{ width:'100%', height:'100%' }} />
        )}

        {p.category && (
          <span style={{
            position:'absolute', top:14, left:14,
            background:'rgba(0,0,0,0.72)', color:'#c9a84c',
            fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase',
            padding:'4px 10px', fontFamily:'Georgia,serif',
          }}>
            {p.category}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: large ? '24px 24px 28px' : '18px 18px 22px' }}>
        <h3 style={{
          margin:0, color:'#e4dcc8', fontFamily:'Georgia,serif',
          fontWeight:400, fontSize: large ? 20 : 16, letterSpacing:'0.03em',
        }}>
          {p.name}
        </h3>
        {p.subtitle && (
          <p style={{ margin:'7px 0 0', color:'#5a5248', fontSize:11, lineHeight:1.65, fontStyle:'italic' }}>
            {p.subtitle}
          </p>
        )}
        <p style={{
          margin:'10px 0 0', color:'#2e2e2e', fontSize:9,
          letterSpacing:'0.18em', textTransform:'uppercase', fontFamily:'Georgia,serif',
        }}>
          {p.sku}
        </p>
      </div>
    </article>
  )
}
