import Script from 'next/script'
import { DrawerProvider } from '@/components/layout/DrawerContext'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import NavMenuData from '@/components/layout/NavMenuData'
import InquiryDrawer from '@/components/layout/InquiryDrawer'
import ConciergeDrawer from '@/components/layout/ConciergeDrawer'
import SearchOverlay from '@/components/layout/SearchOverlay'

// No getNonce() here, deliberately. Reading the nonce calls headers(), and that
// one call opts every route under this layout out of static rendering — see the
// CSP note in proxy.ts. The public policy allows these by host instead.

const GA4_ID = 'G-92GPTNTY00'
const FB_PIXEL_ID = '295592213952476'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Zoho PageSense. This used to be an inline IIFE whose entire body was a
          document.createElement of this same script tag; loading it directly
          does the same job without needing an inline-script allowance, and puts
          the host in the CSP rather than relying on nonce propagation. */}
      <Script
        strategy="lazyOnload"
        src="https://cdn.pagesense.io/js/bezambarinc657/b68a8dcb9f314cfd85f99b87f9cf95a8.js"
      />

      {/* GA4 — respects Consent Mode v2 default set in root layout */}
      <Script strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} />
      <Script id="gtag-init" strategy="afterInteractive">{`
        window.dataLayer=window.dataLayer||[];
        function gtag(){dataLayer.push(arguments);}
        gtag('js',new Date());
        gtag('config','${GA4_ID}',{send_page_view:true});
      `}</Script>

      {/* Facebook Pixel — custom audiences only (not WooCommerce pixel) */}
      <Script id="fb-pixel" strategy="afterInteractive">{`
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
        (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','${FB_PIXEL_ID}');
        fbq('track','PageView');
      `}</Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img height="1" width="1" style={{display:'none'}}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
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
              'Independent jewelry designer and maker based in Los Angeles. Co-Inventor of the modern Princess Cut. Creator of the patented Blaze® and Elysian Cut™ diamond cuts.',
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
