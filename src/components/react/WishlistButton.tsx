// ============================================================
//  WishlistButton — toggles a product in the persisted wishlist.
//  Two looks: `icon` (heart pill on a product card) and `link`
//  (labelled row in the PDP buy box). Live-bound to $wishlist.
// ============================================================
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Heart } from 'lucide-react';
import { cn } from '~/lib/utils';
import { $wishlist, wishlist } from '~/stores/wishlist';
import type { ProductSummary } from '~/stores/types';

interface Props {
  product: ProductSummary;
  variant?: 'icon' | 'link';
}

export default function WishlistButton({ product, variant = 'icon' }: Props) {
  const items = useStore($wishlist);
  const active = items.some((i) => i.id === product.id);

  useEffect(() => {
    wishlist.init();
  }, []);

  const toggle = () => wishlist.toggle(product);
  const label = active ? 'Saved to wishlist' : 'Save to wishlist';

  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-pressed={active}
        className={cn('buybox__wishlink', active && 'is-active')}
      >
        <Heart size={17} strokeWidth={1.8} />
        {active ? 'Saved' : 'Save for later'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn('product-card__wish', active && 'is-active')}
    >
      <Heart size={18} strokeWidth={1.8} />
    </button>
  );
}
