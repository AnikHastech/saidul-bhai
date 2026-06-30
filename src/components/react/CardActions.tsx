// ============================================================
//  CardActions — per-product-card actions: wishlist heart +
//  add-to-compare. One island per card so the grid stays light.
//  Both are persisted, cross-island stores.
// ============================================================
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Heart } from 'lucide-react';
import { cn } from '~/lib/utils';
import { $wishlist, wishlist } from '~/stores/wishlist';
import { $compare, compare, COMPARE_CAP } from '~/stores/compare';
import type { ProductSummary } from '~/stores/types';

interface Props {
  product: ProductSummary;
}

// Inline compare glyph (two columns + swap arrows) — no icon dep.
const CompareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 9V4h6M3 6l2-2M19 15v5h-6M21 18l-2 2" />
    <rect x="3" y="11" width="6" height="9" rx="1" />
    <rect x="15" y="4" width="6" height="9" rx="1" />
  </svg>
);

export default function CardActions({ product }: Props) {
  const saved = useStore($wishlist);
  const compared = useStore($compare);

  useEffect(() => {
    wishlist.init();
    compare.init();
  }, []);

  const isSaved = saved.some((i) => i.id === product.id);
  const isCompared = compared.some((i) => i.id === product.id);
  const compareFull = !isCompared && compared.length >= COMPARE_CAP;

  return (
    <div className="product-card__actions">
      <button
        type="button"
        onClick={() => wishlist.toggle(product)}
        aria-pressed={isSaved}
        aria-label={isSaved ? 'Saved to wishlist' : 'Save to wishlist'}
        title={isSaved ? 'Saved to wishlist' : 'Save to wishlist'}
        className={cn('product-card__act', isSaved && 'is-active')}
      >
        <Heart size={17} strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={() => !compareFull && compare.toggle(product)}
        aria-pressed={isCompared}
        disabled={compareFull}
        aria-label={
          isCompared ? 'Remove from compare' : compareFull ? 'Compare list full' : 'Add to compare'
        }
        title={isCompared ? 'Remove from compare' : compareFull ? `Compare holds ${COMPARE_CAP}` : 'Add to compare'}
        className={cn('product-card__act', isCompared && 'is-active', compareFull && 'is-disabled')}
      >
        <CompareIcon />
      </button>
    </div>
  );
}
