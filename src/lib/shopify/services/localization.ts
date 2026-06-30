// ============================================================
//  Localization — the currencies/markets the store sells in.
//  Powers the top-bar currency selector. Each option carries the
//  country code used to localize prices via @inContext(country:).
// ============================================================
import { shopifyFetch } from '../client';

const LOCALIZATION_QUERY = /* GraphQL */ `
  query Localization {
    localization {
      availableCountries {
        isoCode
        name
        currency {
          isoCode
          symbol
        }
      }
      country {
        isoCode
        currency {
          isoCode
          symbol
        }
      }
    }
  }
`;

export interface CurrencyOption {
  /** ISO-2 country used for @inContext (e.g. "US"). */
  country: string;
  /** ISO-4217 currency code (e.g. "USD"). */
  currency: string;
  /** Currency symbol (e.g. "$"). */
  symbol: string;
}

/**
 * Distinct sellable currencies, one country per currency. Returns an
 * empty list if the store is single-currency or the call fails — the
 * selector simply hides in that case.
 */
export async function getAvailableCurrencies(): Promise<CurrencyOption[]> {
  try {
    const data = await shopifyFetch<{ localization: any }>(LOCALIZATION_QUERY);
    const countries: any[] = data.localization?.availableCountries ?? [];
    const seen = new Set<string>();
    const out: CurrencyOption[] = [];
    for (const c of countries) {
      const currency = c?.currency?.isoCode;
      if (!currency || seen.has(currency)) continue;
      seen.add(currency);
      out.push({ country: c.isoCode, currency, symbol: c.currency.symbol ?? '' });
    }
    // Only a real choice if there's more than one currency.
    if (out.length < 2) return [];
    out.sort((a, b) => a.currency.localeCompare(b.currency));
    return out;
  } catch {
    return [];
  }
}
