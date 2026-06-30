// ============================================================
//  RecentlyViewed — records the current PDP product into the
//  persisted store on mount, then shows the other recently-viewed
//  products as a strip. Renders nothing until there's history.
// ============================================================
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { $recentlyViewed, recentlyViewed } from '~/stores/recently-viewed';
import { formatMoney } from '~/lib/utils';
import type { ProductSummary } from '~/stores/types';

interface Props {
  current: ProductSummary;
}

export default function RecentlyViewed({ current }: Props) {
  const items = useStore($recentlyViewed);

  useEffect(() => {
    recentlyViewed.init();
    recentlyViewed.add(current);
  }, [current.id]);

  const others = items.filter((i) => i.id !== current.id).slice(0, 4);
  if (others.length === 0) return null;

  return (
    <section className="wrap pdp__section">
      <div className="section-heading">
        <div>
          <span className="eyebrow kicker">Recently viewed</span>
          <h2 className="masthead section-heading__title">Pick up where you left off</h2>
        </div>
      </div>
      <div className="product-grid">
        {others.map((p) => (
          <a key={p.id} href={`/products/${p.handle}`} className="product-card">
            <span className="product-card__media">
              {p.image && <img src={p.image} alt={p.title} loading="lazy" />}
            </span>
            <div className="product-card__body">
              <span className="product-card__name">{p.title}</span>
              {p.price != null && (
                <div className="product-card__prices">
                  <span className="price price--lg">
                    <span className="price__now">{formatMoney(p.price, p.currency ?? 'USD')}</span>
                  </span>
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
