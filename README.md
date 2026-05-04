# WebOS — A Browser-Native Desktop OS

A complete, privacy-first operating system that runs entirely in your browser. **35+ apps**, multiple shell themes (macOS, Windows 11, GNOME, Hyprland), tiling window manager, command palette, and a full developer toolkit — all client-side, zero servers, zero tracking.

![WebOS](https://img.shields.io/badge/apps-35+-purple) ![offline](https://img.shields.io/badge/offline-100%25-green) ![license](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

### Shell & Window Manager
- **4 shell themes**: macOS (dock + menubar), Windows 11 (taskbar + start menu), GNOME (activities), Hyprland (tiling-first)
- **Hyprland-style auto-tiling** — toggle in Settings or with Ctrl+T
- **Edge-snap windows** — drag to screen edge or use Ctrl+←/→
- **Right-click desktop menu** — close all, minimize all, tile, settings
- **Bento-grid launcher** with category groups + fuzzy search
- **Command palette** (Ctrl+K) — instantly launch apps & run commands
- **Mobile/tablet responsive** — works great on phones with touch
- **Animated boot loader** with progress
- **Onboarding tour** (replayable from Settings)
- **Themes**: Dark/Light + 360° accent hue + 5 wallpapers

### Apps (35+)

**System** — Files, Notes, Calculator, Clock, Calendar
**Productivity** — Tasks, Pomodoro, Stopwatch, Thread Summarizer, Brain Dump, Timezone Planner, Metadata Scrubber, Unit Converter
**Lifestyle** — Meeting Cost, Subscriptions, Rent Split, Review Analyzer, Legal Decoder
**Creative** — Paint, Palette Builder, Color Vision Sim, Markdown Editor, QR Code
**Developer / Tech** — **Code Editor (Monaco)**, **DuckDB SQL (WASM)**, JSON Tools, Regex, SSL Decoder, JWT Inspector, Cron Builder, Code Screenshot, PII Sanitizer, Markdown Table, OpenAPI Viewer, Diff Checker, Password Generator

### Custom Apps
Add your own apps from **Settings → Apps**:
- **URL mode** — embed any iframe-friendly site
- **HTML mode** — paste raw HTML/JS, runs sandboxed

### Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| Ctrl/⌘ + K | Command palette |
| Ctrl/⌘ + Space | App launcher |
| Ctrl/⌘ + W | Close window |
| Ctrl/⌘ + M | Minimize |
| F11 | Maximize |
| Ctrl/⌘ + ← / → | Snap left/right |
| Ctrl/⌘ + T | Toggle tiling |
| Alt + Tab | Cycle windows |

## 🚀 Run locally

```bash
bun install
bun dev
```

## 🐳 Docker (single container)

```bash
docker build -t webos .
docker run -p 8080:80 webos
# open http://localhost:8080
```

## 📦 Deploy

Static-only output — deploy `dist/client/` to GitHub Pages, Cloudflare Pages, Netlify, Vercel, or any static host.

### Quick build

```bash
bun run build
```

### Deploy to GitHub Pages

This project includes automated GitHub Pages deployment with GitHub Actions.

**Option 1: Automatic (Recommended)**
- Push to `main` branch
- GitHub Actions automatically builds and deploys to GitHub Pages
- Your app will be available at: `https://shonejj.github.io/pixel-sanctuary/`

**Option 2: Manual deployment**

```bash
# Install gh-pages (one-time setup)
bun add -d gh-pages

# Build and deploy
bun run deploy:pages
```

**Configuration:**
- GitHub Pages base URL is automatically set to `/pixel-sanctuary/`
- To customize: `VITE_BASE_URL=/custom-path/ bun run build:pages`
- Ensure GitHub Pages is enabled in repository Settings with the `gh-pages` branch as source

**Build output:**
- Client-side code goes to `dist/client/`
- All routes are client-side (React Router handles routing)
- Works fully offline once loaded

### Deploy to other platforms

**Netlify:**
```bash
# Build command: bun run build
# Publish directory: dist/client
# Note: Configure for SPA by setting redirects (see netlify.toml or UI)
```

**Vercel:**
```bash
# Build command: bun run build
# Output directory: dist/client
```

**Cloudflare Pages:**
```bash
# Build command: bun run build
# Build output directory: dist/client
```

## 🔒 Privacy

Everything runs in your browser. No analytics, no telemetry, no servers. All data lives in `localStorage`. DuckDB queries run in a Web Worker.

## 📄 License

MIT
