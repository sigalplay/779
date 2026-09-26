// Runs after `vite build`. Saves every public page as ready HTML, so search engines (and people
// on slow phones) get the full page text, its own title, description and address without running
// the app first. Also writes sitemap.xml and 404.html.
//
//   node scripts/prerender.mjs            (CHROME_PATH=... to choose the browser)
//
// Each page is opened in a headless browser on a local copy of dist/, and the rendered content of
// #root is saved together with the page's tags from src/lib/seo.js. When the page loads, the app
// starts as usual and replaces the saved content with the live one.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";
import puppeteer from "puppeteer-core";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const LANGUAGES = ["he", "en"];

// Pages of the app that belong to one person (therapist tools, accounts, links made for a child).
// They get a plain page so their address works directly, but no content and no search listing.
const PRIVATE_ROUTES = [
  "/favorites", "/profile", "/auth", "/admin/cms",
  "/therapist/build", "/therapist/all", "/therapist/recipes", "/therapist/experiments", "/therapist/cipher",
  "/therapist/morning-routine", "/therapist/evening-routine", "/therapist/weekly-board", "/therapist/motor-trail",
  "/therapist/plans", "/therapist/diary", "/therapist/board-games",
  "/therapist/social-stories", "/therapist/hebrew-calendar", "/parent/cipher",
  "/child/morning-routine", "/child/evening-routine", "/shared/weekly-board", "/shared/hebrew-calendar", "/shared/home-practice",
];

// Plain HTML pages in public/ that are indexed as they are (they carry their own tags).
const STANDALONE_PAGES = [
  ["/parent/routine-boards/", "/en/parent/routine-boards/"],
  ["/parent/daily-routine/", "/en/parent/daily-routine/"],
  ["/parent/daily-sequences/", "/en/parent/daily-sequences/"],
  ["/parent/card-games-generator/", null],
  ["/parent/school-holidays/", null],
];

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ].filter(Boolean);
  const found = candidates.find((file) => fs.existsSync(file));
  if (!found) throw new Error("No Chrome found. Set CHROME_PATH to a Chrome or Edge executable.");
  return found;
}

function lastChangeDate() {
  try { return execSync("git log -1 --format=%cs", { cwd: root, stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); }
  catch { return new Date().toISOString().slice(0, 10); }
}

// ---------- site data and page tags (same code the browser uses) ----------
const vite = await createViteServer({ root, server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
const load = (file) => vite.ssrLoadModule(file);
const seoLib = await load("/src/lib/seo.js");
const content = {
  ...(await (async () => {
    const [{ SEED_ACTIVITIES }, { activityHero }, { activityEnglishContent }, { activityTitle }] = await Promise.all([
      load("/src/lib/activities-data.js"), load("/src/lib/activity-icons.jsx"), load("/src/lib/activity-content-en.js"), load("/src/lib/content-translations.js"),
    ]);
    return { activities: SEED_ACTIVITIES, activityHero, activityEnglish: activityEnglishContent, activityTitle };
  })()),
  boardGames: (await load("/src/lib/board-games-data.js")).BOARD_GAMES,
  boardGamesEnglish: (await load("/src/lib/board-games-en.js")).BOARD_GAMES_EN,
  recipes: (await load("/src/pages/TherapistRecipes.jsx")).RECIPES,
  recipesEnglish: (await load("/src/lib/recipe-content-en.js")).RECIPE_EN,
  experiments: (await load("/src/pages/TherapistExperiments.jsx")).EXPERIMENTS,
  experimentHero: (await load("/src/pages/TherapistExperiments.jsx")).experimentHero,
  experimentsEnglish: (await load("/src/lib/experiment-content-en.js")).EXPERIMENT_EN,
};
await vite.close();

const pagePaths = [
  ...seoLib.PUBLIC_PAGES,
  ...content.activities.map((item) => `/activity/${item.id}`),
  ...content.boardGames.map((item) => `/board-game/${item.id}`),
  ...content.recipes.map((item) => `/parent/recipes/${item.id}`),
  ...content.experiments.map((item) => `/parent/experiments/${item.id}`),
];
const pages = pagePaths.flatMap((pagePath) => LANGUAGES.map((language) => {
  const seo = seoLib.resolveSeo(pagePath, language, content);
  if (!seo) throw new Error(`No page data for ${pagePath}`);
  return { pagePath, language, address: seo.url.replace(seoLib.SITE_URL, ""), seo };
}));

// ---------- HTML template ----------
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
if (!/<!-- seo:start[\s\S]*?<!-- seo:end -->/.test(template)) throw new Error("dist/index.html has no seo:start/seo:end block");

function renderHtml({ seo, rootHtml = "" }) {
  const dir = seo.language === "en" ? "ltr" : "rtl";
  return template
    .replace(/<html lang="[^"]*" dir="[^"]*">/, `<html lang="${seo.language}" dir="${dir}">`)
    .replace(/<!-- seo:start[\s\S]*?<!-- seo:end -->/, seoLib.headTags(seo).join("\n    "))
    .replace('<div id="root"></div>', `<div id="root">${rootHtml}</div>`);
}

function writePage(address, html) {
  const file = address === "/" ? path.join(dist, "index.html") : path.join(dist, ...address.split("/").filter(Boolean), "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
}

// ---------- a local server over dist/ that answers every app address with the template ----------
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".ico": "image/x-icon", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf", ".pdf": "application/pdf", ".wasm": "application/wasm", ".tflite": "application/octet-stream", ".binarypb": "application/octet-stream", ".xml": "application/xml", ".txt": "text/plain" };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = path.join(dist, url);
  if (file.startsWith(dist) && fs.existsSync(file) && fs.statSync(file).isFile() && !file.endsWith(".html")) {
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
    return;
  }
  res.writeHead(200, { "Content-Type": TYPES[".html"] });
  res.end(template);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

// ---------- render ----------
const BLOCKED = /cloudflareinsights\.com|googletagmanager\.com|google-analytics\.com|api\.qrserver\.com/;
// Pages render four at a time; without these flags Chrome slows the ones in the background and
// their animations never finish.
const browser = await puppeteer.launch({
  executablePath: findChrome(),
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"],
});
const failures = [];
const warnings = [];

async function renderPage(page) {
  const tab = await browser.newPage();
  await tab.setViewport({ width: 1280, height: 900 });
  // The app skips its entrance animations when this is set (src/main.jsx), so nothing is saved half-faded.
  await tab.evaluateOnNewDocument(() => { window.__PRERENDER__ = true; });
  await tab.setRequestInterception(true);
  // No visits in the site statistics from the build, and no external calls that are not needed.
  tab.on("request", (request) => (BLOCKED.test(request.url()) ? request.abort() : request.continue()));
  try {
    await tab.goto(`${origin}${page.address}`, { waitUntil: "networkidle0", timeout: 45000 });
    await tab.waitForFunction(() => document.querySelector("#root main") && !document.body.innerText.includes("טוענת…"), { timeout: 20000 });
    const result = await tab.evaluate(() => {
      document.querySelectorAll(".analytics-consent, [data-prerender-skip]").forEach((node) => node.remove());
      // Entrance animations start from transparent and slightly moved. A tab in the background may not
      // have drawn their last frame yet, so the saved copy gets their end state: visible, in place.
      document.querySelectorAll("#root [style*='opacity']").forEach((node) => {
        if (Number(node.style.opacity) < 1 && node.style.transform) {
          node.style.opacity = "";
          node.style.transform = "";
        }
      });
      const hidden = [...document.querySelectorAll("#root main [style*='opacity']")].filter((node) => Number(node.style.opacity) < 1).length;
      return { html: document.getElementById("root").innerHTML, title: document.title, h1: document.querySelector("h1")?.textContent?.trim() || "", hidden };
    });
    if (result.hidden) throw new Error(`${result.hidden} parts of the page were saved while still transparent`);
    if (result.title !== page.seo.title) throw new Error(`title in the app "${result.title}" differs from "${page.seo.title}"`);
    if (!result.h1) warnings.push(`${page.address}: no <h1> heading`);
    writePage(page.address, renderHtml({ seo: page.seo, rootHtml: result.html }));
    page.h1 = result.h1;
  } catch (error) {
    failures.push(`${page.address}: ${error.message}`);
  } finally {
    await tab.close();
  }
}

const queue = [...pages];
const started = Date.now();
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) await renderPage(queue.shift());
}));
await browser.close();
server.close();

// ---------- personal pages and 404 ----------
const privateSeo = (language) => seoLib.resolveSeo("/not-found", language, null);
let privateCount = 0;
for (const route of PRIVATE_ROUTES) {
  for (const language of LANGUAGES) {
    const address = `${language === "en" ? "/en" : ""}${route}/`;
    if (fs.existsSync(path.join(dist, ...address.split("/").filter(Boolean), "index.html"))) continue;
    writePage(address, renderHtml({ seo: privateSeo(language) }));
    privateCount++;
  }
}
// GitHub Pages answers unknown addresses with 404.html; the app then shows the right screen.
fs.writeFileSync(path.join(dist, "404.html"), renderHtml({ seo: privateSeo("he") }));

// ---------- sitemap ----------
const lastmod = lastChangeDate();
const xml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const entries = [];
for (const page of pages.filter((item) => item.seo.robots.startsWith("index"))) {
  entries.push({ loc: page.seo.url, alternates: seoLib.alternates(page.seo), image: page.seo.heroImage ? { loc: seoLib.absoluteUrl(page.seo.heroImage), title: page.seo.imageAlt } : null });
}
for (const [he, en] of STANDALONE_PAGES) {
  const pair = [["he", seoLib.absoluteUrl(he)], ...(en ? [["en", seoLib.absoluteUrl(en)]] : []), ["x-default", seoLib.absoluteUrl(he)]];
  entries.push({ loc: seoLib.absoluteUrl(he), alternates: en ? pair : [] });
  if (en) entries.push({ loc: seoLib.absoluteUrl(en), alternates: pair });
}
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...entries.map((entry) => [
    "  <url>",
    `    <loc>${xml(entry.loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    ...entry.alternates.map(([lang, href]) => `    <xhtml:link rel="alternate" hreflang="${lang}" href="${xml(href)}"/>`),
    ...(entry.image ? [`    <image:image><image:loc>${xml(entry.image.loc)}</image:loc></image:image>`] : []),
    "  </url>",
  ].join("\n")),
  "</urlset>",
  "",
].join("\n");
fs.writeFileSync(path.join(dist, "sitemap.xml"), sitemap);

// ---------- every link and picture in the saved pages must exist ----------
const existsInDist = (url) => {
  const clean = decodeURIComponent(url.split("#")[0].split("?")[0]);
  const file = path.join(dist, clean);
  return clean === "/" || (fs.existsSync(file) && fs.statSync(file).isFile()) || fs.existsSync(path.join(file, "index.html"));
};
const broken = new Map();
for (const page of pages) {
  const file = page.address === "/" ? path.join(dist, "index.html") : path.join(dist, ...page.address.split("/").filter(Boolean), "index.html");
  if (!fs.existsSync(file)) continue;
  for (const [, url] of fs.readFileSync(file, "utf8").matchAll(/\b(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    if (!existsInDist(url)) broken.set(url, page.address);
  }
}
for (const [url, from] of broken) failures.push(`${from}: link to a missing file ${url}`);

console.log(`Saved ${pages.length - failures.length}/${pages.length} pages in ${Math.round((Date.now() - started) / 1000)}s, ${privateCount} personal pages, sitemap with ${entries.length} addresses.`);
if (warnings.length) console.warn(`\n${warnings.length} warnings:\n${warnings.join("\n")}`);
if (failures.length) {
  console.error(`\n${failures.length} pages failed:\n${failures.join("\n")}`);
  process.exit(1);
}
