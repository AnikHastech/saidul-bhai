import clsx, { type ClassValue } from 'clsx';

/** Tailwind-friendly conditional class joiner. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Fallback display currency, used only when a price arrives without a
 * currency code. Real prices come from Shopify in the buyer's chosen market
 * currency (localized via @inContext(country:) — see lib/request-context.ts),
 * and `formatMoney` renders that actual currency.
 */
export const STORE_CURRENCY = 'USD';

/** Format a money value in its own (Shopify presentment) currency. */
export function formatMoney(
  amount: string | number | null | undefined,
  currencyCode: string = STORE_CURRENCY,
  locale = 'en-US',
): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  const currency = currencyCode || STORE_CURRENCY;
  const opts: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    // Keep cents only when present (whole amounts render clean).
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
  };
  try {
    return new Intl.NumberFormat(locale, opts).format(n);
  } catch {
    // Unknown/invalid currency code → fall back to the store currency.
    return new Intl.NumberFormat(locale, { ...opts, currency: STORE_CURRENCY }).format(n);
  }
}

/** True when compareAtPrice is a real, higher price (Shopify returns "0.0"/null otherwise). */
export function isOnSale(
  price?: { amount: string } | null,
  compareAt?: { amount: string } | null,
): boolean {
  const p = Number(price?.amount);
  const c = Number(compareAt?.amount);
  return Number.isFinite(p) && Number.isFinite(c) && c > p;
}

/** Discount percentage as a rounded integer, or null when not a meaningful (>=1%) markdown. */
export function discountPercent(
  price?: { amount: string } | null,
  compareAt?: { amount: string } | null,
): number | null {
  if (!isOnSale(price, compareAt)) return null;
  const p = Number(price!.amount);
  const c = Number(compareAt!.amount);
  const pct = Math.round(((c - p) / c) * 100);
  return pct >= 1 ? pct : null;
}

/** Extract the numeric id from a Shopify gid:// global id. */
export function parseGid(gid: string): string {
  return gid?.split('/').pop() ?? gid;
}
