// ============================================================
//  Shopify Storefront API client (server-side, private token)
// ============================================================
// All Shopify traffic flows through here. It is imported only by
// server code (Astro frontmatter + /api routes), so the private
// token never reaches the browser.
import { currentCountry } from '~/lib/request-context';

/** Read an env var from build-time inline (dev) or runtime process.env (prod node). */
function env(key: string): string | undefined {
  const meta = (import.meta.env as Record<string, string | undefined>)[key];
  if (meta) return meta;
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  return proc?.env?.[key];
}

const DOMAIN = env('SHOPIFY_SHOP_DOMAIN');
const VERSION = env('SHOPIFY_API_VERSION') ?? '2026-04';
const TOKEN = env('SHOPIFY_STOREFRONT_PRIVATE_TOKEN');

// Optional full-endpoint override. Lets you point at a Storefront-API-
// compatible endpoint that needs no token — e.g. Shopify's demo mock
// `https://mock.shop/api`. Server-only (no PUBLIC_ prefix). When set, the
// domain/token are not required and the private-token header is omitted.
const ENDPOINT_OVERRIDE = env('SHOPIFY_STOREFRONT_ENDPOINT');

const ENDPOINT = ENDPOINT_OVERRIDE || `https://${DOMAIN}/api/${VERSION}/graphql.json`;

export class ShopifyError extends Error {
  status?: number;
  details?: unknown;
  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ShopifyError';
    this.status = status;
    this.details = details;
  }
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export interface ShopifyFetchOptions {
  /** Real buyer IP — forwarded so Shopify's bot rate-limiting attributes correctly. */
  buyerIp?: string;
}

/**
 * Execute a Storefront GraphQL operation. Throws ShopifyError on
 * transport or GraphQL errors; otherwise returns the typed `data`.
 */
export async function shopifyFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: ShopifyFetchOptions = {},
): Promise<T> {
  if (!ENDPOINT_OVERRIDE && (!DOMAIN || !TOKEN)) {
    throw new ShopifyError(
      'Missing Shopify config. Set SHOPIFY_SHOP_DOMAIN and SHOPIFY_STOREFRONT_PRIVATE_TOKEN (or SHOPIFY_STOREFRONT_ENDPOINT) in .env',
    );
  }

  // Localize prices: operations that declare a `$country` variable get the
  // buyer's market injected automatically (Shopify @inContext(country:)).
  const vars: Record<string, unknown> =
    query.includes('$country') && variables.country == null
      ? { ...variables, country: currentCountry() }
      : variables;

  let res: Response;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Private token only on the real Storefront API; mock endpoints need none.
        ...(TOKEN && !ENDPOINT_OVERRIDE ? { 'Shopify-Storefront-Private-Token': TOKEN } : {}),
        ...(options.buyerIp ? { 'Shopify-Storefront-Buyer-IP': options.buyerIp } : {}),
      },
      body: JSON.stringify({ query, variables: vars }),
    });
  } catch (cause) {
    throw new ShopifyError('Network error talking to Shopify', undefined, cause);
  }

  let json: GraphQLResponse<T>;
  try {
    json = (await res.json()) as GraphQLResponse<T>;
  } catch (cause) {
    throw new ShopifyError(`Invalid JSON from Shopify (HTTP ${res.status})`, res.status, cause);
  }

  if (!res.ok) {
    throw new ShopifyError(`Shopify HTTP ${res.status} ${res.statusText}`, res.status, json);
  }
  if (json.errors?.length) {
    throw new ShopifyError(json.errors.map((e) => e.message).join('; '), res.status, json.errors);
  }
  if (!json.data) {
    throw new ShopifyError('Empty response from Shopify', res.status);
  }
  return json.data;
}

export const shopifyConfig = { DOMAIN, VERSION, ENDPOINT };
