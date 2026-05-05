#!/usr/bin/env node

/**
 * Post-build script to generate index.html for GitHub Pages (SPA mode).
 * Picks up the real client entry chunk (main-*.js) and CSS produced by Vite.
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distClientPath = path.join(__dirname, "../dist/client");

async function generateIndexHtml() {
  const assetsDir = path.join(distClientPath, "assets");
  const files = await fs.readdir(assetsDir);

  const styleFile = files.find((f) => f.startsWith("styles") && f.endsWith(".css"));
  // The real client entry is the `main-*.js` chunk emitted by TanStack Start.
  const entryFile = files.find((f) => /^main-.*\.js$/.test(f));

  if (!entryFile) {
    console.error("❌ Could not locate main-*.js entry chunk in dist/client/assets");
    process.exit(1);
  }

  const baseUrl = process.env.VITE_BASE_URL || "/";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>WebOS — A private, offline desktop in your browser</title>
    <meta name="description" content="A complete browser-based operating system with 35+ powerful apps. Privacy-first, offline-capable, zero servers." />
    <meta name="author" content="shonejj" />
    <meta property="og:title" content="WebOS — A private, offline desktop in your browser" />
    <meta property="og:description" content="A complete browser-based operating system with 35+ powerful apps. Privacy-first, offline-capable, zero servers." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary" />
${styleFile ? `    <link rel="stylesheet" href="${cleanBase}assets/${styleFile}" />\n` : ""}    <link rel="icon" href="${cleanBase}favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${cleanBase}assets/${entryFile}"></script>
  </body>
</html>`;

  try {
    await fs.copyFile(path.join(__dirname, "../favicon.svg"), path.join(distClientPath, "favicon.svg"));
  } catch {}

  // SPA fallback for GitHub Pages deep-links
  await fs.writeFile(path.join(distClientPath, "index.html"), indexHtml);
  await fs.writeFile(path.join(distClientPath, "404.html"), indexHtml);
  // Prevent Jekyll processing on GH Pages
  await fs.writeFile(path.join(distClientPath, ".nojekyll"), "");

  console.log("✅ Generated index.html + 404.html");
  console.log(`   Base URL: ${cleanBase}`);
  console.log(`   CSS:      ${styleFile}`);
  console.log(`   Entry:    ${entryFile}`);
}

generateIndexHtml().catch((err) => {
  console.error("❌ Failed to generate index.html:", err);
  process.exit(1);
});
