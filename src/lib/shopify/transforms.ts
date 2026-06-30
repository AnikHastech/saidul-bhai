// ============================================================
//  Transforms — flatten Shopify edges/node envelopes into the
//  clean domain shapes defined in types.ts. Prices are localized
//  to the buyer's selected market here: when Shopify already
//  returned that currency (Markets enabled) it's a no-op; otherwise
//  amounts are converted from the base currency for display.
// ============================================================
import type {
  Article,
  Cart,
  CartLine,
  Collection,
  PageInfo,
  Paginated,
  Product,
  ProductCard,
  ProductVariant,
} from './types';
import { currentMarket } from '~/lib/request-context';

// Raw shapes only need the connection-ish bits typed loosely.
type Raw = Record<string, any>;

/** Convert a single { amount, currencyCode } to the selected market currency. */
function convMoney<T extends Raw | null | undefined>(m: T): T {
  if (!m || (m as Raw).amount == null) return m;
  const { currency, rate } = currentMarket();
  // Already in the target currency (real Shopify Markets), or no conversion.
  if (rate === 1 || (m as Raw).currencyCode === currency) return m;
  const n = Number((m as Raw).amount);
  if (!Number.isFinite(n)) return m;
  const converted = n * rate;
  return {
    ...(m as Raw),
    amount: Number.isInteger(converted) ? String(converted) : converted.toFixed(2),
    currencyCode: currency,
  } as T;
}

/** Convert a priceRange-style object (min/max variant prices). */
function convRange<T extends Raw | null | undefined>(r: T): T {
  if (!r) return r;
  const out: Raw = { ...(r as Raw) };
  if (out.minVariantPrice) out.minVariantPrice = convMoney(out.minVariantPrice);
  if (out.maxVariantPrice) out.maxVariantPrice = convMoney(out.maxVariantPrice);
  return out as T;
}

/** Money-bearing keys on a cart/line cost object. */
const COST_MONEY_KEYS = [
  'totalAmount',
  'subtotalAmount',
  'totalTaxAmount',
  'totalDutyAmount',
  'amountPerQuantity',
  'compareAtAmountPerQuantity',
  'checkoutChargeAmount',
];

/** Convert every Money field on a cart/line cost object. */
function convCost<T extends Raw | null | undefined>(cost: T): T {
  if (!cost) return cost;
  const out: Raw = { ...(cost as Raw) };
  for (const k of COST_MONEY_KEYS) if (out[k]) out[k] = convMoney(out[k]);
  return out as T;
}

interface Edge<T> {
  cursor?: string;
  node: T;
}
interface Connection<T> {
  edges?: Edge<T>[];
  pageInfo?: PageInfo;
}

/** Pull the node list out of a Relay-style connection. */
export function nodes<T>(connection?: Connection<T> | null): T[] {
  return connection?.edges?.map((e) => e.node) ?? [];
}

const EMPTY_PAGE_INFO: PageInfo = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: null,
  endCursor: null,
};

/** Flatten a connection into { items, pageInfo }. */
export function paginate<TRaw, TOut>(
  connection: Connection<TRaw> | null | undefined,
  map: (node: TRaw) => TOut,
): Paginated<TOut> {
  return {
    items: nodes(connection).map(map),
    pageInfo: connection?.pageInfo ?? EMPTY_PAGE_INFO,
  };
}

export function mapProductCard(p: Raw): ProductCard {
  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    vendor: p.vendor,
    productType: p.productType ?? '',
    availableForSale: p.availableForSale ?? true,
    firstVariantId: nodes(p.variants)?.[0]?.id ?? '',
    options: p.options ?? [],
    cardVariants: nodes(p.variants).map((v: Raw) => ({
      id: v.id,
      title: v.title ?? '',
      availableForSale: v.availableForSale ?? true,
      selectedOptions: v.selectedOptions ?? [],
      price: convMoney(v.price),
      image: v.image ?? null,
    })),
    featuredImage: p.featuredImage ?? null,
    priceRange: convRange(p.priceRange),
    compareAtPriceRange: convRange(p.compareAtPriceRange),
  };
}

export function mapVariant(v: Raw): ProductVariant {
  return {
    id: v.id,
    title: v.title,
    sku: v.sku ?? null,
    availableForSale: v.availableForSale ?? false,
    quantityAvailable: v.quantityAvailable ?? null,
    selectedOptions: v.selectedOptions ?? [],
    price: convMoney(v.price),
    compareAtPrice: convMoney(v.compareAtPrice ?? null),
    image: v.image ?? null,
  };
}

export function mapProduct(p: Raw): Product {
  return {
    id: p.id,
    title: p.title,
    handle: p.handle,
    description: p.description ?? '',
    descriptionHtml: p.descriptionHtml ?? '',
    vendor: p.vendor ?? '',
    productType: p.productType ?? '',
    tags: p.tags ?? [],
    availableForSale: p.availableForSale ?? false,
    featuredImage: p.featuredImage ?? null,
    images: nodes(p.images),
    priceRange: convRange(p.priceRange),
    compareAtPriceRange: convRange(p.compareAtPriceRange),
    options: p.options ?? [],
    variants: nodes(p.variants).map(mapVariant),
    seo: p.seo ?? {},
  };
}

export function mapArticle(a: Raw): Article {
  return {
    id: a.id,
    title: a.title,
    handle: a.handle,
    excerpt: a.excerpt ?? '',
    contentHtml: a.contentHtml ?? '',
    image: a.image ?? null,
    publishedAt: a.publishedAt ?? null,
    author: a.authorV2?.name ?? null,
    seo: a.seo ?? {},
  };
}

export function mapCollection(c: Raw): Collection {
  return {
    id: c.id,
    title: c.title,
    handle: c.handle,
    description: c.description ?? '',
    descriptionHtml: c.descriptionHtml ?? '',
    image: c.image ?? null,
    seo: c.seo ?? {},
  };
}

function mapCartLine(l: Raw): CartLine {
  return {
    id: l.id,
    quantity: l.quantity,
    cost: convCost(l.cost),
    merchandise: {
      id: l.merchandise?.id,
      title: l.merchandise?.title,
      availableForSale: l.merchandise?.availableForSale ?? true,
      selectedOptions: l.merchandise?.selectedOptions ?? [],
      price: convMoney(l.merchandise?.price),
      image: l.merchandise?.image ?? null,
      product: l.merchandise?.product,
    },
  };
}

export function mapCart(c: Raw | null | undefined): Cart | null {
  if (!c) return null;
  return {
    id: c.id,
    checkoutUrl: c.checkoutUrl,
    totalQuantity: c.totalQuantity ?? 0,
    note: c.note ?? null,
    buyerIdentity: c.buyerIdentity ?? null,
    cost: convCost(c.cost),
    lines: nodes(c.lines).map(mapCartLine),
  };
}
