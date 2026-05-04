#!/bin/bash
# Deploy to GitHub Pages

# Exit on error
set -e

echo "🔨 Building for GitHub Pages..."
VITE_BASE_URL=/pixel-sanctuary/ bun run build

echo "📤 Deploying to GitHub Pages..."
npx gh-pages -d dist/client

echo "✅ Deployed! Visit: https://shonejj.github.io/pixel-sanctuary/"
