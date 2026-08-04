import Image from 'next/image'
import Link from 'next/link'
import { getAllProducts } from '@/lib/queries'
import styles from './ArchiveGrid.module.css'

/**
 * Async server component — streams inside a <Suspense> boundary so the archive
 * shell + filters render immediately while the ~500-piece grid loads.
 */
export default async function ArchiveGrid() {
  let products
  try {
    products = await getAllProducts()
  } catch {
    products = []
  }

  if (products.length === 0) {
    return <p className={styles.empty}>The archive is being catalogued. Please check back shortly.</p>
  }

  return (
    <div className={styles.masonry}>
      {products.map((p) => {
        const media = p.media[0]
        const category = (p.specs.category ?? 'jewelry').toLowerCase()
        return (
          <Link key={p.sku} href={`/jewelry/${category}/${p.sku}`} className={styles.tile}>
            {media?.type === 'video' ? (
              <video muted loop playsInline preload="none" poster={media.poster} className={styles.media}>
                <source src={media.url} type="video/mp4" />
              </video>
            ) : media?.url ? (
              <Image src={media.url} alt={p.name} width={400} height={520} sizes="(max-width:720px) 50vw, 25vw" className={styles.media} />
            ) : (
              <div className={styles.placeholder} aria-hidden />
            )}
            <span className={styles.caption}>{p.name}</span>
          </Link>
        )
      })}
    </div>
  )
}

export function ArchiveGridSkeleton() {
  return (
    <div className={styles.masonry} aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className={styles.skeleton} style={{ height: `${240 + (i % 4) * 60}px` }} />
      ))}
    </div>
  )
}
