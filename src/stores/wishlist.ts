// Wishlist — persisted "saved for later" products. Drives the
// header heart badge + the wishlist drawer.
import { createListStore } from './persistent';

export const wishlist = createListStore('asmaz:wishlist');
export const $wishlist = wishlist.$items;
