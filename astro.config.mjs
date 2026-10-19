// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://gerhardt-gmbh.de',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  adapter: vercel({ webAnalytics: { enabled: false } }),
  integrations: [sitemap()],
  image: {
    breakpoints: [480, 768, 1080, 1440, 1920, 2400],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
