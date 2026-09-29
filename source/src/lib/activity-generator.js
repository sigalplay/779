import { SUPABASE_ANON_KEY, SUPABASE_URL, freshCloudSession, isCloudAuthConfigured } from "@/lib/cloud-auth";

// The activity generator: the request goes to the generate-activity Edge Function (Supabase), which
// asks Claude for an activity drawn only with the site's own illustrations.
export async function generateActivity({ kind, request, age, equipment, duration, without, oven, language }) {
  const session = await freshCloudSession();
  if (!isCloudAuthConfigured() || !session?.access_token) throw Object.assign(new Error("sign-in"), { code: "sign-in" });
  const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-activity`, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ kind, request, age, equipment, duration, without, oven, language }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error || "server"), { code: body.error || (response.status === 404 ? "not-deployed" : "server"), limit: body.limit });
  return body;
}

// The same catalog the function uses (public/ai/illustration-catalog.json), for choosing another picture.
let catalogPromise = null;
export function loadIllustrationCatalog() {
  catalogPromise ||= fetch("/ai/illustration-catalog.json").then((response) => response.json()).catch(() => ({ materials: [], steps: [] }));
  return catalogPromise;
}

// Hebrew words without the one-letter prefixes (ה, ו, ב, ל, מ, ש, כ), so "הכדור" finds "כדור".
function words(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 1)
    .map((word) => (word.length > 3 && /^[הובלמשכ]/.test(word) ? word.slice(1) : word));
}

// Pictures from the catalog that share the most words with the text: materials first for a
// material, steps first for a step.
export function suggestIllustrations(catalog, text, kind, count = 9) {
  const wanted = new Set(words(text));
  if (!wanted.size) return [];
  const pool = kind === "material"
    ? [...catalog.materials.map((item) => ({ ...item, label: item.name })), ...catalog.steps.map((item) => ({ ...item, label: item.text }))]
    : [...catalog.steps.map((item) => ({ ...item, label: item.text })), ...catalog.materials.map((item) => ({ ...item, label: item.name }))];
  const seen = new Set();
  return pool
    .map((item, order) => ({ item, order, score: words(item.label).filter((word) => wanted.has(word)).length }))
    .filter(({ score, item }) => score > 0 && !seen.has(item.image) && seen.add(item.image))
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .slice(0, count)
    .map(({ item }) => item);
}

// A generated activity in the shape of the site's own activities, for "My activities".
// A generated recipe in the format of the site's recipes (pages/TherapistRecipes.jsx), so it opens in
// the same recipe page: pictures, niqqud, handwriting, printing and batch sizes.
export function toSiteRecipe(recipe, language) {
  const en = language === "en";
  const item = (fallback) => (x) => ({ text: x.text, ...(en ? {} : { textN: x.textN || x.text }), ...(x.image ? { img: x.image } : { emoji: fallback }) });
  return {
    title: recipe.title,
    ...(en ? {} : { titleN: recipe.titleN || recipe.title }),
    description: recipe.description,
    coverEmoji: recipe.emoji || "🍪",
    duration: en ? `About ${recipe.duration_min} minutes` : `כ־${recipe.duration_min} דקות`,
    ingredients: (recipe.ingredients || []).map(item("🛒")),
    tools: (recipe.tools || []).map(item("🍴")),
    steps: (recipe.steps || []).map((step, index) => ({ n: index + 1, ...item(recipe.emoji || "🍪")(step) })),
    safety: recipe.safety || "",
    age_min: recipe.age_min,
    age_max: recipe.age_max,
    language: en ? "en" : "he",
    ai_generated: true,
  };
}

export function toSiteActivity(activity, { equipment, language }) {
  const materials = activity.materials.map((item) => item.name);
  return {
    title: activity.title,
    short_description: activity.description,
    description: activity.description,
    age_min: activity.age_min,
    age_max: activity.age_max,
    duration_min: activity.duration_min,
    difficulty: activity.difficulty,
    equipment: equipment === "clinic" ? "clinic" : "home",
    categories: activity.goals,
    goals: activity.goals,
    emoji: activity.emoji || "✨",
    materials,
    material_images: Object.fromEntries(activity.materials.filter((item) => item.image).map((item) => [item.name, item.image])),
    preparation: activity.preparation,
    steps: activity.steps.map((step, index) => ({ n: index + 1, text: step.text, ...(step.image ? { image: step.image } : {}) })),
    adaptations: activity.adaptations,
    extensions: activity.extensions,
    tips: activity.safety ? [activity.safety] : [],
    audience: "therapist",
    language: language === "en" ? "en" : "he",
    ai_generated: true,
    searchStatus: "active",
  };
}
