import fs from "node:fs";
import path from "node:path";

const distDirectory = path.join(process.cwd(), "dist");
const indexFile = path.join(distDirectory, "index.html");
const fallbackFile = path.join(distDirectory, "404.html");

if (!fs.existsSync(indexFile)) {
  throw new Error("Cannot create the SPA fallback because dist/index.html is missing.");
}

// GitHub Pages does not rewrite nested URLs to index.html. Serving the built
// app as 404.html lets React Router handle direct visits and page refreshes.
fs.copyFileSync(indexFile, fallbackFile);
console.log("Generated dist/404.html for GitHub Pages routes");
