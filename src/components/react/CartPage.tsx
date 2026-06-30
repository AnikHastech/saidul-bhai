// ============================================================
//  CartPage — full-page cart. SSR-seeded from the cookie cart
//  (initialCart) then live-bound to the shared $cart store, so it
//  stays in sync with the drawer and header. Reuses the same
//  /api/cart mutations as the drawer.
// ============================================================
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import {
  $cart,
  $busyLines,
  $cartError,
  $cartBusy,
  initCart,
  updateItem,
  removeItem,
  checkout,
} from '~/stores/cart';
import type { Cart, CartLine } from '~/lib/shopify/types';
import { SITE } from '~/config/site';
import { getCachedPrice } from '~/stores/price-cache';
import QuantityStepper from './QuantityStepper';
import Spinner from './Spinner';

// Always render USD with cents, mirroring the cart drawer. The cart's own
// cost is in the store's presentment currency (BDT) so we never display it.
const money = (amount: string | number, currency = SITE.currency) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));

// Per-line USD price: prefer the price captured at add-to-cart time.
const resolveLinePrice = (line: CartLine) =>
  getCachedPrice(line.merchandise.id)?.amount ?? line.merchandise.price.amount;

interface Props {
  initialCart: Cart | null;
}

export default function CartPage({ initialCart }: Props) {
  const stored = useStore($cart);
  const busy = useStore($cartBusy);
  const error = useStore($cartError);
  const cart = stored ?? initialCart;

  // Seed the store from the SSR snapshot, then refresh from the API.
  useEffect(() => {
    if (initialCart && $cart.get() == null) $cart.set(initialCart);
    initCart();
  }, []);

  const lines = cart?.lines ?? [];
  const currency = SITE.currency;
  const subtotal = lines.reduce(
    (sum, l) => sum + Number(resolveLinePrice(l)) * l.quantity,
    0,
  );
  const threshold = SITE.freeShippingThreshold;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);

  if (lines.length === 0) {
    return (
      <div className="cart-blank">
        <span className="cart-blank__icon">
          <ShoppingCart size={30} strokeWidth={1.4} />
        </span>
        <h2 className="masthead">Your cart is empty</h2>
        <p>Browse the latest drop and add something you love.</p>
        <a href="/products" className="btn btn--news btn--lg">
          Shop all products
          <ArrowRight size={18} strokeWidth={2} />
        </a>
      </div>
    );
  }

  return (
    <div className="cart-page__grid">
      <div>
        <div className="cart-lines">
          {lines.map((line) => (
            <CartRow key={line.id} line={line} currency={currency} />
          ))}
        </div>
      </div>

      <aside className="cart-summary">
        <h2 className="masthead cart-summary__title">Order summary</h2>
        <div className="cart-summary__row">
          <span>Subtotal ({cart?.totalQuantity ?? 0} items)</span>
          <span>{money(subtotal, currency)}</span>
        </div>
        <div className="cart-summary__row">
          <span>Shipping</span>
          <span>{remaining > 0 ? 'Calculated at checkout' : 'Free'}</span>
        </div>
        <div className="cart-summary__total">
          <span className="cart-summary__total-label">Total</span>
          <span className="cart-summary__total-value">{money(subtotal, currency)}</span>
        </div>
        <p className="cart-summary__note">Taxes and shipping calculated at checkout.</p>

        {error && (
          <p className="cart-error" role="alert">
            {error}
          </p>
        )}

        <button type="button" onClick={checkout} disabled={busy} className="cart-summary__checkout">
          {busy ? (
            <Spinner size={20} />
          ) : (
            <>
              Secure Checkout
              <ArrowRight size={18} strokeWidth={2} />
            </>
          )}
        </button>
        <a href="/products" className="cart-summary__continue">
          Continue shopping
        </a>

        <div className="cart-summary__ship">
          {remaining > 0 ? (
            <p>
              You're <strong>{money(remaining, currency)}</strong> from free shipping.
            </p>
          ) : (
            <p>🎉 Your order ships free.</p>
          )}
          <div className="cart-summary__bar">
            <div className="cart-summary__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function CartRow({ line, currency }: { line: CartLine; currency: string }) {
  const busyLines = useStore($busyLines);
  const busy = !!busyLines[line.id];
  const m = line.merchandise;
  const image = m.image ?? m.product?.featuredImage ?? null;
  const optionText = m.selectedOptions
    .filter((o) => o.value !== 'Default Title')
    .map((o) => o.value)
    .join(' · ');

  return (
    <div className="cart-row">
      <a href={`/products/${m.product.handle}`} className="cart-row__thumb">
        {image ? <img src={image.url} alt={image.altText ?? m.product.title} loading="lazy" /> : null}
        {busy && (
          <span className="cart-row__busy">
            <Spinner size={20} />
          </span>
        )}
      </a>
      <div className="cart-row__main">
        <div className="cart-row__top">
          <div>
            <a href={`/products/${m.product.handle}`} className="cart-row__title">
              {m.product.title}
            </a>
            {optionText && <p className="cart-row__opts">{optionText}</p>}
          </div>
          <button
            type="button"
            onClick={() => removeItem(line.id)}
            disabled={busy}
            className="cart-row__remove"
            aria-label={`Remove ${m.product.title}`}
          >
            <Trash2 size={15} strokeWidth={1.8} />
            Remove
          </button>
        </div>
        <div className="cart-row__foot">
          <QuantityStepper
            value={line.quantity}
            onChange={(q) => updateItem(line.id, q)}
            disabled={busy}
            min={1}
            ariaLabel={`Quantity for ${m.product.title}`}
          />
          <span className="cart-row__price">{money(Number(resolveLinePrice(line)) * line.quantity, currency)}</span>
        </div>
      </div>
    </div>
  );
}
