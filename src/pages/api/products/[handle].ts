// GET /api/products/[handle] — returns full Product JSON for Quick View modal
import type { APIRoute } from 'astro';
import { getProduct } from '~/lib/shopify';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const handle = params.handle ?? '';
  if (!handle) return new Response(null, { status: 400 });

  const product = await getProduct(handle);
  if (!product) return new Response(null, { status: 404 });

  return new Response(JSON.stringify(product), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
