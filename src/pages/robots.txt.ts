import type { APIRoute } from 'astro';
import { indexable } from '../config/site';

// Vorschau-Builds sperren Suchmaschinen aus. Erst mit PUBLIC_INDEXABLE=true (Go-live) wird indexiert.
export const GET: APIRoute = ({ site }) => {
  const body = indexable
    ? `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`
    : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
