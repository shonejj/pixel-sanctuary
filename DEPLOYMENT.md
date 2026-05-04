# GitHub Pages Deployment Guide

## Overview

This project is configured for easy deployment to GitHub Pages. All assets are built to `dist/client/` and ready for static hosting.

## Build Outputs

```
dist/
├── client/              # GitHub Pages deployment directory
│   ├── assets/         # Bundled JavaScript, CSS, and images
│   └── (index.html)    # Built by TanStack on serve
└── server/             # Server files (not used for GitHub Pages)
```

## Quick Start

### Automatic Deployment (GitHub Actions)

1. Ensure `.github/workflows/deploy.yml` exists (already included)
2. Push to `main` branch
3. GitHub Actions automatically:
   - Builds the app with correct base URL (`/pixel-sanctuary/`)
   - Uploads to GitHub Pages
   - Deploys to `https://shonejj.github.io/pixel-sanctuary/`

No additional setup needed beyond initial repository settings.

### Manual Deployment with gh-pages

```bash
# First time setup
bun add -d gh-pages

# Build and deploy
VITE_BASE_URL=/pixel-sanctuary/ bun run build
npx gh-pages -d dist/client
```

## Configuration

### Base URL

- **Automatic (GitHub Actions)**: Uses `/pixel-sanctuary/` (repo name)
- **Manual deployment**: Set via environment variable
  ```bash
  VITE_BASE_URL=/pixel-sanctuary/ bun run build
  ```

### Build Scripts

| Script | Purpose |
|--------|---------|
| `bun run build` | Build for development/preview |
| `bun run build:dev` | Build in development mode |
| `bun run build:pages` | Build with `/pixel-sanctuary/` base URL |
| `bun run deploy:pages` | Build + deploy via gh-pages CLI |

## GitHub Repository Setup

1. Go to **Settings → Pages**
2. Set source to: **Deploy from a branch**
3. Select: **gh-pages** branch (if using manual gh-pages deployment)
4. For Actions workflow: GitHub automatically uses `github.io` endpoint

## What Gets Deployed

- ✅ `dist/client/assets/*` - All bundled code and assets
- ✅ Complete React Router SPA with client-side routing
- ✊ All 35+ WebOS apps and features
- ✅ Offline-capable (runs from browser cache)
- ❌ `dist/server/` - Not deployed (server-rendered output)
- ❌ `src/` - Source files (only compiled code deployed)

## Troubleshooting

### App works locally but not on GitHub Pages

**Issue**: React Router routes return 404 on page refresh
- GitHub Pages serves static files only
- React Router handles routing client-side
- Ensure base URL is correctly set: `VITE_BASE_URL=/pixel-sanctuary/`

### Base URL mismatch

**Symptoms**: CSS/JS assets fail to load, blank page
- Verify `vite.config.ts` has: `base: process.env.VITE_BASE_URL || "/"`
- Check GitHub Actions passes correct base URL
- For manual deployment: always use `VITE_BASE_URL=/pixel-sanctuary/`

### gh-pages branch doesn't exist

**Solution**:
```bash
# First push creates the branch automatically
VITE_BASE_URL=/pixel-sanctuary/ bun run build
npx gh-pages -d dist/client
```

## Environment Variables for CI/CD

If deploying elsewhere, set:
- `VITE_BASE_URL` - Base path for your deployment (e.g., `/repo-name/`)

Example for different platforms:

**GitHub Pages**: `/pixel-sanctuary/`
**Cloudflare Pages**: `/` (root domain)
**Netlify**: `/` (root domain)
**Vercel**: `/` (root domain)

## Next Steps

1. ✅ Run `bun dev` to test locally
2. ✅ Run `bun run build:pages` to test the build
3. ✅ Push to `main` - GitHub Actions handles deployment
4. ✅ Visit `https://shonejj.github.io/pixel-sanctuary/`

For any issues, check:
- `.github/workflows/deploy.yml` workflow status
- Repository Settings → Pages
- GitHub Actions logs under Actions tab
