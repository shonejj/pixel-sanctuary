// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Support configurable base URL for GitHub Pages deployment
// Usage: npm run build:pages (auto-configures /pixel-sanctuary/)
// Or: VITE_BASE_URL=/custom-path/ npm run build
const baseUrl = process.env.VITE_BASE_URL || "/";

export default defineConfig({
  vite: {
    base: baseUrl,
    // Ensure proper SPA handling
    build: {
      rollupOptions: {
        output: {
          // Generate proper asset paths
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js",
          assetFileNames: "assets/[name]-[hash][extname]",
        },
      },
    },
  },
});
