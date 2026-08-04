import { sql } from '@/lib/db'

export default async function AdminPage() {
  const pages = await sql<{ slug: string; title: string; status: string; updated_at: string }>(
    `SELECT slug, title, status, updated_at FROM pages ORDER BY updated_at DESC`,
  )
  const [{ count: leadCount }] = await sql<{ count: string }>(`SELECT COUNT(*) as count FROM leads`)
  const [{ count: productCount }] = await sql<{ count: string }>(`SELECT COUNT(*) as count FROM products`)

  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'Georgia, serif' }}>Bez Ambar — Admin</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ border: '1px solid #eee', padding: '1rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{pages.length}</div>
          <div style={{ color: '#666' }}>Pages</div>
        </div>
        <div style={{ border: '1px solid #eee', padding: '1rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{leadCount}</div>
          <div style={{ color: '#666' }}>Leads</div>
        </div>
        <div style={{ border: '1px solid #eee', padding: '1rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{productCount}</div>
          <div style={{ color: '#666' }}>Products (cached)</div>
        </div>
      </div>

      <h2>Live Pages</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem' }}>Slug</th>
            <th style={{ padding: '0.5rem' }}>Title</th>
            <th style={{ padding: '0.5rem' }}>Status</th>
            <th style={{ padding: '0.5rem' }}>Updated</th>
          </tr>
        </thead>
        <tbody>
          {pages.map(p => (
            <tr key={p.slug} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '0.5rem' }}>
                <a href={`/client/${p.slug}`} target="_blank" rel="noreferrer">{p.slug}</a>
              </td>
              <td style={{ padding: '0.5rem' }}>{p.title}</td>
              <td style={{ padding: '0.5rem' }}>{p.status}</td>
              <td style={{ padding: '0.5rem', color: '#666', fontSize: '0.8rem' }}>
                {new Date(p.updated_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
