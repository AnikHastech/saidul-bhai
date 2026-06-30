// ============================================================
//  Faceted-filter URL helpers (SSR, shareable, no-JS).
//  Selected facet values are carried in repeatable `f` params,
//  each holding the Shopify filter value's `input` JSON verbatim.
//  Price uses `price_min` / `price_max`. Everything round-trips
//  through the URL so filters survive sort + pagination.
// ============================================================
import type { ProductFilter } from '~/lib/shopify/types';

/** Stable string form of a filter input for equality checks. */
function normalize(jsonStr: string): string {
  try {
    return JSON.stringify(JSON.parse(jsonStr));
  } catch {
    return jsonStr;
  }
}

/** Parse the request URL into Shopify ProductFilter[] inputs. */
export function parseFilters(url: URL): ProductFilter[] {
  const out: ProductFilter[] = [];
  for (const raw of url.searchParams.getAll('f')) {
    try {
      out.push(JSON.parse(raw) as ProductFilter);
    } catch {
      /* skip malformed */
    }
  }
  const min = url.searchParams.get('price_min');
  const max = url.searchParams.get('price_max');
  if (min || max) {
    const price: { min?: number; max?: number } = {};
    if (min && Number.isFinite(Number(min))) price.min = Number(min);
    if (max && Number.isFinite(Number(max))) price.max = Number(max);
    if (price.min != null || price.max != null) out.push({ price } as ProductFilter);
  }
  return out;
}

/** Is a given facet value (by its `input` JSON) currently selected? */
export function isFilterActive(url: URL, input: string): boolean {
  const target = normalize(input);
  return url.searchParams.getAll('f').some((raw) => normalize(raw) === target);
}

/** Href that toggles a facet value on/off; always resets the cursor. */
export function toggleFilterHref(url: URL, input: string): string {
  const params = new URLSearchParams(url.search);
  const target = normalize(input);
  const existing = params.getAll('f');
  params.delete('f');
  let removed = false;
  for (const raw of existing) {
    if (normalize(raw) === target) {
      removed = true;
      continue;
    }
    params.append('f', raw);
  }
  if (!removed) params.append('f', input);
  params.delete('after');
  params.delete('before');
  return withQuery(url.pathname, params);
}

/** Href that clears every active filter (keeps sort). */
export function clearFiltersHref(url: URL): string {
  const params = new URLSearchParams(url.search);
  for (const k of ['f', 'price_min', 'price_max', 'after', 'before']) params.delete(k);
  return withQuery(url.pathname, params);
}

export function hasActiveFilters(url: URL): boolean {
  return (
    url.searchParams.getAll('f').length > 0 ||
    !!url.searchParams.get('price_min') ||
    !!url.searchParams.get('price_max')
  );
}

/** Count of active facet selections (for the "Refine (N)" label). */
export function activeFilterCount(url: URL): number {
  let n = url.searchParams.getAll('f').length;
  if (url.searchParams.get('price_min') || url.searchParams.get('price_max')) n += 1;
  return n;
}

/** Param name/value pairs to re-emit as hidden inputs in GET forms. */
export function paramPairs(url: URL, exclude: string[] = []): Array<{ name: string; value: string }> {
  const out: Array<{ name: string; value: string }> = [];
  for (const [name, value] of url.searchParams.entries()) {
    if (!exclude.includes(name)) out.push({ name, value });
  }
  return out;
}

function withQuery(pathname: string, params: URLSearchParams): string {
  const qs = params.toString();
  return `${pathname}${qs ? `?${qs}` : ''}`;
}
