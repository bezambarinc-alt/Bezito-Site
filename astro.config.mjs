import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/static';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bezambar.com',
  output: 'static',
  adapter: vercel(),
  integrations: [
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    sitemap({
      filter: (page) =>
        !page.includes('/product-template') &&
        !page.includes('/category-template'),
    }),
  ],
});
