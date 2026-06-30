<p align="center">
  <img src="public/favicon.svg" alt="asmaz logo" width="90" />
</p>
<h1 align="center">asmaz — Magazine-Style Astro eCommerce Template</h1>
<p align="center">
  An <b>editorial, magazine-style</b> headless storefront — the “<b>Daily Tech Drop</b>”
  aesthetic: bold display type, news-black surfaces, a signal-red accent and
  cover-story layouts. Built with <b>Astro 6 (SSR)</b>, <b>React 19 islands</b> and
  <b>plain CSS</b>, powered by the Shopify <b>Storefront API</b> (catalogue &amp; cart)
  and <b>Customer Account API</b> (login).
</p>
<p align="center">
  <a href="#features">Features</a> ·
  <a href="#design--magazine-aesthetic">Design</a> ·
  <a href="#pages">Pages</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#environment-variables">Environment</a> ·
  <a href="#configuration--customization">Customization</a> ·
  <a href="#project-structure">Structure</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#license">License</a>
</p>
<p align="center">
  <img src="public/images/og-default.jpg" alt="asmaz preview" width="100%" />
</p>

> Every Shopify call runs **server-side** — the private Storefront token and customer
> OAuth tokens never reach the browser. The client only ever talks to same-origin
> `/api/*` routes. The storefront also runs **credential-free** against Shopify’s
> [`mock.shop`](https://mock.shop/api) demo API, so you can preview it before wiring a store.

---

## Features

- **Editorial home** — hero, scrolling ticker, category bento, flash deals with a live
  countdown, best-sellers / new-arrivals rails, editorial banner, brands, testimonials,
  journal row, newsletter popup, Instagram grid.
- **Catalogue** — product grid + cards, PLP with **faceted filters** (Shopify collection
  filters, URL-driven &amp; shareable), sort, density toggle, collection tabs, cursor pagination.
- **Product detail** — gallery, variant selector, add-to-cart / buy-now, wishlist, compare,
  related products, recently-viewed, **Product + BreadcrumbList JSON-LD**.
- **Quick View** — modal buy-flow (variants, qty, wishlist) opened from any product card.
- **Cart** — server-owned cart (httpOnly cookie) synced across header badge, drawer and the
  full cart page; checkout hands off to Shopify’s hosted, PCI-compliant page.
- **Multi-currency** — top-bar switcher backed by **Shopify Markets** (`@inContext`); the
  whole template (catalogue, PDP, cart) re-prices in the selected market currency.
- **Wishlist &amp; Compare** — persisted client-side (localStorage), with a compare page + floating tray.
- **Customer accounts** — OAuth 2.0 + PKCE login, account dashboard (profile + orders),
  login-aware account drawer.
- **Search** — predictive header search + full search-results page.
- **Content** — About, Contact (+ form), generic Shopify CMS pages (`/pages/*`), a **Journal**
  blog, Team profiles, Style Guide, Changelog, Licenses, custom 404, password-protected page.
- **SEO** — per-page OG/Twitter meta + default share image, Organization + WebSite/SearchAction
  JSON-LD, Product/BlogPosting JSON-LD, dynamic `robots.txt` &amp; `/sitemap.xml`, `noindex` on
  functional pages, canonical URLs.
- **A11y / motion** — skip link, focus-visible rings, ARIA + focus-trapped dialogs on
  interactive islands, AA-compliant tokens, reduced-motion-safe animations + progressive scroll reveal.
- **Fully responsive** — mobile off-canvas menu (accordion mega-menu), bottom nav, keyboard accessible.

---

## Design — Magazine Aesthetic

asmaz is built around an **editorial “Daily Tech Drop” magazine** design language — it reads
like a tech publication that happens to sell, not a generic grid store.

- **Cover-story layouts** — a full-bleed hero with “Issue / This Week / Cover Story” eyebrows,
  oversized condensed headlines, scrolling news tickers, editorial bento grids, marquees and
  pull-quote testimonials.
- **Palette** — **news-black** surfaces (`#050505`), a single **signal-red** accent (`#ef233c`,
  with an AA-safe `signal-strong` for red text), **cyber-yellow** highlights (`#ffd60a`) and an
  **electric-blue** “NEW” signal. Cold, high-contrast, newsprint-inspired.
- **Typography** — **Barlow Condensed** for tall, magazine-style display headlines + **Inter**
  for clean UI/body copy.
- **Plain-CSS design system** — every colour, font, radius, shadow and spacing value is a CSS
  custom property in [`src/styles/tokens.css`](src/styles/tokens.css). Recolour or re-skin the
  whole magazine from that one file — **no Tailwind, no build-time theme config**.
- **Scoped sections** — the ported magazine sections live under `.mz-home` / `.mz-shop` so their
  bespoke styling never leaks into the rest of the app.

> Want a different brand? Edit `tokens.css` (palette + fonts) and `src/config/site.ts`
> (name, announcements, nav, footer) — the editorial layout adapts to your content.

---

## Pages

### Storefront
| Route | File |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/products` | `src/pages/products/index.astro` |
| `/products/[handle]` | `src/pages/products/[handle].astro` |
| `/collections` | `src/pages/collections/index.astro` |
| `/collections/[handle]` | `src/pages/collections/[handle].astro` |
| `/search` | `src/pages/search.astro` |
| `/cart` | `src/pages/cart.astro` |
| `/compare` | `src/pages/compare.astro` |

### Content &amp; Blog
| Route | File |
| --- | --- |
| `/journal` | `src/pages/journal/index.astro` |
| `/journal/[handle]` | `src/pages/journal/[handle].astro` |
| `/pages/about` | `src/pages/pages/about.astro` |
| `/pages/contact` | `src/pages/pages/contact.astro` |
| `/pages/[handle]` | `src/pages/pages/[handle].astro` |
| `/team/[slug]` | `src/pages/team/[slug].astro` |

### Account (Customer Account API)
| Route | File |
| --- | --- |
| `/account` | `src/pages/account/index.astro` |
| `/account/login` | `src/pages/account/login.ts` |
| `/account/authorize` | `src/pages/account/authorize.ts` |
| `/account/logout` | `src/pages/account/logout.ts` |

### Template / Info
| Route | File |
| --- | --- |
| `/pages/style-guide` | `src/pages/pages/style-guide.astro` |
| `/pages/changelog` | `src/pages/pages/changelog.astro` |
| `/pages/licenses` | `src/pages/pages/licenses.astro` |

### Utility &amp; SEO
| Route | File |
| --- | --- |
| `/404` | `src/pages/404.astro` |
| `/password` | `src/pages/password.astro` |
| `/sitemap.xml` | `src/pages/sitemap.xml.ts` |
| `/robots.txt` | `src/pages/robots.txt.ts` |

### API routes (same-origin, server-side)
| Route | File | Purpose |
| --- | --- | --- |
| `/api/cart` · `/api/cart/{add,update,remove}` | `src/pages/api/cart*` | Server-owned cart |
| `/api/search` | `src/pages/api/search.ts` | Predictive search |
| `/api/products/[handle]` | `src/pages/api/products/[handle].ts` | Quick View product fetch |
| `/api/newsletter` · `/api/contact` | `src/pages/api/*` | Form endpoints (stubs to wire up) |
| `/api/account/me` | `src/pages/api/account/me.ts` | Session check |

---

## Getting Started

### Prerequisites
- **Node.js ≥ 22.12**
- **yarn** (a `yarn.lock` is committed). No yarn? Enable Corepack (ships with Node): `corepack enable`.

### Install
```bash
yarn install
cp .env.example .env     # add Shopify credentials — or use mock.shop (see below)
```

### Develop
```bash
yarn dev                 # dev server → http://localhost:4321
```

### Build &amp; run (standalone Node server)
```bash
yarn build               # → dist/server/entry.mjs
yarn start               # node --env-file-if-exists=.env ./dist/server/entry.mjs
# or provide env yourself: HOST=0.0.0.0 PORT=4321 node ./dist/server/entry.mjs
```

> **Zero-credential demo:** set `SHOPIFY_STOREFRONT_ENDPOINT=https://mock.shop/api` in
> `.env` to run the full template against Shopify’s public mock catalogue — no store, no token.

> **Env is read once at startup.** After editing `.env`, **restart** the dev/preview/start
> server — a running process won’t pick up the change.

---

## Environment Variables

All server-only (no `PUBLIC_` prefix). See `.env.example` for full setup notes. Read via a small
`env()` helper (build-time `import.meta.env` → runtime `process.env`).

| Variable | Required | Purpose |
| --- | --- | --- |
| `SITE_URL` | recommended | Public production origin — canonical URLs, sitemap, robots (default `http://localhost:4321`) |
| `SHOPIFY_SHOP_DOMAIN` | yes¹ | `your-shop.myshopify.com` |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | yes¹ | Storefront API private token (header: `Shopify-Storefront-Private-Token`) |
| `SHOPIFY_STOREFRONT_ENDPOINT` | no | Full endpoint override (e.g. `https://mock.shop/api`) — skips the two above |
| `SHOPIFY_API_VERSION` | no | Storefront API version (default `2026-04`) |
| `CUSTOMER_ACCOUNT_API_CLIENT_ID` | for login | Customer Account API client id |
| `SHOPIFY_SHOP_ID` | for login | **numeric** Shop ID |
| `CUSTOMER_ACCOUNT_API_VERSION` | no | Customer Account API version (default `2025-01`) |

¹ Not required when `SHOPIFY_STOREFRONT_ENDPOINT` is set.

> **Customer login** needs a public HTTPS origin (a tunnel) — Shopify rejects `http`/`localhost`.
> Register the callback / JS-origin / logout URLs in the Customer Account API app (details in `.env.example`).

---

## Configuration &amp; Customization

- **Brand &amp; navigation** → `src/config/site.ts` — name, tagline, announcements, nav,
  departments, footer columns, value props, payments, socials, currencies, default OG image.
- **Design tokens** → `src/styles/tokens.css` — the single source of colour, type, radii and
  shadows (`:root` custom properties). The ported “magazine” palette aliases derive from these,
  so the whole theme is recolourable from one place. Fonts (Barlow Condensed + Inter) load in `BaseLayout.astro`.
- **SEO defaults** → `src/layouts/BaseLayout.astro` — title pattern, meta/OG/Twitter, JSON-LD,
  per-page `type` / `noindex` / `jsonLd` props.
- **Local content data** → `src/data/team.ts` (team profiles). Everything else (products,
  collections, pages, blog) is Shopify-driven.
- **Journal blog** expects a Shopify blog with handle **`news`** (configurable per call in
  `src/lib/shopify/services/content.ts` → `getArticles` / `getArticle`).
- **Form stubs to wire up** → `src/pages/api/newsletter.ts` and `src/pages/api/contact.ts`
  validate input; connect them to your ESP / helpdesk.
- **Checkout** is Shopify’s hosted page (`cart.checkoutUrl`) — by design.

---

## Project Structure

```
public/
├─ images/                 # static images (compressed) + og-default.jpg
├─ favicon.svg  favicon.ico
src/
├─ config/site.ts          # brand, nav, footer, announcements, currencies, payments
├─ data/team.ts            # local content data (team profiles)
├─ middleware.ts           # per-request market/country context (currency)
├─ styles/                 # plain CSS — global.css barrel imports the layers:
│  ├─ tokens.css           #   :root design tokens (palette, type, radii, shadows)
│  ├─ base.css ui.css layout.css islands.css
│  ├─ shop.css product.css cart.css home.css refine.css content.css account.css
│  └─ *-magazine.css polish.css pages.css misc-pages.css
├─ lib/shopify/            # SERVER-ONLY data layer (client → graphql → services → transforms)
│  ├─ client.ts            #   single shopifyFetch() entry point (private token)
│  ├─ graphql/ services/ transforms.ts types.ts
│  ├─ customer/            #   Customer Account API (OAuth 2.0 + PKCE)
│  └─ index.ts             #   barrel — import from "~/lib/shopify"
├─ lib/                    # cart-server, cart-cookie, request-context, pagination, filters, utils
├─ stores/                 # nanostores: cart, wishlist, compare, recently-viewed, drawers
├─ layouts/BaseLayout.astro
├─ components/             # ui/ layout/ home/ product/ shop/ collection/ content/ react/
└─ pages/                  # routes + api/ (see Pages above)
astro.config.mjs  ·  package.json  ·  tsconfig.json  ·  .env.example
```

### Architecture notes
- **Security invariant:** never import `lib/shopify/*` from a `.tsx` island or any `client:*`
  code. Islands talk only to same-origin `/api/*`.
- **Data layer is strictly layered:** `client.ts` → `graphql/*` → `services/*` → `transforms.ts`.
  Pages import services via the `~/lib/shopify` barrel.
- **Cart** is a framework-agnostic nanostore synced to an httpOnly `fl_cart_id` cookie;
  `/api/cart/*` self-heals an expired cart id and re-prices to the selected market.
- **Plain-CSS design system:** tokens are `:root` custom properties; components use semantic
  class names (the same classes in `.astro` and `.tsx`). **No Tailwind.**

---

## Tech Stack

| Dependency | Version | Purpose |
| --- | --- | --- |
| Astro | ^6.4.7 | SSR framework (`output: "server"`) |
| @astrojs/node | ^10 | Standalone Node adapter |
| @astrojs/react | ^4 | React islands integration |
| react · react-dom | ^19 | Interactive islands |
| nanostores · @nanostores/react | ^0.11 · ^0.8 | Framework-agnostic state (cart, wishlist, compare) |
| lucide-react | ^1.20 | Icon set |
| clsx | ^2.1 | Class composition |
| Plain CSS | — | Design system (no Tailwind) |
| Shopify Storefront API | `2026-04` | Catalogue, cart, search, content |
| Shopify Customer Account API | `2025-01` | Login (OAuth 2.0 + PKCE) |

> **Version compatibility (don’t break):** `astro@6` ⇄ `@astrojs/node@^10` ⇄ `@astrojs/react@^4`,
> `react@19` + `react-dom@19`. The Vite `optimizeDeps`/`dedupe` config in `astro.config.mjs`
> forces a single ESM copy of React for the islands — keep it.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `yarn dev` | Start the dev server (HMR) at `:4321` |
| `yarn build` | Build the production site → `dist/server/entry.mjs` |
| `yarn preview` | Preview the built server |
| `yarn start` | Run the built standalone Node server (loads `.env`) |
| `yarn astro` | Run Astro CLI commands |

> No test runner, linter or formatter is configured — only the scripts above.

---

## Deployment

`yarn build` produces a standalone Node server at `dist/server/entry.mjs`. Run it on any
Node ≥ 22.12 host (Fly, Railway, Render, a VPS, etc.) with `HOST`/`PORT`, `SITE_URL` and the
Shopify env vars. Put it behind an HTTPS origin/CDN; cache the content-hashed `/_astro/*`
assets long-term (HTML is currency-personalized per cookie, so don’t shared-cache it). For
customer login, that origin must be public HTTPS and match the URLs registered in the
Customer Account API app.

---

## License

Released under the **MIT License**. See [`LICENSE`](LICENSE).
