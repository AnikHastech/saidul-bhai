// ============================================================
//  /sitemap.xml — indexable routes: static pages, team profiles,
//  and (when Shopify is reachable) every collection, product, and
//  journal article. Functional pages (cart/search/compare/account)
//  are intentionally excluded — they're noindex. Degrades to the
//  static set if Shopify is unavailable.
// ============================================================
import type { APIRoute } from 'astro';
import { getAllCollections, getProducts, getArticles } from '~/lib/shopify';
import { TEAM } from '~/data/team';

export const prerender = false;

const STATIC_PATHS = [
  '/',
  '/products',
  '/collections',
  '/journal',
  '/pages/about',
  '/pages/contact',
  '/pages/changelog',
  '/pages/licenses',
];

// Safety cap so a huge catalogue can't make the sitemap unbounded.
const MAX_PRODUCT_PAGES = 8; // up to 8 × 250 = 2000 products

const iso = (d?: string | null) => {
  if (!d) return undefined;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? undefined : t.toISOString().slice(0, 10);
};

export const GET: APIRoute = async ({ url }) => {
  const origin = url.origin;
  // path -> lastmod (YYYY-MM-DD) | undefined
  const entries = new Map<string, string | undefined>();
  const add = (path: string, lastmod?: string) => {
    if (!entries.has(path)) entries.set(path, lastmod);
  };

  STATIC_PATHS.forEach((p) => add(p));
  TEAM.forEach((m) => add(`/team/${m.slug}`));

  // Collections + articles (independent, best-effort).
  const [colRes, artRes] = await Promise.allSettled([
    getAllCollections(),
    getArticles('news', 100),
  ]);
  if (colRes.status === 'fulfilled')
    colRes.value.forEach((c) => add(`/collections/${c.handle}`));
  if (artRes.status === 'fulfilled')
    artRes.value.forEach((a) => add(`/journal/${a.handle}`, iso(a.publishedAt)));

  // Products — paginate through the catalogue (best-effort).
  try {
    let after: string | undefined;
    let pages = 0;
    do {
      const res = await getProducts({ pageSize: 250, after, sortKey: 'BEST_SELLING' });
      res.items.forEach((p) => add(`/products/${p.handle}`));
      after = res.pageInfo.hasNextPage ? (res.pageInfo.endCursor ?? undefined) : undefined;
      pages++;
    } while (after && pages < MAX_PRODUCT_PAGES);
  } catch {
    /* leave the static + collection/article set */
  }

  const urls = [...entries]
    .map(
      ([loc, lastmod]) =>
        `  <url><loc>${origin}${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
