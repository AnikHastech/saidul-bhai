// Lightweight product shape stored client-side (wishlist / compare /
// recently-viewed). Kept minimal so it serializes cleanly to localStorage.
export interface ProductSummary {
  id: string;
  handle: string;
  title: string;
  image?: string | null;
  /** Numeric price as a string (Shopify money amount). */
  price?: string | null;
  currency?: string | null;
  compareAt?: string | null;
}
