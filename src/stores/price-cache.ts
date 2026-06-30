// Client-side cache: variantId → displayed price (amount + currency).
// Captured at add-to-cart time from the price the shopper actually saw (in
// their chosen market currency) and read back in the cart drawer, so the
// drawer always matches the catalogue regardless of the raw cart presentment.
const KEY = 'asmaz:price-cache';
const isBrowser = typeof window !== 'undefined';

export interface CachedMoney {
  amount: string;
  currencyCode: string;
}

type Cache = Record<string, CachedMoney>;

function read(): Cache {
  if (!isBrowser) return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Cache;
  } catch {
    return {};
  }
}

export function cachePrice(variantId: string, price: CachedMoney): void {
  if (!isBrowser) return;
  const c = read();
  c[variantId] = price;
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch { /* quota / private mode */ }
}

export function getCachedPrice(variantId: string): CachedMoney | null {
  return read()[variantId] ?? null;
}
