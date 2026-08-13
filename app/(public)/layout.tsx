import { DrawerProvider } from '@/components/layout/DrawerContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import NavMenuData from '@/components/layout/NavMenuData'
import InquiryDrawer from '@/components/layout/InquiryDrawer'
import ConciergeDrawer from '@/components/layout/ConciergeDrawer'
import SearchOverlay from '@/components/layout/SearchOverlay'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'JewelryStore',
            '@id': 'https://bezambar.com/#organization',
            name: 'Bez Ambar',
            url: 'https://bezambar.com',
            description:
              'Independent jewelry designer and maker based in Los Angeles. Inventor of the Princess Cut. Creator of the patented Blaze® and Elysian Cut™ diamond cuts.',
            logo: { '@type': 'ImageObject', url: 'https://bezambar.com/logo.svg', width: 200, height: 60 },
            address: {
              '@type': 'PostalAddress',
              streetAddress: '611 Wilshire Blvd',
              addressLocality: 'Los Angeles',
              addressRegion: 'CA',
              postalCode: '90017',
              addressCountry: 'US',
            },
            telephone: '+12136299191',
            email: 'bez@bezambar.com',
            foundingDate: '1979',
            sameAs: [
              'https://www.instagram.com/bezambarjewelry/',
              'https://www.pinterest.com/bezambarinc/',
              'https://www.youtube.com/@BezAmbarInc/',
              'https://www.tiktok.com/@bezambar',
              'https://www.linkedin.com/in/bez-ambar-869936a/',
            ],
          }),
        }}
      />
      <DrawerProvider>
        <Header />
        {children}
        <Footer />
        <NavMenuData />
        <InquiryDrawer />
        <ConciergeDrawer />
        <SearchOverlay />
      </DrawerProvider>
    </>
  )
}
