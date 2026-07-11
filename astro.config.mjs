import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/static';
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
        output: {
          // Vite names the shared global CSS chunk after the first alphabetical
          // page that consumes Layout.astro (currently 'about-bez-ambar'), which
          // makes Lighthouse look like about-page CSS is loading on every page.
          // This function renames all extracted CSS to 'styles.[hash].css' so the
          // output is clearly build-generated rather than page-specific.
          assetFileNames: ({ name }) => {
            if (name?.endsWith('.css')) return '_astro/styles.[hash][extname]';
            return '_astro/[name].[hash][extname]';
          },
        },
      },
    },
  },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/product-template') &&
        !page.includes('/category-template'),
    }),
  ],
});
