// ============================================================
//  AccountDrawer — account slide-over. Reflects login state: a
//  guest sees sign-in / create-account CTAs; a signed-in customer
//  sees a greeting + dashboard / sign-out. Login state comes from
//  the same-origin /api/account/me endpoint.
// ============================================================
import { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { Package, Heart, MapPin, LifeBuoy, ArrowRight, ChevronRight } from 'lucide-react';
import { $drawer, closeDrawer, openWishlist } from '~/stores/drawers';
import SideDrawer from './SideDrawer';

const LINKS = [
  { label: 'Order history', href: '/account#orders', icon: Package },
  { label: 'Saved / Wishlist', href: '#wishlist', icon: Heart },
  { label: 'Addresses', href: '/account', icon: MapPin },
  { label: 'Help & support', href: '/pages/contact', icon: LifeBuoy },
] as const;

interface Me {
  loggedIn: boolean;
  firstName?: string | null;
  name?: string | null;
  email?: string | null;
}

export default function AccountDrawer() {
  const drawer = useStore($drawer);
  const open = drawer === 'account';
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/account/me', { headers: { accept: 'application/json' } })
      .then((r) => r.json())
      .then((data) => {
        if (alive) setMe(data);
      })
      .catch(() => {
        if (alive) setMe({ loggedIn: false });
      });
    return () => {
      alive = false;
    };
  }, []);

  const initial = (me?.firstName || me?.name || me?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <SideDrawer open={open} onClose={closeDrawer} title="My Account">
      <div className="acct">
        {me === null ? (
          <div className="acct__card acct__loading">Checking your session…</div>
        ) : me.loggedIn ? (
          <div className="acct__card acct__member">
            <div className="acct__member-top">
              <span className="acct__avatar">{initial}</span>
              <div className="acct__member-id">
                <p className="acct__hi">Hi, {me.firstName || me.name || 'there'}</p>
                {me.email && <p className="acct__email">{me.email}</p>}
              </div>
            </div>
            <a href="/account" onClick={closeDrawer} className="btn btn--news btn--md btn--block">
              View dashboard
              <ArrowRight size={17} strokeWidth={2} />
            </a>
            <a href="/account/logout" className="acct__logout">Sign out</a>
          </div>
        ) : (
          <div className="acct__card">
            <p>Sign in to track orders, save your wishlist and check out faster.</p>
            <a href="/account/login" className="btn btn--news btn--md btn--block">
              Sign in
              <ArrowRight size={17} strokeWidth={2} />
            </a>
            <a href="/account/login" className="btn btn--outline btn--md btn--block">
              Create account
            </a>
          </div>
        )}

        <nav className="acct__links">
          {LINKS.map(({ label, href, icon: Icon }) => {
            const isWishlist = href === '#wishlist';
            const inner = (
              <>
                <Icon size={18} strokeWidth={1.7} className="lead" />
                {label}
                <ChevronRight size={15} strokeWidth={1.8} className="chev" />
              </>
            );
            // The wishlist row opens a drawer → a real <button>, not an <a>.
            return isWishlist ? (
              <button
                key={label}
                type="button"
                onClick={openWishlist}
                className="acct__link"
                aria-haspopup="dialog"
              >
                {inner}
              </button>
            ) : (
              <a key={label} href={href} onClick={closeDrawer} className="acct__link">
                {inner}
              </a>
            );
          })}
        </nav>
      </div>
    </SideDrawer>
  );
}
