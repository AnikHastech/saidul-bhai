// ============================================================
//  Middleware — resolves the shopper's market (from the
//  asmaz_country cookie) and runs the request inside the
//  AsyncLocalStorage context so every Shopify query localizes
//  prices to that market via @inContext(country:) and the
//  transforms can convert display prices when Markets is off.
// ============================================================
import { defineMiddleware } from 'astro:middleware';
import { SITE } from '~/config/site';
import {
  requestContext,
  COUNTRY_COOKIE,
  DEFAULT_COUNTRY,
  isValidCountry,
} from '~/lib/request-context';

export const onRequest = defineMiddleware((context, next) => {
  const raw = context.cookies.get(COUNTRY_COOKIE)?.value;
  const country = isValidCountry(raw) ? raw.toUpperCase() : DEFAULT_COUNTRY;
  // Map the country to its display currency + conversion rate (config fallback).
  const market =
    SITE.currencies.find((c) => c.country === country) ??
    SITE.currencies.find((c) => c.currency === SITE.baseCurrency) ??
    { currency: SITE.baseCurrency, rate: 1 };

  context.locals.country = country;
  return requestContext.run(
    { country, currency: market.currency, rate: market.rate },
    () => next(),
  );
});
