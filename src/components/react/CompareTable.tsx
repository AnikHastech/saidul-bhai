// ============================================================
//  CompareTable — the /compare page body. Side-by-side columns of
//  the compared products (image, name, price), with remove + add
//  to cart actions. Reads the persisted $compare store.
// ============================================================
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { X, ArrowRight, ShoppingCart, Plus } from 'lucide-react';
import { $compare, compare } from '~/stores/compare';
import { formatMoney, isOnSale, discountPercent } from '~/lib/utils';

export default function CompareTable() {
  const items = useStore($compare);

  useEffect(() => {
    compare.init();
  }, []);

  if (items.length === 0) {
    return (
      <div className="compare-empty">
        <span className="compare-empty__eyebrow">Compare · up to 4</span>

        <div className="compare-empty__slots" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="compare-empty__slot">
              <span className="compare-empty__plus">
                <Plus size={20} strokeWidth={2.2} />
              </span>
              <span className="compare-empty__slotlbl">Slot {n}</span>
            </div>
          ))}
        </div>

        <h2 className="compare-empty__title">
          Nothing to compare <em>yet.</em>
        </h2>
        <p className="compare-empty__text">
          Tap the compare button on any product to line them up here, side by side — specs,
          price and savings at a glance.
        </p>

        <div className="compare-empty__cta">
          <a href="/products" className="btn btn--news btn--md">
            Browse products
            <ArrowRight size={16} strokeWidth={2} />
          </a>
          <a href="/collections/sale" className="btn btn--outline btn--md">
            View Hot Deals
          </a>
        </div>

        <ol className="compare-empty__steps">
          <li><span>1</span> Browse the catalogue</li>
          <li><span>2</span> Hit “compare” on a card</li>
          <li><span>3</span> See them side by side</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="compare">
      <div className="compare__head">
        <p className="listing__count">{items.length} of 4 products</p>
        <button type="button" onClick={() => compare.clear()} className="compare__clear">
          Clear all
        </button>
      </div>

      <div
        className="compare__grid"
        role="group"
        aria-label={`Comparing ${items.length} product${items.length === 1 ? '' : 's'}`}
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((p) => {
          const onSale = isOnSale(
            p.price ? { amount: p.price } : null,
            p.compareAt ? { amount: p.compareAt } : null,
          );
          const off = discountPercent(
            p.price ? { amount: p.price } : null,
            p.compareAt ? { amount: p.compareAt } : null,
          );
          return (
            <div key={p.id} className="compare-col" role="group" aria-label={p.title}>
              <button
                type="button"
                onClick={() => compare.remove(p.id)}
                className="compare-col__remove"
                aria-label={`Remove ${p.title}`}
              >
                <X size={16} strokeWidth={2.2} />
              </button>
              <a href={`/products/${p.handle}`} className="compare-col__media">
                {p.image ? <img src={p.image} alt={p.title} /> : null}
              </a>
              <a href={`/products/${p.handle}`} className="compare-col__title">
                {p.title}
              </a>
              <dl className="compare-col__specs">
                <div className="compare-col__row">
                  <dt className="compare-col__k">Price</dt>
                  <dd className="compare-col__price">
                    {p.price != null ? formatMoney(p.price, p.currency ?? 'USD') : '—'}
                  </dd>
                </div>
                <div className="compare-col__row">
                  <dt className="compare-col__k">Was</dt>
                  <dd>{onSale && p.compareAt ? formatMoney(p.compareAt, p.currency ?? 'USD') : '—'}</dd>
                </div>
                <div className="compare-col__row">
                  <dt className="compare-col__k">You save</dt>
                  <dd className="compare-col__save">{off != null ? `−${off}%` : '—'}</dd>
                </div>
              </dl>
              <a href={`/products/${p.handle}`} className="btn btn--news btn--sm compare-col__cta">
                <ShoppingCart size={14} strokeWidth={1.9} />
                View product
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
