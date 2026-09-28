// Supabase Edge Function: the activity generator on /therapist/activity-generator.
//
// A signed-in therapist describes the activity she needs; Claude writes it in the site's activity
// format and picks illustrations only from the site's own catalog (public/ai/illustration-catalog.json,
// written by scripts/build-ai-catalog.mjs). Each therapist has a daily limit (table ai_activity_requests).
//
// Deploy:   supabase functions deploy generate-activity
// Secrets:  supabase secrets set ANTHROPIC_API_KEY=...
//           optional: AI_DAILY_LIMIT (default 10), AI_CATALOG_URL (default: the live site's catalog)
import Anthropic from "npm:@anthropic-ai/sdk";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const DAILY_LIMIT = Number(Deno.env.get("AI_DAILY_LIMIT") ?? 10);
const CATALOG_URL = Deno.env.get("AI_CATALOG_URL") ?? "https://letsplayot.com/ai/illustration-catalog.json";

const client = new Anthropic(); // reads the ANTHROPIC_API_KEY secret

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const GOALS = [
  "התנסות במאכלים", "מוטוריקה עדינה", "גראפו מוטורי", "גזירה", "הכנה לכיתה א'", "מוטוריקה גסה", "ויסות כוח",
  "תיאום בי לטרלי", "ויסות חושי", "משחק חברתי", "עכבה", "בקרה", "תכנון", "זיכרון עבודה", "גמישות מחשבתית", "אורל מוטור",
];

type CatalogItem = { id: string; name?: string; text?: string; image: string };
type Catalog = { materials: CatalogItem[]; steps: CatalogItem[] };
let catalogCache: { catalog: Catalog; system: string } | null = null;

// The catalog and the system prompt built from it stay the same between requests, so the prompt
// is cached by the API and only the first request after a deploy pays for it in full.
async function loadCatalog() {
  if (catalogCache) return catalogCache;
  const response = await fetch(CATALOG_URL);
  if (!response.ok) throw new Error("catalog-unavailable");
  const catalog = (await response.json()) as Catalog;
  const materials = catalog.materials.map((item) => `${item.id} | ${item.name}`).join("\n");
  const steps = catalog.steps.map((item) => `${item.id} | ${item.text}`).join("\n");
  catalogCache = { catalog, system: systemPrompt(materials, steps) };
  return catalogCache;
}

function systemPrompt(materials: string, steps: string) {
  return `You write therapy activities for "בואו נשחק" (letsplayot.com), a site for pediatric occupational therapists in Israel. A therapist describes what she needs, and you write one activity she can use in a session tomorrow.

What makes a good activity here:
- Practical and safe for the stated age, with materials that are easy to get (at home or in a typical clinic, as the therapist chose). Think about safety like an experienced OT: small parts for young children, anything hot or sharp only with an adult. If there is something to watch for, say it in "safety"; otherwise leave it empty.
- Playful: a short, inviting title (2-4 words) and, when it fits, a small story or game frame that makes a child want to join.
- Clear for a busy therapist: 3-6 steps, each one action in one short sentence (up to about 20 words); materials as short nouns (2-7 items); preparation, adaptations (how to make it easier) and extensions (how to make it harder) in one or two sentences each.
- "goals": 1-3 items, chosen only from this list: ${GOALS.join(", ")}.
- "emoji": one emoji that fits the activity.

Language: write in Hebrew, in the site's style - plural present tense ("מניחים", "מעבירים", "בונים"), warm and simple, no niqqud. If the request says language "en", write in English instead.

Privacy: therapists are asked not to include identifying details. If the request contains a child's name or other identifying details anyway, do not repeat them anywhere in the activity.

If the request is not a request for a children's activity (or cannot be done safely), return an empty "title", put a one-sentence explanation in "description", and leave the lists empty.

Illustrations. The site has its own illustrations, listed below as "id | what it shows". Only these can be used.
- For each material, set "illustration" to the id of a material picture that shows the same object (the same thing, or an obvious equivalent such as "קערה" for "קערה קטנה"). Otherwise null.
- For each step, set "illustration" to the id of a step picture that shows the same action with the same kind of materials, so a child looking at it would understand the step. A loosely related picture is worse than none - use null.
- Never invent ids.

Material pictures:
${materials}

Step pictures:
${steps}`;
}

const nullableId = { anyOf: [{ type: "string" }, { type: "null" }] };
const ACTIVITY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["title", "description", "emoji", "age_min", "age_max", "duration_min", "difficulty", "goals", "materials", "preparation", "steps", "adaptations", "extensions", "safety"],
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    emoji: { type: "string" },
    age_min: { type: "integer" },
    age_max: { type: "integer" },
    duration_min: { type: "integer" },
    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
    goals: { type: "array", items: { type: "string" } },
    materials: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["name", "illustration"], properties: { name: { type: "string" }, illustration: nullableId } },
    },
    preparation: { type: "string" },
    steps: {
      type: "array",
      items: { type: "object", additionalProperties: false, required: ["text", "illustration"], properties: { text: { type: "string" }, illustration: nullableId } },
    },
    adaptations: { type: "string" },
    extensions: { type: "string" },
    safety: { type: "string" },
  },
};

async function currentUser(authorization: string) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON_KEY, Authorization: authorization } });
  if (!response.ok) return null;
  const user = await response.json();
  return user?.id ? (user as { id: string }) : null;
}

const serviceHeaders = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" };

async function requestsToday(userId: string) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/ai_activity_requests?select=id&user_id=eq.${encodeURIComponent(userId)}&created_at=gte.${encodeURIComponent(since)}`,
    { headers: { ...serviceHeaders, Prefer: "count=exact", Range: "0-0" } },
  );
  if (!response.ok) throw new Error("limit-check-failed");
  return Number(response.headers.get("content-range")?.split("/")[1] ?? 0);
}

async function recordRequest(userId: string, usage: unknown) {
  await fetch(`${SUPABASE_URL}/rest/v1/ai_activity_requests`, {
    method: "POST",
    headers: { ...serviceHeaders, Prefer: "return=minimal" },
    body: JSON.stringify({ user_id: userId, usage }),
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (request.method !== "POST") return reply(405, { error: "method" });

  const authorization = request.headers.get("Authorization") ?? "";
  const user = authorization ? await currentUser(authorization) : null;
  if (!user) return reply(401, { error: "sign-in" });

  let input: { request?: string; age?: string; equipment?: string; duration?: number; language?: string };
  try { input = await request.json(); } catch { return reply(400, { error: "bad-request" }); }
  const wish = String(input.request ?? "").trim().slice(0, 800);
  if (wish.length < 5) return reply(400, { error: "empty" });

  try {
    const used = await requestsToday(user.id);
    if (used >= DAILY_LIMIT) return reply(429, { error: "daily-limit", limit: DAILY_LIMIT });

    const { catalog, system } = await loadCatalog();
    const details = [
      `Request: ${wish}`,
      input.age ? `Age: ${input.age}` : "",
      input.equipment ? `Equipment: ${input.equipment === "clinic" ? "a typical OT clinic" : "things found at home"}` : "",
      input.duration ? `Duration: about ${Number(input.duration)} minutes` : "",
      `Language: ${input.language === "en" ? "en" : "he"}`,
    ].filter(Boolean).join("\n");

    // "default" fallbacks re-run a declined request on Anthropic's recommended fallback model.
    const params = {
      model: "claude-opus-5",
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      thinking: { type: "adaptive" },
      output_config: { effort: "medium", format: { type: "json_schema", schema: ACTIVITY_SCHEMA } },
      system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: details }],
    };
    const response = await client.beta.messages.create(params as never);

    if (response.stop_reason === "refusal") return reply(422, { error: "refused" });
    if (response.stop_reason === "max_tokens") return reply(502, { error: "too-long" });
    const text = response.content.find((block) => block.type === "text");
    if (!text || text.type !== "text") return reply(502, { error: "no-answer" });
    const activity = JSON.parse(text.text);

    // Ids become picture addresses; anything not in the catalog is dropped.
    const materialImage = new Map(catalog.materials.map((item) => [item.id, item.image]));
    const stepImage = new Map(catalog.steps.map((item) => [item.id, item.image]));
    activity.materials = (activity.materials ?? []).map((item: { name: string; illustration: string | null }) => ({
      name: item.name,
      image: (item.illustration && materialImage.get(item.illustration)) || null,
    }));
    activity.steps = (activity.steps ?? []).map((item: { text: string; illustration: string | null }) => ({
      text: item.text,
      image: (item.illustration && stepImage.get(item.illustration)) || null,
    }));

    await recordRequest(user.id, response.usage);
    return reply(200, { activity, remaining: Math.max(0, DAILY_LIMIT - used - 1) });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return reply(503, { error: "busy" });
    if (error instanceof Anthropic.AuthenticationError) return reply(500, { error: "not-configured" });
    if (error instanceof Anthropic.APIError) return reply(502, { error: "ai-error" });
    console.error(error);
    return reply(500, { error: "server" });
  }
});
