// ============================================================
//  MobileMenu — left slide-over for the hamburger / departments
//  on small screens. Primary nav items with a submenu expand
//  inline (accordion): "Pages" → its links; collection items →
//  that collection's products + a "View all" link.
// ============================================================
import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn, formatMoney } from '~/lib/utils';
import { $drawer, closeDrawer } from '~/stores/drawers';
import { FALLBACK_NAV, DEPARTMENTS, PAGES_MENU, type NavItem } from '~/config/site';
import type { ProductCard } from '~/lib/shopify/types';
import SideDrawer from './SideDrawer';

interface Props {
  // Real store collections for the Departments grid; falls back to config.
  departments?: { title: string; url: string }[];
  // Collection products keyed by handle, for the expandable mega/dropdown items.
  navProducts?: Record<string, ProductCard[]>;
}

type Sub =
  | { kind: 'links'; items: ReadonlyArray<{ label: string; url: string }> }
  | { kind: 'products'; items: ProductCard[] };

export default function MobileMenu({ departments, navProducts = {} }: Props) {
  const drawer = useStore($drawer);
  const open = drawer === 'menu';
  const depts = departments && departments.length ? departments : DEPARTMENTS;
  const [expanded, setExpanded] = useState<string | null>(null);

  // Show at most 3 words, then an ellipsis (full label kept as the tooltip).
  const max3 = (s: string) => {
    const words = s.trim().split(/\s+/);
    return words.length > 3 ? words.slice(0, 3).join(' ') + '…' : s;
  };

  const subFor = (n: NavItem): Sub | null => {
    if (n.menu === 'pages') return { kind: 'links', items: PAGES_MENU };
    if ((n.menu === 'mega' || n.menu === 'dropdown') && n.collection) {
      return { kind: 'products', items: navProducts[n.collection] ?? [] };
    }
    return null;
  };

  return (
    <SideDrawer open={open} onClose={closeDrawer} title="Menu" side="left">
      <div className="mmenu">
        <section className="mmenu__section">
          <p className="eyebrow mmenu__label">Browse</p>
          <ul className="mmenu__list">
            {FALLBACK_NAV.map((n) => {
              const key = n.url + n.title;
              const sub = subFor(n);

              if (!sub) {
                // Direct links (Home, Hot Deals, Featured) — no expand arrow.
                return (
                  <li key={key} className="mmenu__item">
                    <a href={n.url} onClick={closeDrawer} className={cn('mmenu__link', n.hot && 'is-hot')}>
                      {n.title}
                    </a>
                  </li>
                );
              }

              const isOpen = expanded === key;
              return (
                <li key={key} className={cn('mmenu__item', isOpen && 'is-open')}>
                  <button
                    type="button"
                    className={cn('mmenu__link mmenu__toggle', n.hot && 'is-hot')}
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : key)}
                  >
                    {n.title}
                    <ChevronDown size={16} strokeWidth={1.8} className="chev" />
                  </button>

                  {isOpen && (
                    <div className="mmenu__sub">
                      {sub.kind === 'links' ? (
                        sub.items.map((l) => (
                          <a key={l.url} href={l.url} onClick={closeDrawer} className="mmenu__sublink">
                            {l.label}
                          </a>
                        ))
                      ) : (
                        <>
                          {sub.items.slice(0, 6).map((p) => (
                            <a
                              key={p.id}
                              href={`/products/${p.handle}`}
                              onClick={closeDrawer}
                              className="mmenu__subprod"
                            >
                              <span className="mmenu__subthumb">
                                {p.featuredImage && <img src={p.featuredImage.url} alt="" loading="lazy" />}
                              </span>
                              <span className="mmenu__subtitle">{p.title}</span>
                              <span className="mmenu__subprice">
                                {formatMoney(
                                  p.priceRange.minVariantPrice.amount,
                                  p.priceRange.minVariantPrice.currencyCode,
                                )}
                              </span>
                            </a>
                          ))}
                          <a href={n.url} onClick={closeDrawer} className="mmenu__suball">
                            View all {n.title}
                            <ChevronRight size={14} strokeWidth={2} />
                          </a>
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mmenu__section">
          <p className="eyebrow mmenu__label">Categories</p>
          <div className="mmenu__depts">
            {depts.map((d) => (
              <a key={d.url} href={d.url} onClick={closeDrawer} className="mmenu__dept" title={d.title}>
                {max3(d.title)}
              </a>
            ))}
          </div>
        </section>
      </div>
    </SideDrawer>
  );
}
