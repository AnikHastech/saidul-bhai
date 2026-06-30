// ============================================================
//  SearchBar — inline header search shell with a predictive
//  dropdown. Debounced calls to /api/search; Enter (or the
//  Search button) navigates to the full /search page.
// ============================================================
import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { formatMoney } from '~/lib/utils';

interface PredictProduct {
  id: string;
  title: string;
  handle: string;
  featuredImage?: { url: string; altText?: string | null } | null;
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
}
interface PredictCollection {
  id: string;
  title: string;
  handle: string;
}
interface Results {
  products: PredictProduct[];
  collections: PredictCollection[];
  queries: { text: string }[];
}

const EMPTY: Results = { products: [], collections: [], queries: [] };

export interface SearchCategory {
  title: string;
  /** Collection handle; absent for "All Categories". */
  handle?: string;
}

interface Props {
  categories?: readonly SearchCategory[];
}

export default function SearchBar({ categories = [{ title: 'All Categories' }] }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState<Results>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Debounced predictive fetch.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults(EMPTY);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        // Scope predictive suggestions to the chosen category, if any.
        const url =
          `/api/search?q=${encodeURIComponent(q)}` +
          (category ? `&category=${encodeURIComponent(category)}` : '');
        const res = await fetch(url);
        const data = (await res.json()) as Results;
        setResults({
          products: data.products ?? [],
          collections: data.collections ?? [],
          queries: data.queries ?? [],
        });
      } catch {
        setResults(EMPTY);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query, category]);

  // Close dropdown on outside click.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    // A chosen category scopes to its collection; otherwise full search.
    if (category) {
      window.location.href = q
        ? `/collections/${category}?q=${encodeURIComponent(q)}`
        : `/collections/${category}`;
    } else if (q) {
      window.location.href = `/search?q=${encodeURIComponent(q)}`;
    }
  };

  const hasResults = results.products.length + results.collections.length > 0;
  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={rootRef} className="search">
      <form onSubmit={submit} className="search__form">
        <Search size={18} strokeWidth={1.8} className="search__icon" />
        {categories.length > 1 && (
          <select
            aria-label="Search category"
            className="search__select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.title} value={c.handle ?? ''}>
                {c.title}
              </option>
            ))}
          </select>
        )}
        <input
          type="search"
          name="q"
          value={query}
          autoComplete="off"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search 12,000+ products, brands, deals…"
          className="search__input"
          aria-label="Search query"
        />
        <button type="submit" className="search__submit">
          Search
        </button>
      </form>

      {showDropdown && (
        <div className="search__dropdown">
          <p className="sr-only" role="status" aria-live="polite">
            {loading ? 'Searching' : hasResults ? 'Results available' : 'No matches'}
          </p>
          <div className="search__scroll">
            {loading && !hasResults ? (
              <p className="search__empty">Searching…</p>
            ) : !hasResults ? (
              <p className="search__empty">No matches for “{query.trim()}”.</p>
            ) : (
              <>
                {results.collections.length > 0 && (
                  <section className="search__group">
                    <h3 className="eyebrow">Collections</h3>
                    <div className="search__chips">
                      {results.collections.map((c) => (
                        <a key={c.id} href={`/collections/${c.handle}`} className="search__chip">
                          {c.title}
                        </a>
                      ))}
                    </div>
                  </section>
                )}

                {results.products.length > 0 && (
                  <section className="search__group">
                    <h3 className="eyebrow">Products</h3>
                    <div className="search__list">
                      {results.products.map((p) => (
                        <a key={p.id} href={`/products/${p.handle}`} className="search__row">
                          <span className="search__thumb">
                            {p.featuredImage && (
                              <img
                                src={p.featuredImage.url}
                                alt={p.featuredImage.altText ?? p.title}
                                loading="lazy"
                              />
                            )}
                          </span>
                          <span className="search__name">{p.title}</span>
                          <span className="search__price">
                            {formatMoney(
                              p.priceRange.minVariantPrice.amount,
                              p.priceRange.minVariantPrice.currencyCode,
                            )}
                          </span>
                        </a>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
