// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://gerhardt-gmbh.de',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  adapter: vercel({ webAnalytics: { enabled: false } }),
  integrations: [sitemap()],
  // Fonts selbst gehostet, mit metrisch angeglichenen Ersatzschriften gegen Layout-Sprünge beim Laden
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Fraunces',
      cssVariable: '--font-fraunces',
      fallbacks: ['serif'],
      options: { variants: [{ src: ['./src/assets/fonts/fraunces-latin-opsz.woff2'], weight: '100 900', style: 'normal' }] },
    },
    {
      provider: fontProviders.local(),
      name: 'Hanken Grotesk',
      cssVariable: '--font-hanken',
      fallbacks: ['sans-serif'],
      options: { variants: [{ src: ['./src/assets/fonts/hanken-grotesk-latin-wght.woff2'], weight: '100 900', style: 'normal' }] },
    },
  ],
  image: {
    breakpoints: [480, 768, 1080, 1440, 1920, 2400],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
