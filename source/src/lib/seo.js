// What search engines see for every page: title, description, the one address of the page,
// its other-language version and structured data. Used in the browser (SeoManager) and at build
// time (scripts/prerender.mjs), so the saved HTML and the live page always agree.
import { activityContext, IMAGE_CONTEXT } from "@/lib/image-seo";

export const SITE_URL = "https://letsplayot.com";
export const SITE_NAME = { he: "בואו נשחק", en: "Let's Play" };
export const SHARE_IMAGE = { url: "/share-preview.png", width: 1200, height: 630 };

const INDEX = "index, follow, max-image-preview:large";
const NOINDEX = "noindex, nofollow";

// Titles and descriptions of the fixed pages, as written for the live site.
const PAGE_META = {
  "/": [["בואו נשחק – פעילויות וכלים לילדים", "שפע רעיונות במקום אחד – לגן, לבית ולקליניקה. לוח התארגנות לילדים, סיפורים חברתיים, פעילויות, ניסויים ומתכונים המותאמים ומובנים להורים ולמטפלים."], ["Let's Play — Practical Play Ideas for Children", "Play ideas, visual tools, easy recipes, experiments, and child-friendly activities for parents and therapists."]],
  "/parent/play": [["רעיונות למשחק עם ילדים – בואו נשחק", "רעיונות משחק פשוטים לבית, עם חומרים שיש לכם כבר בבית."], ["Find an Activity for Your Child — Let's Play", "Choose an age, an area to strengthen, and the time available to find a suitable play idea."]],
  "/parent/all": [["כל הפעילויות לילדים – בואו נשחק", "מאגר מלא של פעילויות, משחקים ורעיונות להעסקת ילדים בבית, לפי גיל ותחום התפתחות."], ["Children's Activity Library — Let's Play", "Browse creative, movement, sensory, learning, and food exploration activities for children."]],
  "/parent/recipes": [["מתכונים לילדים – מתכונים קלים ומאוירים | בואו נשחק", "מתכונים לילדים ומתכונים קלים לילדים, עם איורים, מרכיבים ושלבים ברורים. בחרו מתכון המתאים לגיל הילד ולהכנה משותפת בבית."], ["Easy Recipes for Kids — Illustrated Step-by-Step Recipes | Let's Play", "Easy recipes for kids with illustrated ingredients and clear step-by-step directions. Simple recipes children can follow at home with adult supervision."]],
  "/parent/experiments": [["ניסויים לילדים בבית – ניסויים פשוטים ומאוירים | בואו נשחק", "מגוון ניסויים פשוטים לילדים עם איורים, רשימת חומרים ושלבי הכנה ברורים. בחרו ניסוי המתאים לגיל, לזמן ולחומרים שיש בבית."], ["Simple Experiments for Children — Let's Play", "Illustrated home experiments using simple materials and clear steps."]],
  "/parent/board-games": [["משחקי קופסה מומלצים לילדים – בואו נשחק", "משחקי קופסה מומלצים לילדים עם הסבר מה כל משחק מפתח ואיך להתאים אותו."], ["Board Games for Children — Let's Play", "Board game ideas and practical ways to adapt play for children."]],
  "/parent/morning-routine": [["לוח התארגנות בוקר לילדים – בנייה והדפסה | בואו נשחק", "הכינו לוח התארגנות בוקר לילדים עם תמונות: בחרו דמות ופעולות, סדרו את שלבי הבוקר והדפיסו לוח המותאם לשגרה שלכם."], ["Morning Routine Board for Children — Let's Play", "Create a personalised visual morning routine board for your child."]],
  "/parent/evening-routine": [["לוח התארגנות ערב לילדים – שגרת ערב ושינה | בואו נשחק", "הכינו לוח התארגנות ערב לילדים עם תמונות: בחרו וסדרו פעולות כמו ארוחת ערב, מקלחת, פיג׳מה, צחצוח שיניים והכנה לשינה."], ["Evening Routine Board for Children — Let's Play", "Create a personalised visual evening routine board for your child."]],
  "/parent/weekly-board": [["לוח שבועי לילדים – מערכת שבועית חזותית | בואו נשחק", "הכינו לוח שבועי לילדים והציגו בתמונות חוגים, טיפולים, מסגרות ואירועים. צרו מערכת שבועית חזותית המותאמת למשפחה שלכם."], ["Weekly Visual Planner for Children — Let's Play", "Create a clear weekly planner using child-friendly illustrations."]],
  "/parent/hebrew-calendar": [["לוח שנה עברי לילדים – בואו נשחק", "לוח שנה עברי אינטראקטיבי לילדים עם חגים, עונות וימי השבוע."], ["Printable Family Calendar — Let's Play", "Create and print a family calendar with personal events and a family photo."]],
  "/parent/social-stories": [["סיפורים חברתיים לילדים – בואו נשחק", "סיפורים חברתיים להכנה למצבים יומיומיים: גן, רופא, פרידה, אורחים ועוד."], ["Social Stories for Children — Let's Play", "Illustrated social stories that help children understand routines and everyday situations."]],
  "/about": [["אודות – בואו נשחק", "הכירו את בואו נשחק: פעילויות מעשיות, משחקים וכלים ויזואליים לילדים, להורים ולמטפלים."], ["About Let's Play", "Learn about Let's Play, a collection of practical activities and visual tools for children, parents, and therapists."]],
  "/privacy": [["מדיניות פרטיות – בואו נשחק", "כיצד בואו נשחק אוספת, שומרת ומגנה על המידע שלכם."], ["Privacy Policy — Let's Play", "How Let's Play collects, uses, and protects information."]],
  "/terms": [["תנאי שימוש – בואו נשחק", "תנאי השימוש באתר בואו נשחק עבור הורים, מטפלים ומשתמשים נוספים."], ["Terms of Use — Let's Play", "Terms for parents, therapists, and other users of the Let's Play website."]],
  "/cookies": [["מדיניות עוגיות – בואו נשחק", "כיצד אנחנו משתמשים בעוגיות באתר בואו נשחק ואיך אפשר לנהל את ההעדפות."], ["Cookie Policy — Let's Play", "Information about cookies, local storage, and analytics on Let's Play."]],
};

// Personal areas (therapist tools, accounts, links made for one child) stay out of search results.
const PRIVATE_PREFIXES = ["/therapist", "/profile", "/auth", "/favorites", "/child", "/shared", "/admin"];

export const PUBLIC_PAGES = Object.keys(PAGE_META);

export function isPrivatePath(path) {
  return PRIVATE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

// "/activity/seed-9" -> "https://letsplayot.com/activity/seed-9/" (or /en/activity/seed-9/).
// GitHub Pages serves every page from a folder, so the address with the final slash is the real one.
export function pageUrl(path, language = "he") {
  const bare = path === "/" ? "" : path.replace(/\/+$/, "");
  return `${SITE_URL}${language === "en" ? "/en" : ""}${bare}/`;
}

export function absoluteUrl(path = "") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

const pick = (language, he, en) => (language === "en" ? en : he);
const clean = (text = "") => String(text).replace(/\s+/g, " ").trim();

function contextLabel(context, language) {
  return IMAGE_CONTEXT[context][language === "en" ? 1 : 0];
}

const TITLE_KIND = {
  activity: ["פעילות לילדים", "Activity"],
  game: ["משחק לילדים", "Game"],
  boardGame: ["משחק קופסה לילדים", "Board Game"],
  recipe: ["מתכון לילדים", "Recipe"],
  experiment: ["ניסוי לילדים", "Science Experiment"],
};

// "מגש חושי – פעילות לילדים | בואו נשחק", "Sensory Tray — Activity for Kids | Let's Play".
function itemTitle(name, context, language) {
  const [he, kind] = TITLE_KIND[context];
  if (language === "en") {
    // "Shark Teeth Play Dough Activity" -> "Shark Teeth Play Dough Activity for Kids", not "... Activity — Activity for Kids".
    const title = name.toLowerCase().endsWith(kind.toLowerCase()) ? `${name} for Kids` : `${name} — ${kind} for Kids`;
    return `${title} | ${SITE_NAME.en}`;
  }
  return `${name} – ${he} | ${SITE_NAME.he}`;
}

const publisher = {
  "@type": "Organization",
  name: SITE_NAME.en,
  alternateName: SITE_NAME.he,
  url: `${SITE_URL}/`,
  logo: absoluteUrl("/boo-nesahek-logo.png"),
};

function howTo({ name, description, image, url, language, supplies = [], tools = [], steps = [], minutes }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    ...(image ? { image: absoluteUrl(image) } : {}),
    inLanguage: language,
    url,
    ...(minutes ? { totalTime: `PT${minutes}M` } : {}),
    ...(supplies.length ? { supply: supplies.map((item) => ({ "@type": "HowToSupply", name: clean(item) })) } : {}),
    ...(tools.length ? { tool: tools.map((item) => ({ "@type": "HowToTool", name: clean(item) })) } : {}),
    ...(steps.length ? { step: steps.map((step, index) => ({ "@type": "HowToStep", position: index + 1, text: clean(step.text ?? step), ...(step.image ? { image: absoluteUrl(step.image) } : {}) })) } : {}),
    publisher,
  };
}

// Content for one page. `content` holds the site data (activities, games, recipes, experiments);
// the browser loads it on demand and the build script passes it in directly.
export function resolveSeo(path, language, content) {
  const bare = path.replace(/\/+$/, "") || "/";
  const url = pageUrl(bare, language);
  const base = { url, path: bare, language, robots: INDEX, type: "website", image: SHARE_IMAGE.url, imageAlt: null, schema: null };

  let match = bare.match(/^\/activity\/([^/]+)$/);
  if (match && content?.activities) {
    const activity = content.activities.find((item) => item.id === decodeURIComponent(match[1]));
    if (!activity) return null;
    const english = language === "en" ? content.activityEnglish(activity) : null;
    const name = content.activityTitle(activity, language);
    const context = activityContext(activity);
    const description = clean(pick(language, activity.short_description || activity.description, english?.short_description || english?.description || activity.short_description));
    const hero = content.activityHero(activity.id) || activity.hero_image;
    const steps = (english?.steps || (activity.steps || []).map((step) => step.text)).map((text, index) => ({ text, image: activity.steps?.[index]?.image }));
    return {
      ...base,
      title: itemTitle(name, context, language),
      description,
      type: "article",
      heroImage: hero,
      imageAlt: `${name} – ${contextLabel(context, language)}`,
      schema: howTo({ name, description, image: hero, url, language, supplies: english?.materials || activity.materials || [], steps, minutes: activity.duration_min }),
    };
  }

  match = bare.match(/^\/board-game\/([^/]+)$/);
  if (match && content?.boardGames) {
    const game = content.boardGames.find((item) => item.id === decodeURIComponent(match[1]));
    if (!game) return null;
    const english = language === "en" ? content.boardGamesEnglish[game.id] : null;
    const name = english?.title || game.title;
    const description = clean(english ? english.short_description || english.description : game.short_description || game.description);
    return {
      ...base,
      title: itemTitle(name, "boardGame", language),
      description,
      type: "article",
      heroImage: game.image,
      imageAlt: `${name} – ${contextLabel("boardGame", language)}`,
      schema: {
        "@context": "https://schema.org",
        "@type": "Game",
        name,
        description,
        ...(game.image ? { image: absoluteUrl(game.image) } : {}),
        inLanguage: language,
        url,
        ...(game.age_min ? { audience: { "@type": "PeopleAudience", suggestedMinAge: game.age_min, ...(game.age_max ? { suggestedMaxAge: game.age_max } : {}) } } : {}),
        publisher,
      },
    };
  }

  match = bare.match(/^\/parent\/recipes\/([^/]+)$/);
  if (match && content?.recipes) {
    const recipe = content.recipes.find((item) => item.id === decodeURIComponent(match[1]));
    if (!recipe) return null;
    const english = language === "en" ? content.recipesEnglish[recipe.id] : null;
    const name = english?.title || recipe.title;
    const description = language === "en"
      ? `An illustrated recipe for making ${name} with children: ingredients, tools and clear steps.`
      : `מתכון מאויר להכנת ${recipe.title} עם ילדים: מצרכים, כלים ושלבי הכנה ברורים.`;
    const ingredients = english?.ingredients || recipe.ingredients.map((item) => item.text);
    const steps = (english?.steps || recipe.steps.map((step) => step.text)).map((text, index) => ({ text, image: recipe.steps[index]?.img }));
    return {
      ...base,
      title: itemTitle(name, "recipe", language),
      description,
      type: "article",
      heroImage: recipe.cover,
      imageAlt: `${name} – ${contextLabel("recipe", language)}`,
      schema: {
        "@context": "https://schema.org",
        "@type": "Recipe",
        name,
        description,
        ...(recipe.cover ? { image: absoluteUrl(recipe.cover) } : {}),
        inLanguage: language,
        url,
        recipeCategory: language === "en" ? "Kids' recipe" : "מתכון לילדים",
        recipeIngredient: ingredients.map(clean),
        tool: (english?.tools || recipe.tools.map((item) => item.text)).map((item) => ({ "@type": "HowToTool", name: clean(item) })),
        recipeInstructions: steps.map((step, index) => ({ "@type": "HowToStep", position: index + 1, text: clean(step.text), ...(step.image ? { image: absoluteUrl(step.image) } : {}) })),
        author: publisher,
        publisher,
      },
    };
  }

  match = bare.match(/^\/parent\/experiments\/([^/]+)$/);
  if (match && content?.experiments) {
    const experiment = content.experiments.find((item) => item.id === decodeURIComponent(match[1]));
    if (!experiment) return null;
    const english = language === "en" ? content.experimentsEnglish[experiment.id] : null;
    const name = english?.title || experiment.title;
    const description = language === "en"
      ? `${name}: materials, illustrated steps and a simple science explanation for children.`
      : `${experiment.title}: ציוד, שלבים מאוירים והסבר מדעי פשוט לילדים.`;
    const hero = content.experimentHero(experiment.id);
    return {
      ...base,
      title: itemTitle(name, "experiment", language),
      description,
      type: "article",
      heroImage: hero,
      imageAlt: `${name} – ${contextLabel("experiment", language)}`,
      schema: howTo({ name, description, image: hero, url, language, supplies: english?.materials || experiment.materials, steps: english?.steps || experiment.steps }),
    };
  }

  const meta = PAGE_META[bare];
  if (meta) {
    const [title, description] = meta[language === "en" ? 1 : 0];
    const schema = bare === "/"
      ? { "@context": "https://schema.org", "@graph": [{ ...publisher, "@id": `${SITE_URL}/#organization` }, { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME[language], url, inLanguage: language, description, publisher: { "@id": `${SITE_URL}/#organization` } }] }
      : { "@context": "https://schema.org", "@type": "WebPage", name: title, description, url, inLanguage: language, isPartOf: { "@type": "WebSite", name: SITE_NAME[language], url: pageUrl("/", language) } };
    return { ...base, title, description, schema };
  }

  // Everything else: personal tools and addresses that are not real pages.
  return {
    ...base,
    title: pick(language, "בואו נשחק – פעילויות וכלים לילדים", "Let's Play — Practical Play Ideas for Children"),
    description: pick(language, PAGE_META["/"][0][1], PAGE_META["/"][1][1]),
    robots: NOINDEX,
    url: null,
  };
}

// The same page in both languages, for <link rel="alternate" hreflang>.
export function alternates(seo) {
  if (!seo?.url) return [];
  return [
    ["he", pageUrl(seo.path, "he")],
    ["en", pageUrl(seo.path, "en")],
    ["x-default", pageUrl(seo.path, "he")],
  ];
}

// Everything that goes in <head> for search engines and link previews.
export function headTags(seo) {
  const esc = (value) => String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const image = absoluteUrl(seo.image);
  const tags = [
    `<title>${esc(seo.title)}</title>`,
    `<meta name="description" content="${esc(seo.description)}" />`,
    `<meta name="robots" content="${seo.robots}" />`,
  ];
  if (seo.url) {
    tags.push(`<link rel="canonical" href="${seo.url}" />`);
    for (const [lang, href] of alternates(seo)) tags.push(`<link rel="alternate" hreflang="${lang}" href="${href}" />`);
  }
  tags.push(
    `<meta property="og:site_name" content="${esc(SITE_NAME[seo.language])}" />`,
    `<meta property="og:locale" content="${seo.language === "en" ? "en_US" : "he_IL"}" />`,
    `<meta property="og:locale:alternate" content="${seo.language === "en" ? "he_IL" : "en_US"}" />`,
    `<meta property="og:type" content="${seo.type}" />`,
    `<meta property="og:title" content="${esc(seo.title)}" />`,
    `<meta property="og:description" content="${esc(seo.description)}" />`,
    ...(seo.url ? [`<meta property="og:url" content="${seo.url}" />`] : []),
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="${SHARE_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${SHARE_IMAGE.height}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(seo.title)}" />`,
    `<meta name="twitter:description" content="${esc(seo.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  );
  if (seo.schema) tags.push(`<script type="application/ld+json" data-seo-json-ld="page">${JSON.stringify(seo.schema).replace(/</g, "\\u003c")}</script>`);
  return tags;
}
