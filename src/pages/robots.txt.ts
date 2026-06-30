// ============================================================
//  /robots.txt — generated so the Sitemap directive is an
//  ABSOLUTE URL (required by the robots spec) on whatever host
//  the storefront is deployed to. Mirrors sitemap.xml.ts.
// ============================================================
import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  // Use the actual request host so robots + sitemap always agree on any deploy.
  const origin = url.origin;
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    '# Keep auth + API endpoints out of the index',
    'Disallow: /account/',
    'Disallow: /api/',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
