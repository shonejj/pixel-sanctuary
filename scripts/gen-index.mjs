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
  // The home route chunk is dynamically imported during router hydration.
  const routeFile = files.find((f) => /^index-(?!es-).*\.js$/.test(f));

  if (!entryFile) {
    console.error("❌ Could not locate main-*.js entry chunk in dist/client/assets");
    process.exit(1);
  }

  const baseUrl = process.env.VITE_BASE_URL || "/";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";
  const now = Date.now();
  const dehydratedRouter = {
    manifest: {
      routes: {
        __root__: { preloads: [`${cleanBase}assets/${entryFile}`] },
        ...(routeFile ? { "/": { preloads: [`${cleanBase}assets/${routeFile}`] } } : {}),
      },
    },
    matches: [
      { i: "__root__\0", u: now, s: "success" },
      { i: "\0\0", u: now, s: "success" },
    ],
    lastMatchId: "\0\0",
  };
  const routerJson = JSON.stringify(dehydratedRouter).replace(/</g, "\\u003c");
  const bootstrapScript = `self.$R=self.$R||{};self.$_TSR={h(){this.hydrated=!0;this.c()},e(){this.streamEnded=!0;this.c()},c(){if(this.hydrated&&this.streamEnded){delete self.$_TSR;if(self.$R)delete self.$R.tsr}},p(e){this.initialized?e():this.buffer.push(e)},buffer:[]};self.$_TSR.router=${routerJson};self.$_TSR.e();`;

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
${styleFile ? `    <link rel="stylesheet" href="${cleanBase}assets/${styleFile}" />\n` : ""}${routeFile ? `    <link rel="modulepreload" href="${cleanBase}assets/${routeFile}" />\n` : ""}    <link rel="icon" href="${cleanBase}favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <script>${bootstrapScript}</script>
    <script type="module" src="${cleanBase}assets/${entryFile}"></script>
  </body>
</html>`;

  const notFoundHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>WebOS</title><script>location.replace(${JSON.stringify(cleanBase)});</script></head><body><a href="${cleanBase}">Open WebOS</a></body></html>`;

  try {
    await fs.copyFile(path.join(__dirname, "../favicon.svg"), path.join(distClientPath, "favicon.svg"));
  } catch {}

  await fs.writeFile(path.join(distClientPath, "index.html"), indexHtml);
  await fs.writeFile(path.join(distClientPath, "404.html"), notFoundHtml);
  // Prevent Jekyll processing on GH Pages
  await fs.writeFile(path.join(distClientPath, ".nojekyll"), "");

  console.log("✅ Generated index.html + 404.html");
  console.log(`   Base URL: ${cleanBase}`);
  console.log(`   CSS:      ${styleFile}`);
  console.log(`   Entry:    ${entryFile}`);
  console.log(`   Route:    ${routeFile}`);
}

generateIndexHtml().catch((err) => {
  console.error("❌ Failed to generate index.html:", err);
  process.exit(1);
});
