// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import node from "@astrojs/node";

// Headless Shopify storefront — server-rendered so the private
// Storefront token stays on the server and cart cookies work.
// https://astro.build/config
export default defineConfig({
  // Public production origin — used for canonical URLs, sitemap and robots.
  // Override per-deploy with the SITE_URL env var (falls back to localhost in dev).
  site: process.env.SITE_URL || "http://localhost:4321",
  // Lock canonical URL shape (no trailing slash) to avoid duplicate-URL signals.
  trailingSlash: "never",
  output: "server",
  adapter: node({ mode: "standalone" }),
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
