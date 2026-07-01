# Deploying **asmaz** to Cloudflare Workers

This storefront runs as a single SSR **Cloudflare Worker** via the
[`@astrojs/cloudflare`](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
adapter (v13, which builds on `@cloudflare/vite-plugin`). `astro dev`,
`astro preview` and production all run on the real **workerd** runtime, so what
you test locally matches what deploys.

Node built-ins the app uses server-side — `node:crypto` (OAuth PKCE) and
`node:async_hooks` (per-request market context) — plus `process.env` are all
provided by the **`nodejs_compat`** flag set in [`wrangler.jsonc`](./wrangler.jsonc).

---

## 0. Prerequisites

- **Node ≥ 22.12** and **yarn** (`corepack enable` gives you yarn 1.x).
- A **Cloudflare account** (the free plan is enough).
- `wrangler` is already a dev dependency — run it with `yarn wrangler …`
  (or `npx wrangler …`). No global install needed.

```bash
yarn install
yarn wrangler login      # opens a browser once to authorize your account
```

---

## 1. Configure runtime secrets

All Shopify config is **server-only** and read from `process.env` by the
`env()` helper in `src/lib/shopify`. On Workers, `process.env` is auto-populated
from your Worker's **vars + secrets** (thanks to `nodejs_compat` +
`compatibility_date ≥ 2025-04-01`). Set each **secret** once — they are stored
encrypted by Cloudflare and are **not** kept in `wrangler.jsonc`:

```bash
yarn wrangler secret put SHOPIFY_SHOP_DOMAIN                # e.g. your-shop.myshopify.com
yarn wrangler secret put SHOPIFY_STOREFRONT_PRIVATE_TOKEN   # shpat_…

# Customer login (OAuth) — only if you use accounts:
yarn wrangler secret put CUSTOMER_ACCOUNT_API_CLIENT_ID     # shp_…
yarn wrangler secret put SHOPIFY_SHOP_ID                    # numeric shop id
```

Non-secret knobs already have safe in-code defaults
(`SHOPIFY_API_VERSION=2026-04`, `CUSTOMER_ACCOUNT_API_VERSION=2025-01`). Override
them only if needed, by adding a `vars` block to `wrangler.jsonc`:

```jsonc
"vars": { "SHOPIFY_API_VERSION": "2026-04", "CUSTOMER_ACCOUNT_API_VERSION": "2025-01" }
```

> **Token-less demo instead?** Skip the secrets above and set a single var
> `"vars": { "SHOPIFY_STOREFRONT_ENDPOINT": "https://mock.shop/api" }` to run
> against Shopify's public mock (no cart persistence beyond the session, no login).

---

## 2. Sessions KV namespace (one-time)

The adapter enables Astro sessions on a **`SESSION`** KV binding. Create the
namespace and paste its id into `wrangler.jsonc`:

```bash
yarn wrangler kv namespace create SESSION
```

```jsonc
// wrangler.jsonc
"kv_namespaces": [{ "binding": "SESSION", "id": "<paste-the-id-here>" }]
```

> On a first `yarn deploy`, recent Wrangler will otherwise offer to **provision**
> this namespace for you interactively — either way works. Local `dev`/`preview`
> need no provisioning (an in-memory KV is used).

---

## 3. Set the public origin (build-time)

`SITE_URL` is baked into canonical URLs, the sitemap and `robots.txt` **at build
time**, so set it in the build environment — not as a Worker secret. Use your
Worker URL (or custom domain):

```bash
SITE_URL=https://asmaz-storefront.<your-subdomain>.workers.dev yarn deploy
```

(Windows PowerShell: `$env:SITE_URL="https://…"; yarn deploy`)

---

## 4. Deploy

```bash
yarn deploy        # == astro build && wrangler deploy
```

`astro build` emits the worker to `dist/server/` (with a generated
`dist/server/wrangler.json`) and static assets to `dist/client/`; the build also
writes `.wrangler/deploy/config.json` so a plain `wrangler deploy` from the repo
root automatically picks up that generated config. First deploy prints your live
URL: `https://asmaz-storefront.<subdomain>.workers.dev`.

---

## 5. Register OAuth URLs (customer login only)

Customer login needs a **public HTTPS origin** — your deployed Worker qualifies
(unlike `localhost`). In Shopify admin → Customer Account API → *Application
setup*, register (swap in your final origin):

- **Callback URI:** `https://YOUR_ORIGIN/account/authorize`
- **JavaScript origin:** `https://YOUR_ORIGIN`
- **Logout URI:** `https://YOUR_ORIGIN`

The app derives the origin from `X-Forwarded-Proto/Host`, so it works behind
Cloudflare automatically.

---

## Alternative: Cloudflare Git-connected builds (Workers Builds / CI)

If you connect the repo to Cloudflare instead of deploying from your machine,
Cloudflare clones and runs the build in its own CI. A few things differ:

- **Lockfile:** Cloudflare picks the package manager from the committed lockfile.
  This repo commits **both** `package-lock.json` and `yarn.lock`; Cloudflare
  detects npm and runs **`npm ci`**, which fails if `package-lock.json` is out of
  sync with `package.json`. After any dependency change, keep it in sync:
  ```bash
  npm install --package-lock-only   # then commit package-lock.json
  ```
  (Committing only `yarn.lock` is **not** enough — that was the cause of the
  `npm ci … Missing: @astrojs/cloudflare from lock file` build failure.)
- **Build command:** `npm run build` (i.e. `astro build`).
- **Deploy command:** `npx wrangler deploy` (auto-uses the generated
  `dist/server/wrangler.json` via `.wrangler/deploy/config.json`).
- **Secrets + vars:** set them in the Cloudflare dashboard (Workers project →
  Settings → Variables and Secrets) instead of `wrangler secret put`. Add
  `SHOPIFY_SHOP_DOMAIN`, `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`,
  `CUSTOMER_ACCOUNT_API_CLIENT_ID`, `SHOPIFY_SHOP_ID` as **secrets**.
- **`SITE_URL`:** add it as a **build-time** environment variable in the dashboard
  (it's baked into canonical URLs during `astro build`).
- **`SESSION` KV:** create the namespace and add its `id` to `wrangler.jsonc`
  (committed), or bind it in the dashboard.

## Local development on the Workers runtime

`astro dev` / `astro preview` run on workerd and read **`.dev.vars`** (Cloudflare's
local secrets file — **not** `.env`). Copy your values there (already gitignored):

```
# .dev.vars
SHOPIFY_SHOP_DOMAIN=your-shop.myshopify.com
SHOPIFY_STOREFRONT_PRIVATE_TOKEN=shpat_…
CUSTOMER_ACCOUNT_API_CLIENT_ID=shp_…
SHOPIFY_SHOP_ID=000000000000
```

```bash
yarn dev        # http://localhost:4321 on workerd
```

---

## Notes & gotchas

- **Bump `compatibility_date`** in `wrangler.jsonc` to your deploy date over time.
  Keep it `≥ 2025-04-01` so `process.env` stays auto-populated.
- **Buyer IP** is read from the `CF-Connecting-IP` header (see `src/lib/buyer-ip.ts`).
  `Astro.clientAddress` is **not** available on the Cloudflare adapter — don't
  reintroduce it.
- **No Node server output** anymore — there is no `dist/server/entry.mjs`
  standalone server and no `yarn start`. Deploys are the Worker only.
- **Custom domain:** add a route/custom domain in the Cloudflare dashboard (Workers
  → your worker → Domains & Routes), then rebuild with `SITE_URL` pointing at it.
- `yarn cf-typegen` regenerates `worker-configuration.d.ts` (binding types) after
  you change bindings in `wrangler.jsonc`.
