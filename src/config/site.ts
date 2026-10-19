// Zentrale Firmendaten und Schalter. Quelle der Fakten: Impressum und Über uns der Live-Seite (audit/AUDIT.md).

export const company = {
  name: 'Gerhardt GmbH',
  owner: 'Thomas Gerhardt',
  founded: 1998,
  poolSince: 2015,
  street: 'Max-Planck-Ring 11',
  zip: '65205',
  city: 'Wiesbaden',
  district: 'Wiesbaden-Delkenheim',
  phone: '06122 70770-00',
  phoneHref: 'tel:+4961227077000',
  email: 'info@gerhardt-gmbh.de',
  instagram: 'https://www.instagram.com/gerhardtgmbh/',
  facebook: 'https://www.facebook.com/profile.php?id=100090561580451',
} as const;

/** {{PREISANKER}}: Stand Live-Seite. Änderung nur nach Freigabe (CONTENT-TODO E1). */
export const priceAnchor = { value: 120_000, label: 'ab 120.000 €' } as const;

/** Hero-Headline A ist Default. B und C lassen sich per ?hero=B bzw. ?hero=C ansehen. */
export const heroHeadlines = {
  A: 'Pools, die zum Haus gehören.',
  B: 'Als wäre er schon immer hier gewesen.',
  C: 'Poolarchitektur im Rhein-Main-Gebiet.',
} as const;

export const flags = {
  /** Bauherren-Zitate erst einblenden, wenn freigegebene Inhalte vorliegen (CONTENT-TODO C3). */
  testimonials: false,
} as const;

/** Indexierung nur, wenn beim Build PUBLIC_INDEXABLE=true gesetzt ist (Go-live). Previews bleiben noindex. */
export const indexable = import.meta.env.PUBLIC_INDEXABLE === 'true';

/** Navigation. Solange Unterseiten fehlen, zeigen die Einträge auf Sektionen der Startseite. */
export const navigation = [
  { label: 'Projekte', href: '/#projekte' },
  { label: 'Ein System', href: '/#system' },
  { label: 'Ablauf', href: '/#ablauf' },
  { label: 'Investition', href: '/#investition' },
  { label: 'Über uns', href: '/#versprechen' },
] as const;

export const legalLinks = [
  { label: 'Impressum', href: '/impressum' },
  { label: 'Datenschutz', href: '/datenschutz' },
] as const;
