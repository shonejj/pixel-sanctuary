# Deployment Architecture

## Build Flow

```
src/
├── routes/
├── components/
├── webos/
└── styles.css
        ↓
    [Vite Build]
        ↓
    ┌─────────────────────────────────────┐
    │         dist/                       │
    ├──────────────────┬──────────────────┤
    │  client/         │   server/        │
    │  ├─ assets/      │   ├─ index.js    │
    │  │  ├─ *.js      │   └─ assets/     │
    │  │  ├─ *.css     │                  │
    │  │  └─ *.jpg     │ (not used)       │
    │  └─ (no HTML)    │                  │
    └─────────────────────────────────────┘
        ↓
    [Post-Build Script: scripts/gen-index.mjs]
    Generates: dist/client/index.html
        ↓
    ┌─────────────────────────────────────┐
    │    Ready for Deployment             │
    │    dist/client/                     │
    │    ├─ index.html         ← New!     │
    │    ├─ assets/ (JS, CSS)             │
    │    └─ *.jpg (images)                │
    └─────────────────────────────────────┘
        ↓
    [GitHub Pages Upload]
        ↓
    https://shonejj.github.io/pixel-sanctuary/
```

## Deployment Timeline

### GitHub Actions Workflow (Automatic)

1. **Trigger**: Push to `main` branch (< 1 second)
2. **Checkout**: Clone repo (5-10 seconds)
3. **Setup Bun**: Install runtime (10-15 seconds)
4. **Install**: `bun install` dependencies (30-60 seconds)
5. **Build**: `VITE_BASE_URL=/pixel-sanctuary/ vite build` (30-60 seconds)
6. **Post-Build**: `node scripts/gen-index.mjs` generates index.html (1-2 seconds)
7. **Setup Pages**: Configure artifacts (5 seconds)
8. **Upload**: Upload `dist/client/` to Pages artifact (10-20 seconds)
9. **Deploy**: GitHub deploys artifact to Pages (30-60 seconds)

**Total**: ~2-3 minutes

### Manual Deployment (One-time Setup)

1. Run: `bun run deploy:pages`
2. This runs:
   - `VITE_BASE_URL=/pixel-sanctuary/ vite build` (60-120 seconds)
   - `node scripts/gen-index.mjs` (1-2 seconds)
   - `npx gh-pages -d dist/client` (creates/updates `gh-pages` branch, 10-30 seconds)

**Total**: ~2-3 minutes first time, ~1 minute after

## File Organization

After Build + Post-Build Script:

```
dist/client/
├── index.html                    # Generated entry point
│   - Contains: <script> tags for all .js files
│   - Contains: <link> tags for all .css files
│   - Base: /pixel-sanctuary/
│
├── assets/
│   ├── index-Cr_8rHPd.js        # Main app bundle
│   ├── index-Df3IsjdX.js        # Router/app runtime
│   ├── index.es-Bwd5rcH4.js     # Shared utilities
│   ├── duckdb-browser-*.js      # DuckDB WASM
│   ├── html2canvas.esm-*.js     # Screenshot lib
│   ├── purify.es-*.js           # HTML sanitizer
│   ├── styles-DqupCUYe.css      # Tailwind CSS
│   └── *.jpg                    # Wallpaper images
│
└── (other static assets)
```

## Important Notes

### Why Index.html is Generated

- **TanStack Start** builds for SSR (server-side rendering)
- **GitHub Pages** only serves static files
- **Solution** Post-build script creates `index.html` that loads all client bundles
- **Result**: Pure SPA deployed to static hosting

### Base URL Configuration

The post-build script reads `VITE_BASE_URL` environment variable:
- **GitHub Actions**: Set to `/pixel-sanctuary/`
- **Dev builds**: Defaults to `/`
- **Custom**: `VITE_BASE_URL=/custom/ bun run build && node scripts/gen-index.mjs`

### React Router on GitHub Pages

- ✅ Client-side routing works perfectly
- ✅ All app links work: `/pixel-sanctuary/...`
- ✅ Bookmarks and direct links work
- ✅ No server-side routes needed

## Verification Checklist

Before pushing:

```bash
# 1. Build locally
bun run build:pages

# 2. Check index.html exists
ls -la dist/client/index.html

# 3. Check assets are referenced
grep "assets/index" dist/client/index.html

# 4. Check base URL is correct
grep "/pixel-sanctuary/" dist/client/index.html

# 5. Preview locally
bun run preview
```

Expected in `dist/client/index.html`:
```html
<link rel="stylesheet" href="/pixel-sanctuary/assets/styles-DqupCUYe.css" />
<script type="module" src="/pixel-sanctuary/assets/index-Cr_8rHPd.js"></script>
```

## Troubleshooting

| Symptom | Cause | Solution |
|---------|-------|----------|
| Blank page | Missing `index.html` | Run post-build script: `node scripts/gen-index.mjs` |
| 404 assets | Wrong base URL | Check `VITE_BASE_URL=/pixel-sanctuary/` during build |
| App works local but not Pages | Asset path mismatch | Verify `dist/client/index.html` has correct paths |
| Workflow takes 10+ min | Slow install or network | Check Actions tab for actual error, not just duration |
| Workflow cancelled | Too many concurrent | Verify concurrency settings in workflow |
