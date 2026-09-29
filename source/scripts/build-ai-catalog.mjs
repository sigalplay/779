// Writes public/ai/illustration-catalog.json: the site's own illustrations with the Hebrew words
// they show, for the activity generator. The generator offers Claude only these illustrations, so
// a generated activity is drawn with pictures the site already has.
//
//   node scripts/build-ai-catalog.mjs      (runs as part of `npm run build`)
//
// Materials: every named material picture of the activities, plus the board's toys, motor
// equipment and fine-motor items, the food bank and the recipes' ingredients and tools.
// Steps: every step picture of the activities, with that step's text, and the action illustrations.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer as createViteServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vite = await createViteServer({ root, server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
try {
  const { ACTIVITY_ICON_SETS } = await vite.ssrLoadModule("/src/lib/activity-icons.jsx");
  const { SEED_ACTIVITIES } = await vite.ssrLoadModule("/src/lib/activities-data.js");
  const { BOARD_GAMES } = await vite.ssrLoadModule("/src/lib/session-board-tools.js");
  const { MOTOR_TRAIL_ITEMS, CREATIVE_ACCESSORIES, HOME_ITEMS } = await vite.ssrLoadModule("/src/lib/motor-trail-items.js");
  const { RECIPES } = await vite.ssrLoadModule("/src/pages/TherapistRecipes.jsx");
  const { FOOD_ITEMS, EQUIPMENT_ITEMS } = await vite.ssrLoadModule("/src/lib/icon-bank.js");
  const { ACTION_ILLUSTRATIONS } = await vite.ssrLoadModule("/src/lib/action-illustrations.js");

  const exists = (image) => typeof image === "string" && image.startsWith("/") && fs.existsSync(path.join(root, "public", decodeURI(image)));
  const clean = (text) => String(text || "").replace(/\s+/g, " ").trim();

  const materials = new Map(); // name -> image (first picture wins)
  const addMaterial = (name, image) => {
    const key = clean(name);
    if (key && exists(image) && !materials.has(key)) materials.set(key, image);
  };
  const steps = new Map(); // image -> text
  // A step's text alone often leaves out what the picture shows ("takes one pom-pom and moves it"
  // is drawn with tweezers), so the activity's name goes with it.
  const addStep = (text, image, from = "") => {
    let words = clean(text);
    if (words.length > 120) words = `${words.slice(0, 117)}…`;
    if (words && from) words = `${words} (מתוך: ${clean(from)})`;
    if (words && exists(image) && !steps.has(image)) steps.set(image, words);
  };

  for (const activity of SEED_ACTIVITIES) {
    const icons = ACTIVITY_ICON_SETS[activity.id] || {};
    for (const [name, image] of Object.entries(icons.materials || {})) addMaterial(name, image);
    for (const [name, image] of Object.entries(activity.material_images || {})) addMaterial(name, image);
    for (const step of activity.steps || []) {
      const text = typeof step === "string" ? step : step.text;
      const image = (typeof step === "object" && (step.image || step.images?.[0])) || icons.steps?.[step.n];
      addStep(text, image, activity.title);
    }
  }
  for (const item of [...BOARD_GAMES]) addMaterial(item.label, item.asset);
  for (const item of [...MOTOR_TRAIL_ITEMS, ...CREATIVE_ACCESSORIES, ...HOME_ITEMS]) addMaterial(item.label, item.image);
  for (const item of [...FOOD_ITEMS, ...EQUIPMENT_ITEMS]) addMaterial(item.label, item.image);
  // Recipe ingredients and tools, without the amounts ("200 גרם שוקולד" -> "שוקולד").
  const bare = (text) => clean(text).replace(/^[\d½¼¾.,/–-]+\s*/, "").replace(/^(גרם|כוס(ות)?|כפ(ות|ית|יות)?|מ"ל|ליטר|יחידות|חבילת|קופסת)\s+/, "");
  for (const recipe of RECIPES) {
    for (const item of [...(recipe.ingredients || []), ...(recipe.tools || [])]) {
      if (typeof item.img === "string") addMaterial(bare(item.text), item.img);
    }
    for (const step of recipe.steps || []) if (typeof step.img === "string") addStep(step.text, step.img, recipe.title);
  }

  // Single actions (pour, throw, sort...) fit steps of any activity.
  for (const action of ACTION_ILLUSTRATIONS) addStep(action.he, action.image);

  const catalog = {
    materials: [...materials].map(([name, image], index) => ({ id: `m${index + 1}`, name, image })),
    steps: [...steps].map(([image, text], index) => ({ id: `s${index + 1}`, text, image })),
  };
  fs.mkdirSync(path.join(root, "public/ai"), { recursive: true });
  fs.writeFileSync(path.join(root, "public/ai/illustration-catalog.json"), `${JSON.stringify(catalog)}\n`);
  console.log(`illustration catalog: ${catalog.materials.length} materials, ${catalog.steps.length} steps`);
} finally {
  await vite.close();
}
