#!/usr/bin/env node

/**
 * Post-build script to generate index.html from TanStack Start output
 * This creates a static HTML file for GitHub Pages by rendering the app server-side
 * then extracting the shell as a static template.
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distClientPath = path.join(__dirname, "../dist/client");
const distServerPath = path.join(__dirname, "../dist/server");

async function generateIndexHtml() {
  try {
    // Read the client index.es file to get the app setup
    const indexEsPath = path.join(distClientPath, "assets");
    const files = await fs.readdir(indexEsPath);
    
    // Find the main index file
    const styleFile = files.find((f) => f.startsWith("styles") && f.endsWith(".css"));
    const indexFiles = files.filter((f) => f.startsWith("index") && f.endsWith(".js"));
    
    // Get base URL from environment or default
    const baseUrl = process.env.VITE_BASE_URL || "/";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl : baseUrl + "/";

    // Generate index.html with proper asset references
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
    ${styleFile ? `    <link rel="stylesheet" href="${cleanBase}assets/${styleFile}" />` : ""}
    <link rel="icon" href="${cleanBase}favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <div id="root"></div>
    ${indexFiles.map((f) => `    <script type="module" src="${cleanBase}assets/${f}"><\/script>`).join("\n")}
  </body>
</html>`;

    // Copy favicon into the client output, if one exists.
    try {
      await fs.copyFile(path.join(__dirname, "../favicon.svg"), path.join(distClientPath, "favicon.svg"));
      console.log("✅ Copied favicon.svg to dist/client");
    } catch (error) {
      // If icon is missing, continue anyway.
      console.warn("⚠️ favicon.svg not found, skipping favicon copy.");
    }

    // Write the index.html file
    await fs.writeFile(path.join(distClientPath, "index.html"), indexHtml);
    console.log("✅ Generated index.html for GitHub Pages");
    console.log(`   Base URL: ${cleanBase}`);
    console.log(`   CSS: ${styleFile}`);
    console.log(`   Scripts: ${indexFiles.length} files`);
  } catch (error) {
    console.error("❌ Failed to generate index.html:", error);
    process.exit(1);
  }
}

generateIndexHtml();
