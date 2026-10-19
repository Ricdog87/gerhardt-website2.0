import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projekte = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projekte' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      order: z.number(),
      ort: z.string(),
      region: z.enum(['wiesbaden', 'taunus', 'frankfurt', 'mainz']),
      projektart: z.enum(['bestand', 'neubau']),
      sanierung: z.boolean().default(false),
      projektartLabel: z.string(),
      untertitel: z.string(),
      pool: z.object({
        masse: z.string(),
        typ: z.enum(['skimmer', 'ueberlauf']),
        gegenstromanlage: z.boolean().default(false),
      }),
      kostenrahmen: z.number(),
      kostenLabel: z.string(),
      bauzeit: z.string().optional(),
      headline: z.string(),
      story: z.array(z.string()),
      leistungen: z.array(z.string()),
      cover: image(),
      coverAlt: z.string(),
      coverPosition: z.string().default('50% 50%'),
      /** Querformat für Vollbild-Szenen und Projekt-Hero */
      hero: image(),
      heroAlt: z.string(),
      heroPosition: z.string().default('50% 50%'),
      alteUrl: z.string(),
    }),
});

const faq = defineCollection({
  loader: file('src/content/faq/pool.json'),
  schema: z.object({
    order: z.number(),
    frage: z.string(),
    antwort: z.string(),
    /** Antwort fehlt noch: sichtbar als Platzhalter, nicht im FAQPage-Schema */
    platzhalter: z.string().optional(),
  }),
});

const recht = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/recht' }),
  schema: z.object({ title: z.string(), description: z.string() }),
});

export const collections = { projekte, faq, recht };
