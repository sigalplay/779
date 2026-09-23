import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const site = "https://www.letsplayot.com";
const today = new Date().toISOString().slice(0, 10);
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const publicPages = [
  "/",
  "/parent/play",
  "/parent/recipes",
  "/parent/experiments",
  "/parent/board-games",
  "/parent/morning-routine",
  "/parent/evening-routine",
  "/parent/weekly-board",
  "/parent/hebrew-calendar",
  "/parent/daily-sequences",
  "/parent/social-stories",
  "/parent/all",
  "/about",
];

const activitySources = [read("src/lib/activities-data.js"), read("src/lib/pinterest-activities.js")].join("\n");
const activityIds = [...activitySources.matchAll(/^\s{4}["']?id["']?:\s*["']([^"']+)["']/gm)].map((match) => match[1]);
const recipeIds = [...read("src/pages/TherapistRecipes.jsx").matchAll(/^\s{4}id:\s*"([^"]+)"/gm)].map((match) => match[1]);
const experimentIds = [...read("src/pages/TherapistExperiments.jsx").matchAll(/^\s*\["([^"]+)","/gm)].map((match) => match[1]);
const gameIds = [...read("src/lib/board-games-data.js").matchAll(/^\s{4}id:\s*"([^"]+)"/gm)].map((match) => match[1]);

const urls = new Set(publicPages);
activityIds.forEach((id) => urls.add(`/activity/${encodeURIComponent(id)}`));
recipeIds.forEach((id) => urls.add(`/parent/recipes?r=${encodeURIComponent(id)}`));
experimentIds.forEach((id) => urls.add(`/parent/experiments?e=${encodeURIComponent(id)}`));
gameIds.forEach((id) => urls.add(`/board-game/${encodeURIComponent(id)}`));

const escapeXml = (value) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const body = [...urls].map((url) => [
  "  <url>",
  `    <loc>${escapeXml(site + url)}</loc>`,
  `    <lastmod>${today}</lastmod>`,
  "    <changefreq>weekly</changefreq>",
  `    <priority>${url === "/" ? "1.0" : url.startsWith("/activity/") ? "0.8" : "0.7"}</priority>`,
  "  </url>",
].join("\n")).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
fs.writeFileSync(path.join(root, "public/sitemap.xml"), xml);
console.log(`Generated sitemap.xml with ${urls.size} public URLs`);
