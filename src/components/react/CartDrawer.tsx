// ============================================================
//  CartDrawer — slide-over cart. Mounted once, globally. Reads the
//  shared nanostore so it stays in sync with the header badge and
//  every add-to-cart button. Logic ported from the boilerplate.
// ============================================================
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { X, ShoppingCart, ArrowRight, Trash2 } from 'lucide-react';
import { cn } from '~/lib/utils';
import { useFocusTrap } from './useFocusTrap';
import {
  $cart,
  $cartOpen,
  $cartBusy,
  $busyLines,
  $cartError,
  closeCart,
  updateItem,
  removeItem,
  checkout,
} from '~/stores/cart';
import type { CartLine } from '~/lib/shopify/types';
import { SITE } from '~/config/site';
import { getCachedPrice } from '~/stores/price-cache';

// Cart drawer always shows cents (e.g. $96.00), unlike the storewide
// formatMoney which drops cents on whole-dollar amounts.
const money = (amount: string | number, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
import QuantityStepper from './QuantityStepper';
import Spinner from './Spinner';

export default function CartDrawer() {
  const cart = useStore($cart);
  const open = useStore($cartOpen);
  const busy = useStore($cartBusy);
  const error = useStore($cartError);
  const panelRef = useFocusTrap<HTMLDivElement>(open);

  // Esc to close + lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const lines = cart?.lines ?? [];

  // Resolve per-line price: prefer the price-cache captured at add-to-cart time
  // (the displayed price in the buyer's chosen market currency), else the cart's
  // own presentment price.
  const resolvePrice = (line: CartLine) =>
    getCachedPrice(line.merchandise.id) ?? {
      amount: line.merchandise.price.amount,
      currencyCode: line.merchandise.price.currencyCode ?? 'USD',
    };

  // Currency of the cart = whatever the lines are priced in (selected market).
  const currency = lines.length ? resolvePrice(lines[0]).currencyCode : 'USD';
  const subtotal = lines.reduce((sum, l) => sum + Number(resolvePrice(l).amount) * l.quantity, 0);
  const threshold = SITE.freeShippingThreshold;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);

  return (
    <div className={cn('drawer', open && 'is-open')} aria-hidden={!open} inert={!open}>
      <div className="drawer__overlay" onClick={closeCart} />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className="drawer__panel drawer__panel--right drawer__panel--wide"
      >
        <header className="drawer__head">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h2 className="drawer__title">My Cart</h2>
            <span className="drawer__count">
              {String(cart?.totalQuantity ?? 0).padStart(2, '0')} items
            </span>
          </div>
          <button type="button" onClick={closeCart} className="drawer__close" aria-label="Close cart">
            <X size={20} strokeWidth={1.8} />
          </button>
        </header>

        {lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <div className="cart-progress">
              {remaining > 0 ? (
                <p>
                  You're <strong>{money(remaining, currency)}</strong> from free shipping.
                </p>
              ) : (
                <p className="ok">🎉 Free shipping unlocked!</p>
              )}
              <div className="cart-progress__bar">
                <div className="cart-progress__fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="drawer__body">
              <div className="dlines">
                {lines.map((line) => (
                  <CartLineRow key={line.id} line={line} resolvedPrice={resolvePrice(line)} />
                ))}
              </div>
            </div>

            <footer className="drawer__foot">
              {error && (
                <p className="cart-error" role="alert">
                  {error}
                </p>
              )}
              <div className="cart-foot__row">
                <span className="eyebrow" style={{ color: 'var(--muted)' }}>
                  Subtotal
                </span>
                <span className="cart-subtotal">{money(subtotal, currency)}</span>
              </div>
              <p className="cart-note">Taxes and shipping calculated at checkout.</p>
              <div className="cart-actions">
                <a href="/cart" onClick={closeCart} className="cart-viewcart">
                  View Cart
                </a>
                <button type="button" onClick={checkout} disabled={busy} className="cart-checkout">
                  {busy ? (
                    <Spinner size={20} />
                  ) : (
                    <>
                      Checkout
                      <ArrowRight size={18} strokeWidth={2} />
                    </>
                  )}
                </button>
              </div>
              <button type="button" onClick={closeCart} className="cart-continue">
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

function CartLineRow({ line, resolvedPrice }: { line: CartLine; resolvedPrice: { amount: string; currencyCode: string } }) {
  const busyLines = useStore($busyLines);
  const busy = !!busyLines[line.id];
  const m = line.merchandise;
  const image = m.image ?? m.product?.featuredImage ?? null;
  const optionText = m.selectedOptions
    .filter((o) => o.value !== 'Default Title')
    .map((o) => o.value)
    .join(' · ');

  return (
    <div className="dline">
      <a href={`/products/${m.product.handle}`} onClick={closeCart} className="dline__thumb">
        {image ? <img src={image.url} alt={image.altText ?? m.product.title} loading="lazy" /> : null}
        {busy && (
          <span className="dline__busy">
            <Spinner size={18} />
          </span>
        )}
      </a>

      <div className="dline__main">
        <div className="dline__top">
          <a href={`/products/${m.product.handle}`} onClick={closeCart} className="dline__title">
            {m.product.title}
          </a>
          <button
            type="button"
            onClick={() => removeItem(line.id)}
            disabled={busy}
            className="dline__remove"
            aria-label={`Remove ${m.product.title}`}
          >
            <Trash2 size={15} strokeWidth={1.8} />
          </button>
        </div>

        {optionText && <p className="dline__opts">{optionText}</p>}

        <div className="dline__foot">
          <QuantityStepper
            value={line.quantity}
            onChange={(q) => updateItem(line.id, q)}
            disabled={busy}
            size="sm"
            min={1}
            ariaLabel={`Quantity for ${m.product.title}`}
          />
          <span className="dline__total">{money(
            Number(resolvedPrice.amount) * line.quantity,
            resolvedPrice.currencyCode,
          )}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="drawer-empty">
      <span className="drawer-empty__icon">
        <ShoppingCart size={26} strokeWidth={1.5} />
      </span>
      <h3>Your cart is empty</h3>
      <p>Nothing in here yet — let's fix that.</p>
      <a href="/products" onClick={closeCart} className="btn btn--news btn--md">
        Shop all products
        <ArrowRight size={17} strokeWidth={2} />
      </a>
    </div>
  );
}
