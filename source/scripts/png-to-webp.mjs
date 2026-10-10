// Converts the large PNG illustrations the site uses into WebP (transparency kept, at most 1200px) and
// points the code at the WebP copies. The PNG files stay in place, so nothing that still links to them
// breaks.   CHROME_PATH=/path/to/chrome node scripts/png-to-webp.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const MAX = 1200;
const MIN_BYTES = 60 * 1024;
const textFiles = [];
const walk = (dir, skip = []) => fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
  const full = path.join(dir, entry.name);
  if (entry.isDirectory()) { if (!skip.includes(entry.name)) walk(full, skip); return; }
  if (/\.(jsx?|json|html|css)$/.test(entry.name)) textFiles.push(full);
});
walk(path.join(root, "src"));
walk(pub, ["icon-bank", "downloads", "fonts", "assets", "mediapipe"]);

const refs = new Set();
for (const file of textFiles) for (const match of fs.readFileSync(file, "utf8").matchAll(/\/icon-bank\/[^"'`\s)]+\.png/g)) refs.add(match[0]);
const targets = [...refs].filter((src) => fs.existsSync(path.join(pub, src)) && fs.statSync(path.join(pub, src)).size > MIN_BYTES);

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, args: ["--no-sandbox"] });
const page = await browser.newPage();
let before = 0, after = 0;
for (const src of targets) {
  const input = path.join(pub, src);
  const output = input.replace(/\.png$/, ".webp");
  if (!fs.existsSync(output) || fs.statSync(output).mtimeMs < fs.statSync(input).mtimeMs) {
    const dataUrl = await page.evaluate(async (data, max) => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/webp", 0.86);
    }, fs.readFileSync(input).toString("base64"), MAX);
    fs.writeFileSync(output, Buffer.from(dataUrl.split(",")[1], "base64"));
  }
  before += fs.statSync(input).size;
  after += fs.statSync(output).size;
}
await browser.close();

// Point every reference at the WebP copy.
const converted = new Set(targets);
let changedFiles = 0;
for (const file of textFiles) {
  const text = fs.readFileSync(file, "utf8");
  const next = text.replace(/\/icon-bank\/[^"'`\s)]+\.png/g, (src) => (converted.has(src) ? src.replace(/\.png$/, ".webp") : src));
  if (next !== text) { fs.writeFileSync(file, next); changedFiles += 1; }
}
console.log(`${targets.length} PNG files: ${Math.round(before / 1048576)} MB -> ${Math.round(after / 1048576)} MB as WebP; ${changedFiles} files updated`);
