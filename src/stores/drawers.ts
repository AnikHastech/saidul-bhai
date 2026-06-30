// ============================================================
//  Drawer coordinator — only one slide-over open at a time.
//  The cart keeps its own store (shared boilerplate logic); this
//  store owns account / wishlist / mobile-menu and brokers mutual
//  exclusion with the cart (imports one-directionally: drawers→cart).
// ============================================================
import { atom } from 'nanostores';
import { openCart as openCartRaw, closeCart } from './cart';

export type DrawerName = 'account' | 'wishlist' | 'menu';

export const $drawer = atom<DrawerName | null>(null);

/** Open a side drawer; closes the cart and any other drawer first. */
export function openDrawer(name: DrawerName): void {
  closeCart();
  $drawer.set(name);
}

export function closeDrawer(): void {
  $drawer.set(null);
}

/** Open the cart exclusively (closes account/wishlist/menu first). */
export function openCart(): void {
  $drawer.set(null);
  openCartRaw();
}

export const openAccount = (): void => openDrawer('account');
export const openWishlist = (): void => openDrawer('wishlist');
export const openMenu = (): void => openDrawer('menu');
