// ============================================================
//  Resolve the real buyer IP from request headers.
//  `Astro.clientAddress` is NOT supported by the @astrojs/cloudflare
//  adapter (workerd), so read Cloudflare's `CF-Connecting-IP` — the
//  true client IP — falling back to the first `X-Forwarded-For` hop
//  when running behind another proxy. Forwarded to Shopify as
//  `Shopify-Storefront-Buyer-IP` so bot rate-limiting attributes to
//  the shopper, not to the worker's egress IP.
// ============================================================
export function getBuyerIp(request: Request): string | undefined {
  const cf = request.headers.get('cf-connecting-ip');
  if (cf) return cf;
  const first = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return first || undefined;
}
