import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bez Ambar',
  description: 'Fine Diamond Jewelry',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, background: '#080808', WebkitFontSmoothing: 'antialiased' }}>
        {children}
      </body>
    </html>
  )
}
