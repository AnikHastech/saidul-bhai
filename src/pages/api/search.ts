// GET /api/search?q=...&category=... — predictive (instant) search proxy.
// Without `category` it runs Shopify's global predictive search. With a
// `category` (collection handle) it scopes suggestions to that collection's
// products only, so the header search respects the selected category.
import type { APIRoute } from 'astro';
import { predictiveSearch, getCollection } from '~/lib/shopify';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const EMPTY = { products: [], collections: [], queries: [] };

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q')?.trim() ?? '';
  const category = url.searchParams.get('category')?.trim() ?? '';
  if (q.length < 2) return json(EMPTY);

  try {
    if (category) {
      // Scoped: filter the chosen collection's products by the query.
      const col = await getCollection({ handle: category, pageSize: 100 });
      const ql = q.toLowerCase();
      const products = (col?.products.items ?? [])
        .filter(
          (p) =>
            p.title.toLowerCase().includes(ql) ||
            (p.vendor ?? '').toLowerCase().includes(ql) ||
            (p.productType ?? '').toLowerCase().includes(ql),
        )
        .slice(0, 8)
        .map((p) => ({
          id: p.id,
          title: p.title,
          handle: p.handle,
          featuredImage: p.featuredImage
            ? { url: p.featuredImage.url, altText: p.featuredImage.altText }
            : null,
          priceRange: { minVariantPrice: p.priceRange.minVariantPrice },
        }));
      return json({ products, collections: [], queries: [] });
    }

    // Unscoped: Shopify global predictive search.
    return json(await predictiveSearch(q));
  } catch (err) {
    return json({ error: (err as Error).message }, 500);
  }
};
