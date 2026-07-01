// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

// Headless Shopify storefront — server-rendered on Cloudflare Workers so the
// private Storefront token stays on the server and cart cookies work. The
// worker runs on workerd; Node built-ins used server-side (node:crypto for
// PKCE, node:async_hooks for the request context) are provided by the
// `nodejs_compat` flag set in wrangler.jsonc.
// https://astro.build/config
export default defineConfig({
  // Public production origin — baked in at BUILD time for canonical URLs,
  // sitemap and robots. Set SITE_URL in the build environment to your worker
  // URL (e.g. https://asmaz-storefront.<subdomain>.workers.dev or a custom
  // domain); falls back to localhost for dev.
  site: process.env.SITE_URL || "http://localhost:4321",
  // Lock canonical URL shape (no trailing slash) to avoid duplicate-URL signals.
  trailingSlash: "never",
  output: "server",
  adapter: cloudflare({
    // The storefront serves only remote Shopify-CDN images (no astro:assets
    // transforms), so skip image optimization entirely — no Images binding
    // needed and nothing to run on the worker.
    imageService: "passthrough",
  }),
  integrations: [react()],
  // Prefetch in-viewport internal links for instant navigation.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  vite: {
    // Allow the tunnel host to reach the dev server (otherwise Vite
    // blocks unknown Host headers). localhost is always allowed.
    server: {
      allowedHosts: true,
    },
    // Force Vite to pre-bundle React to ESM so islands get the
    // named `createRoot` export, and dedupe to a single copy.
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime"],
    },
    resolve: {
      dedupe: ["react", "react-dom"],
    },
  },
});
