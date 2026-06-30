// ============================================================
//  BottomNav — mobile bottom tab bar. Home · Shop · Wishlist ·
//  Cart, with live badges. Cart/Wishlist open the shared drawers.
// ============================================================
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Home, LayoutGrid, Heart, ShoppingCart } from 'lucide-react';
import { $cart, initCart } from '~/stores/cart';
import { $wishlist, wishlist } from '~/stores/wishlist';
import { openCart, openWishlist, $drawer } from '~/stores/drawers';
import { cn } from '~/lib/utils';

interface Props {
  pathname: string;
}

export default function BottomNav({ pathname }: Props) {
  const cart = useStore($cart);
  const saved = useStore($wishlist);
  const drawer = useStore($drawer);
  const count = cart?.totalQuantity ?? 0;

  useEffect(() => {
    initCart();
    wishlist.init();
  }, []);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav className="bottom-nav" aria-label="Primary mobile">
      <a
        href="/"
        className={cn('bottom-nav__item', isActive('/') && 'is-active')}
        aria-current={isActive('/') ? 'page' : undefined}
      >
        <Home size={20} strokeWidth={1.8} />
        Home
      </a>
      <a
        href="/products"
        className={cn('bottom-nav__item', isActive('/products') && 'is-active')}
        aria-current={isActive('/products') ? 'page' : undefined}
      >
        <LayoutGrid size={20} strokeWidth={1.8} />
        Shop
      </a>
      <button
        type="button"
        onClick={openWishlist}
        className="bottom-nav__item"
        aria-label="Open wishlist"
        aria-haspopup="dialog"
        aria-expanded={drawer === 'wishlist'}
      >
        <span className="bottom-nav__ico">
          <Heart size={20} strokeWidth={1.8} />
          {saved.length > 0 && <span className="bottom-nav__badge">{saved.length}</span>}
        </span>
        Saved
      </button>
      <button
        type="button"
        onClick={openCart}
        className="bottom-nav__item"
        aria-label="Open cart"
        aria-haspopup="dialog"
        aria-expanded={drawer === 'cart'}
      >
        <span className="bottom-nav__ico">
          <ShoppingCart size={20} strokeWidth={1.8} />
          {count > 0 && <span className="bottom-nav__badge">{count}</span>}
        </span>
        Cart
      </button>
    </nav>
  );
}
