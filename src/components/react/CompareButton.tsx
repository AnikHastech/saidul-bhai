// PDP "Add to compare" toggle (labelled, like the wishlist link).
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { cn } from '~/lib/utils';
import { $compare, compare, COMPARE_CAP } from '~/stores/compare';
import type { ProductSummary } from '~/stores/types';

const CompareIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 9V4h6M3 6l2-2M19 15v5h-6M21 18l-2 2" />
    <rect x="3" y="11" width="6" height="9" rx="1" />
    <rect x="15" y="4" width="6" height="9" rx="1" />
  </svg>
);

export default function CompareButton({ product }: { product: ProductSummary }) {
  const items = useStore($compare);
  useEffect(() => {
    compare.init();
  }, []);

  const active = items.some((i) => i.id === product.id);
  const full = !active && items.length >= COMPARE_CAP;

  return (
    <button
      type="button"
      onClick={() => !full && compare.toggle(product)}
      aria-pressed={active}
      disabled={full}
      className={cn('buybox__wishlink', active && 'is-active')}
    >
      <CompareIcon />
      {active ? 'Comparing' : full ? `Compare full (${COMPARE_CAP})` : 'Add to compare'}
    </button>
  );
}
