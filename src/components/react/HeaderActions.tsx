// ============================================================
//  HeaderActions — account · wishlist · cart cluster (one island).
//  Live-bound to the shared stores so the badges/labels stay in
//  sync with the drawers and every add-to-cart on the page.
// ============================================================
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { User, Heart, ShoppingCart } from 'lucide-react';
import { $cart, initCart } from '~/stores/cart';
import { $wishlist, wishlist } from '~/stores/wishlist';
import { openAccount, openWishlist, openCart } from '~/stores/drawers';
import { getCachedPrice } from '~/stores/price-cache';

// Cart label always shows cents (e.g. $960.00) to match the cart drawer.
const money = (amount: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export default function HeaderActions() {
  const cart = useStore($cart);
  const saved = useStore($wishlist);

  useEffect(() => {
    initCart();
    wishlist.init();
  }, []);

  const lines = cart?.lines ?? [];
  const count = cart?.totalQuantity ?? 0;
  const priceOf = (l: (typeof lines)[number]) => getCachedPrice(l.merchandise.id) ?? l.merchandise.price;
  // Currency = the cart's actual (selected-market) currency.
  const cartCurrency =
    (lines.length ? priceOf(lines[0]).currencyCode : cart?.cost?.totalAmount?.currencyCode) ?? 'USD';
  const cartTotal = lines.reduce((sum, l) => sum + Number(priceOf(l).amount) * l.quantity, 0);
  const total = count > 0 ? money(cartTotal, cartCurrency) : money(0, cartCurrency);

  return (
    <div className="header-actions">
      <IconBtn label="Hello," strong="Account" onClick={openAccount} ariaLabel="Account">
        <User size={22} strokeWidth={1.7} />
      </IconBtn>

      <IconBtn
        label="Saved"
        strong="Wishlist"
        onClick={openWishlist}
        ariaLabel={saved.length ? `Wishlist, ${saved.length} saved` : 'Wishlist'}
        badge={saved.length || undefined}
      >
        <Heart size={22} strokeWidth={1.7} />
      </IconBtn>

      <IconBtn
        label={total}
        strong="My Cart"
        onClick={openCart}
        ariaLabel={count ? `Open cart, ${count} item${count === 1 ? '' : 's'}` : 'Open cart'}
        badge={count || undefined}
      >
        <ShoppingCart size={22} strokeWidth={1.7} />
      </IconBtn>
    </div>
  );
}

function IconBtn({
  children,
  label,
  strong,
  onClick,
  ariaLabel,
  badge,
}: {
  children: React.ReactNode;
  label: string;
  strong: string;
  onClick: () => void;
  ariaLabel: string;
  badge?: number;
}) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className="icon-btn">
      {children}
      <span className="icon-btn__label">
        <small>{label}</small>
        <b>{strong}</b>
      </span>
      {badge != null && <span className="icon-btn__badge">{badge}</span>}
    </button>
  );
}
