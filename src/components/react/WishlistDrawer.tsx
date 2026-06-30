// ============================================================
//  WishlistDrawer — saved-for-later slide-over. Reads the
//  persisted $wishlist store; each row links to the PDP, removes,
//  or (when a variant id is known) adds straight to the cart.
// ============================================================
import { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { $drawer, closeDrawer, openCart } from '~/stores/drawers';
import { $wishlist, wishlist } from '~/stores/wishlist';
import { addItem } from '~/stores/cart';
import { formatMoney } from '~/lib/utils';
import SideDrawer from './SideDrawer';

export default function WishlistDrawer() {
  const drawer = useStore($drawer);
  const items = useStore($wishlist);
  const open = drawer === 'wishlist';

  useEffect(() => {
    wishlist.init();
  }, []);

  return (
    <SideDrawer open={open} onClose={closeDrawer} title="Wishlist">
      {items.length === 0 ? (
        <div className="drawer-empty">
          <span className="drawer-empty__icon">
            <Heart size={26} strokeWidth={1.5} />
          </span>
          <h3>No saved items</h3>
          <p>Tap the heart on any product to save it for later.</p>
          <a href="/products" onClick={closeDrawer} className="btn btn--news btn--md">
            Browse products
            <ArrowRight size={17} strokeWidth={2} />
          </a>
        </div>
      ) : (
        <div className="wish">
          {items.map((p) => {
            const isVariant = p.id.includes('ProductVariant');
            return (
              <div key={p.id} className="dline">
                <a href={`/products/${p.handle}`} onClick={closeDrawer} className="dline__thumb">
                  {p.image && <img src={p.image} alt={p.title} loading="lazy" />}
                </a>
                <div className="dline__main">
                  <div className="dline__top">
                    <a href={`/products/${p.handle}`} onClick={closeDrawer} className="dline__title">
                      {p.title}
                    </a>
                    <button
                      type="button"
                      onClick={() => wishlist.remove(p.id)}
                      className="dline__remove"
                      aria-label={`Remove ${p.title}`}
                    >
                      <Trash2 size={15} strokeWidth={1.8} />
                    </button>
                  </div>
                  {p.price != null && (
                    <span className="dline__price">{formatMoney(p.price, p.currency ?? 'USD')}</span>
                  )}
                  <div className="dline__add">
                    <button
                      type="button"
                      onClick={() => {
                        if (isVariant) {
                          addItem(p.id, 1);
                          openCart();
                        } else {
                          window.location.href = `/products/${p.handle}`;
                        }
                      }}
                      className="btn btn--news btn--sm"
                    >
                      <ShoppingCart size={14} strokeWidth={1.9} />
                      {isVariant ? 'Add to cart' : 'View'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SideDrawer>
  );
}
