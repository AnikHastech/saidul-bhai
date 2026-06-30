// ============================================================
//  Per-request context (server only). Holds the buyer's selected
//  market (country + currency + display rate) so the Shopify
//  client can localize via @inContext(country:) and the transforms
//  can convert display prices when Markets isn't active.
//  Populated by src/middleware.ts.
// ============================================================
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestCtx {
  /** ISO-3166-1 alpha-2 country code, uppercase (e.g. "US", "GB"). */
  country: string;
  /** ISO-4217 currency code to display (e.g. "USD", "GBP"). */
  currency: string;
  /** Conversion factor from the catalogue base currency to `currency`. */
  rate: number;
}

// Single ALS instance shared across ALL server chunks. The middleware and the
// Shopify services can be bundled into separate SSR chunks; a per-chunk
// `new AsyncLocalStorage()` would silently break getStore() (run() on one
// instance, read on another). Pinning it to a global symbol guarantees one.
const ALS_KEY = Symbol.for('asmaz.requestContext');
const globalAny = globalThis as unknown as Record<symbol, AsyncLocalStorage<RequestCtx> | undefined>;
export const requestContext: AsyncLocalStorage<RequestCtx> =
  globalAny[ALS_KEY] ?? (globalAny[ALS_KEY] = new AsyncLocalStorage<RequestCtx>());

/** Cookie that persists the shopper's chosen market/country. */
export const COUNTRY_COOKIE = 'asmaz_country';

/** Fallback when no cookie is set or outside a request (e.g. build). */
export const DEFAULT_COUNTRY = 'US';

/** The current request's country, or the default. */
export function currentCountry(): string {
  return requestContext.getStore()?.country ?? DEFAULT_COUNTRY;
}

/** The current request's display currency + conversion rate. */
export function currentMarket(): { currency: string; rate: number } {
  const s = requestContext.getStore();
  return { currency: s?.currency ?? 'USD', rate: s?.rate ?? 1 };
}

/** Validate a 2-letter ISO country code. */
export function isValidCountry(code: unknown): code is string {
  return typeof code === 'string' && /^[A-Za-z]{2}$/.test(code);
}
