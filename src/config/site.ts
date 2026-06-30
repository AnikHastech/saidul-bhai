// ============================================================
//  Site configuration — asmaz brand, nav fallbacks, footer,
//  announcements, value props. Single source of truth (DRY) for
//  the non-Shopify chrome content. Ported from the magazine mockup.
// ============================================================

export const SITE = {
  name: 'asmaz',
  /** Small kicker under the wordmark. */
  sub: 'Daily Tech Drop',
  tagline: 'The daily tech drop — reviews, launches & serious deals.',
  /** Free-shipping threshold (matches the announcement copy). */
  freeShippingThreshold: 99,
  /**
   * Storewide display currency. The template renders every price in this
   * currency regardless of the Shopify store's presentment currency
   * (the demo store is BDT-priced; we always show USD). Single source of
   * truth consumed by `formatMoney` and the cart/account formatters.
   */
  currency: 'USD',
  description:
    'The daily destination for tech reviews, curated launches and serious deals — built for shoppers who actually read the spec sheet. A headless Shopify storefront built with Astro.',
  /** Default social-share image (1200×630). Pages may override per-resource. */
  ogImage: '/og-default.jpg',

  /** Rotating top-bar messages. `<b>` highlights render in cyber-yellow. */
  announcements: [
    '⚡ <em>FREE SHIPPING</em> on orders over <b>$99</b> · Use code <b>DROP24</b>',
    '🚚 <em>SAME-DAY DELIVERY</em> available in 12 cities · Order before 2PM',
    '💳 <em>BUY NOW · PAY LATER</em> with Klarna, Affirm or Afterpay',
    '📦 <em>30-DAY HASSLE-FREE RETURNS</em> on every order, no questions asked',
  ],

  /** Top-bar right-hand utility links. */
  topbarLinks: [
    { label: 'Track Order', href: '/account' },
    { label: 'Help & Support', href: '/pages/contact' },
    { label: 'Sell on asmaz', href: '/pages/sell' },
  ],

  /** Locale flag shown at the far right of the top bar. */
  locale: 'EN / USD',

  /**
   * The currency Shopify returns prices in (the catalogue's base). Used as the
   * "from" currency when converting display prices for stores that do NOT have
   * Shopify Markets multi-currency. With Markets enabled, Shopify returns the
   * selected currency directly and conversion is skipped.
   */
  baseCurrency: 'USD',

  /**
   * Top-bar currency selector options. `country` is the ISO-2 used to localize
   * prices via @inContext(country:). `rate` converts from `baseCurrency` for
   * display when Markets isn't active (approximate; update to taste). The live
   * Shopify Markets list replaces this when available.
   */
  currencies: [
    { country: 'US', currency: 'USD', symbol: '$', rate: 1 },
    { country: 'GB', currency: 'GBP', symbol: '£', rate: 0.79 },
    { country: 'DE', currency: 'EUR', symbol: '€', rate: 0.92 },
    { country: 'CA', currency: 'CAD', symbol: 'CA$', rate: 1.37 },
    { country: 'AU', currency: 'AUD', symbol: 'A$', rate: 1.52 },
    { country: 'JP', currency: 'JPY', symbol: '¥', rate: 151 },
    { country: 'IN', currency: 'INR', symbol: '₹', rate: 83 },
    { country: 'BD', currency: 'BDT', symbol: '৳', rate: 119 },
  ],

  /** Contact details (footer + contact page). */
  contact: {
    phone: '+1 (800) 123-4567',
    email: 'hello@asmaz.tech',
    address: '247 Drop Street, New York, NY 10001',
  },

  social: [
    { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' as const },
    { label: 'X', href: 'https://x.com', icon: 'x' as const },
    { label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' as const },
    { label: 'TikTok', href: 'https://tiktok.com', icon: 'tiktok' as const },
    { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' as const },
  ],

  /** Trust strip (footer mid + reusable on home/PDP). */
  valueProps: [
    { icon: 'truck' as const, title: 'Free shipping', body: 'On orders over $99' },
    { icon: 'rotate' as const, title: '30-day returns', body: 'No questions, no fees' },
    { icon: 'shield' as const, title: 'Secure checkout', body: 'SSL · 3D Secure · Stripe' },
    { icon: 'clock' as const, title: '24/7 support', body: 'Real humans, live chat' },
  ],

  /** Footer link columns (handles resolve to /pages/* or routes). */
  footerColumns: [
    {
      title: 'Shop',
      links: [
        { label: 'New Arrivals', href: '/products?sort=newest', tag: 'new' as const },
        { label: 'Best Sellers', href: '/products' },
        { label: 'Flash Deals', href: '/collections/flash-deals', tag: 'deal' as const },
        { label: 'Top Brands', href: '/collections' },
        { label: 'Bundle Savings', href: '/collections/bundles' },
        { label: 'Gift Cards', href: '/pages/gift-cards' },
        { label: 'Refurbished', href: '/collections/refurbished' },
      ],
    },
    {
      title: 'Categories',
      links: [
        { label: 'Audio', href: '/collections/audio' },
        { label: 'Smartphones', href: '/collections/smartphones' },
        { label: 'Laptops', href: '/collections/laptops' },
        { label: 'Wearables', href: '/collections/wearables' },
        { label: 'Gaming', href: '/collections/gaming' },
        { label: 'Cameras', href: '/collections/cameras' },
        { label: 'Smart Home', href: '/collections/smart-home' },
      ],
    },
    {
      title: 'Support',
      links: [
        { label: 'Help Center', href: '/pages/help' },
        { label: 'Order Tracking', href: '/account' },
        { label: 'Shipping & Returns', href: '/pages/shipping' },
        { label: 'Warranty', href: '/pages/warranty' },
        { label: 'Repair Service', href: '/pages/repair' },
        { label: 'Trade-in Program', href: '/pages/trade-in' },
        { label: 'Contact Us', href: '/pages/contact' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'Our Story', href: '/pages/about' },
        { label: 'The Journal', href: '/journal' },
        { label: 'Careers', href: '/pages/careers' },
        { label: 'Press', href: '/pages/press' },
        { label: 'Affiliates', href: '/pages/affiliates' },
        { label: 'Sell on asmaz', href: '/pages/sell' },
        { label: 'Sustainability', href: '/pages/sustainability' },
      ],
    },
  ],

  /** Footer bottom: payment method tiles. `dark` = inverted tile. */
  payments: [
    { label: 'VISA' }, { label: 'MC' }, { label: 'AMEX' }, { label: 'PAYPAL' },
    { label: 'APPLE', dark: true }, { label: 'G PAY', dark: true },
    { label: 'KLARNA' }, { label: 'AFFIRM' },
  ],

  /** Footer copyright-row menu — 4 pages surfaced from the Pages menu. */
  metaLinks: [
    { label: 'Style Guide', href: '/pages/style-guide' },
    { label: 'Changelog', href: '/pages/changelog' },
    { label: 'Licenses', href: '/pages/licenses' },
    { label: '404 Page', href: '/404' },
  ],

  /** Search category dropdown (header search shell). */
  searchCategories: [
    'All Categories', 'Audio', 'Mobile', 'Laptops', 'Wearables', 'Gaming', 'Cameras', 'Smart Home',
  ],
} as const;

/**
 * Primary department nav (black bar). Used when the Shopify
 * "main-menu" is unavailable. `tag`/`hot` decorate the link.
 */
export interface NavItem {
  title: string;
  url: string;
  /** 'mega'/'dropdown' fill the panel with products from `collection`;
   *  'pages' renders the static PAGES_MENU list. */
  menu?: 'mega' | 'dropdown' | 'pages';
  /** Collection handle whose products populate the mega/dropdown panel. */
  collection?: string;
  tag?: 'new';
  hot?: boolean;
}

/**
 * Primary department nav (black bar) — 8 items. Two collection megamenus
 * (Audio, Gaming) and two collection dropdowns (Mobile, Laptops) are filled
 * with that collection's live products; Cameras/Smart Home are plain
 * collection links; Pages groups the static site pages.
 */
export const FALLBACK_NAV: ReadonlyArray<NavItem> = [
  { title: 'Home', url: '/' },
  { title: 'Mobile', url: '/collections/phone-tablet', menu: 'mega', collection: 'phone-tablet', tag: 'new' },
  { title: 'Laptops', url: '/collections/pc-laptop', menu: 'dropdown', collection: 'pc-laptop' },
  { title: 'Accessories', url: '/collections/accessories', menu: 'dropdown', collection: 'accessories' },
  { title: 'Home & Kitchen', url: '/collections/kitchen-appliances', menu: 'mega', collection: 'kitchen-appliances' },
  { title: 'Hot Deals', url: '/collections/sale', hot: true },
  { title: 'Featured', url: '/collections/frontpage' },
  { title: 'Pages', url: '/products', menu: 'pages' },
];

/** Sub-links for the "Pages" nav dropdown. */
export const PAGES_MENU: ReadonlyArray<{ label: string; url: string }> = [
  { label: 'About', url: '/pages/about' },
  { label: 'Contact', url: '/pages/contact' },
  { label: 'Shop', url: '/products' },
  { label: 'Blog', url: '/journal' },
  { label: 'Style Guide', url: '/pages/style-guide' },
  { label: 'Changelog', url: '/pages/changelog' },
  { label: 'Licenses', url: '/pages/licenses' },
  { label: 'Password Protected', url: '/password' },
  { label: '404 Page', url: '/404' },
];

/** Departments for the "Shop by Department" mega-menu flyout. */
export const DEPARTMENTS: ReadonlyArray<{ title: string; url: string; icon: string }> = [
  { title: 'Audio & Headphones', url: '/collections/audio', icon: 'headphones' },
  { title: 'Smartphones', url: '/collections/smartphones', icon: 'phone' },
  { title: 'Laptops & PCs', url: '/collections/laptops', icon: 'laptop' },
  { title: 'Wearables', url: '/collections/wearables', icon: 'watch' },
  { title: 'Gaming', url: '/collections/gaming', icon: 'gamepad' },
  { title: 'Cameras', url: '/collections/cameras', icon: 'camera' },
  { title: 'Smart Home', url: '/collections/smart-home', icon: 'home' },
  { title: 'Tablets', url: '/collections/tablets', icon: 'tablet' },
];

