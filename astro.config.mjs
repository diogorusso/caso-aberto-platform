import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { readFileSync } from 'node:fs';

const { base_url } = JSON.parse(readFileSync(new URL('./src/data/site.json', import.meta.url), 'utf8'));
const site = (process.env.PUBLIC_SITE_URL || base_url || '').trim().replace(/\/$/, '');

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  ...(site ? { site } : {}),
  integrations: [react(), ...(site ? [sitemap()] : [])],
});
