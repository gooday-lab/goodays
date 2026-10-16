import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Phase 2: static build. Content is fetched from Supabase at build time
// (see src/lib/content.ts) and rendered into real HTML — best for SEO.
export default defineConfig({
  site: 'https://goodays.pages.dev',
  integrations: [sitemap()]
});
