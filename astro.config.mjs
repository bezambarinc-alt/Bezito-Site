import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/static';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://bezambar.com',
  output: 'static',
  adapter: vercel(),
  vite: {
    build: {
      rollupOptions: {
        // pagefind.js is generated after the astro build — don't resolve at bundle time
        external: ['/pagefind/pagefind.js'],
      },
    },
  },
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
