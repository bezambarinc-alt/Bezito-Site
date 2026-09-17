import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Generated build cache from the abandoned Astro migration, plus Playwright
    // output. Both were committed; neither is hand-written source, and between
    // them they produced every lint error that survived the audit fixes. Now
    // gitignored as well — see .gitignore.
    '.astro/**',
    'test-results/**',
    'playwright-report/**',
  ]),
])

export default eslintConfig
