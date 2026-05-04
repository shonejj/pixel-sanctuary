#!/bin/bash
# Deploy to GitHub Pages
# This script builds the app and uses gh-pages to deploy to GitHub Pages

set -e

echo "🔨 Building for GitHub Pages..."
bun run build:pages

echo "📤 Deploying to GitHub Pages..."
npx gh-pages -d dist/client

echo "✅ Deployed! Visit: https://shonejj.github.io/pixel-sanctuary/"
