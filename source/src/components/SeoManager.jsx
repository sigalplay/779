import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/lib/language";

const SITE_URL = "https://www.letsplayot.com";
const SITE_NAME = "בואו נשחק";
const SITE_NAME_EN = "Let's Play";
const DEFAULT_IMAGE = "/boo-nesahek-logo.png";

const PUBLIC_PAGE_META = {
  "/": ["בואו נשחק — פעילויות טיפוליות לילדים", "פעילויות, משחקים, מתכונים וכלים טיפוליים לילדים, להורים ולמטפלים."],
  "/parent/play": ["פעילויות לילדים לפי צורך — בואו נשחק", "מצאו פעילויות לילדים לפי גיל, מטרה טיפולית, ציוד וקושי."],
  "/parent/recipes": ["מתכונים לילדים — בואו נשחק", "מתכונים פשוטים ומהנים לילדים המשלבים עצמאות, תכנון ומיומנויות מוטוריות."],
  "/parent/experiments": ["ניסויים לילדים בבית — בואו נשחק", "ניסויים פשוטים ומאוירים לילדים, עם ציוד, שלבים והסבר מדעי ברור."],
  "/parent/board-games": ["משחקי קופסה לילדים — בואו נשחק", "רעיונות למשחקי קופסה והדרכה מותאמת לילדים ולהורים."],
  "/parent/morning-routine": ["לוח התארגנות בוקר לילדים — בואו נשחק", "יצירת לוח בוקר חזותי ואישי לילדים."],
  "/parent/evening-routine": ["לוח התארגנות ערב לילדים — בואו נשחק", "יצירת לוח ערב חזותי ואישי לילדים."],
  "/parent/weekly-board": ["לוח התארגנות שבועי לילדים — בואו נשחק", "צרו לוח שבועי חזותי עם איורים ברורים לפעילויות ולמשימות."],
  "/parent/daily-sequences": ["רצפים של פעולות יום־יומיות לילדים — בואו נשחק", "סדר פעולות חזותי לשירותים, שטיפת ידיים, מקלחת ולבוש."],
  "/parent/hebrew-calendar": ["יצירת לוח שנה — בואו נשחק", "צרו והדפיסו לוח שנה משפחתי עם תאריכים עבריים, חגים ותמונה אישית."],
  "/parent/social-stories": ["סיפורים חברתיים לילדים — בואו נשחק", "סיפורים חברתיים מאוירים המסייעים לילדים להבין מצבים ושגרות."],
  "/about": ["אודות בואו נשחק", "הכירו את בואו נשחק — מאגר פעילויות וכלים טיפוליים לילדים, להורים ולמטפלים."],
};

const PUBLIC_PAGE_META_EN = {
  "/": ["Let's Play — Practical Play Ideas for Children", "Clear activity ideas, recipes, experiments, and visual tools for parents and therapists."],
  "/parent/play": ["Find an Activity — Let's Play", "Find a suitable children's activity by age, need, materials, and available time."],
  "/parent/recipes": ["Easy Recipes for Children — Let's Play", "Simple illustrated recipes that support independence, planning, and fine motor skills."],
  "/parent/experiments": ["Simple Experiments for Children — Let's Play", "Illustrated home experiments using simple materials and clear steps."],
  "/parent/board-games": ["Board Games for Children — Let's Play", "Board game ideas and practical ways to adapt play for children."],
  "/parent/morning-routine": ["Morning Routine visual schedule — Let's Play", "Create a personalized visual morning routine for your child."],
  "/parent/evening-routine": ["Evening Routine visual schedule — Let's Play", "Create a personalized visual evening routine for your child."],
  "/parent/weekly-board": ["Weekly Visual Schedule — Let's Play", "Create a clear weekly visual schedule using child-friendly illustrations."],
  "/parent/daily-sequences": ["Daily Living Sequences — Let's Play", "Visual step-by-step sequences for toileting, handwashing, showering, and dressing."],
  "/parent/hebrew-calendar": ["Create a Family Calendar — Let's Play", "Create and print a family calendar with personal events and a family photo."],
  "/parent/social-stories": ["Social Stories for Children — Let's Play", "Illustrated social stories that help children understand routines and everyday situations."],
  "/about": ["About Let's Play", "Learn about Let's Play, a growing collection of practical activities and visual tools for children, parents, and therapists."],
};

const PRIVATE_PREFIXES = ["/therapist", "/profile", "/auth", "/favorites", "/child", "/shared"];

function absoluteUrl(path = "") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

function setMeta(selector, attrs) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

async function resolveSeo(pathname, params, language = "he") {
  if (pathname.startsWith("/activity/")) {
    const [{ SEED_ACTIVITIES }, { activityHero }, { activityEnglishContent }, { activityTitle }] = await Promise.all([
      import("@/lib/activities-data"), import("@/lib/activity-icons"), import("@/lib/activity-content-en"), import("@/lib/content-translations"),
    ]);
    const id = decodeURIComponent(pathname.split("/").pop());
    const activity = SEED_ACTIVITIES.find((item) => item.id === id);
    const english = language === "en" ? activityEnglishContent(activity) : null;
    const name = language === "en" ? activityTitle(activity, "en") : activity?.title;
    if (activity) return {
      title: language === "en" ? `${name} — Kids' Activity | ${SITE_NAME_EN}` : `${activity.title} — פעילות לילדים | ${SITE_NAME}`,
      description: english?.short_description || english?.description || activity.short_description || activity.description,
      image: activityHero(activity.id) || activity.hero_image || DEFAULT_IMAGE,
      canonical: `${SITE_URL}/activity/${encodeURIComponent(activity.id)}`,
      type: "article",
      schema: {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name,
        description: english?.short_description || english?.description || activity.short_description || activity.description,
        image: absoluteUrl(activityHero(activity.id) || activity.hero_image || DEFAULT_IMAGE),
        url: `${SITE_URL}/activity/${encodeURIComponent(activity.id)}`,
        inLanguage: language,
        audience: { "@type": "PeopleAudience", suggestedMinAge: activity.age_min, suggestedMaxAge: activity.age_max },
        educationalUse: language === "en" ? "Therapeutic activity for children" : "פעילות טיפולית לילדים",
      },
    };
  }

  if (pathname === "/parent/recipes" && params.get("r")) {
    const [{ RECIPES }, { RECIPE_EN }] = await Promise.all([import("@/pages/TherapistRecipes"), import("@/lib/recipe-content-en")]);
    const recipe = RECIPES.find((item) => item.id === params.get("r"));
    const englishTitle = RECIPE_EN[recipe?.id]?.title || recipe?.title;
    if (recipe) return {
      title: language === "en" ? `${englishTitle} — Kids' Recipe | ${SITE_NAME_EN}` : `${recipe.title} — מתכון לילדים | ${SITE_NAME}`,
      description: language === "en" ? `An illustrated recipe for making ${englishTitle} with children.` : recipe.description || `מתכון מאויר להכנת ${recipe.title} עם ילדים.`,
      image: recipe.cover || DEFAULT_IMAGE,
      canonical: `${SITE_URL}/parent/recipes?r=${encodeURIComponent(recipe.id)}`,
      type: "article",
    };
  }

  if (pathname === "/parent/experiments" && params.get("e")) {
    const [{ EXPERIMENTS, experimentHero }, { EXPERIMENT_EN }] = await Promise.all([import("@/pages/TherapistExperiments"), import("@/lib/experiment-content-en")]);
    const experiment = EXPERIMENTS.find((item) => item.id === params.get("e"));
    const englishTitle = EXPERIMENT_EN[experiment?.id]?.title || experiment?.title;
    if (experiment) return {
      title: language === "en" ? `${englishTitle} — Kids' Experiment | ${SITE_NAME_EN}` : `${experiment.title} — ניסוי לילדים | ${SITE_NAME}`,
      description: language === "en" ? `${englishTitle}: materials, illustrated steps, and a simple science explanation for children.` : `${experiment.title}: ציוד, שלבים מאוירים והסבר מדעי לילדים.`,
      image: experimentHero(experiment.id),
      canonical: `${SITE_URL}/parent/experiments?e=${encodeURIComponent(experiment.id)}`,
      type: "article",
    };
  }

  if (pathname.startsWith("/board-game/")) {
    const [{ BOARD_GAMES }, { BOARD_GAMES_EN }] = await Promise.all([import("@/lib/board-games-data"), import("@/lib/board-games-en")]);
    const id = decodeURIComponent(pathname.split("/").pop());
    const game = BOARD_GAMES.find((item) => item.id === id);
    const english = language === "en" ? BOARD_GAMES_EN[game?.id] : null;
    if (game) return {
      title: english ? `${english.title} — Kids' Game | ${SITE_NAME_EN}` : `${game.title} — משחק לילדים | ${SITE_NAME}`,
      description: english ? english.short_description || english.description : game.short_description || game.description,
      image: game.image || DEFAULT_IMAGE,
      canonical: `${SITE_URL}/board-game/${encodeURIComponent(game.id)}`,
      type: "article",
    };
  }

  const meta = language === "en" ? PUBLIC_PAGE_META_EN : PUBLIC_PAGE_META;
  const fallback = language === "en" ? ["Let's Play — Practical Play Ideas for Children", "Activities and practical tools for children, parents, and therapists."] : ["בואו נשחק — פעילויות טיפוליות לילדים", "פעילויות וכלים טיפוליים לילדים, להורים ולמטפלים."];
  const [title, description] = meta[pathname] || fallback;
  return { title, description, image: DEFAULT_IMAGE, canonical: absoluteUrl(pathname), type: "website" };
}

export function SeoManager() {
  const { pathname, search } = useLocation();
  const [language] = useLanguage();

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams(search);
    async function updateSeo() {
      const seo = await resolveSeo(pathname, params, language);
      if (cancelled) return;
      const isPrivate = PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    document.title = seo.title;
    document.documentElement.lang = language;
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    setCanonical(seo.canonical);
    setMeta('meta[name="description"]', { name: "description", content: seo.description });
    setMeta('meta[name="robots"]', { name: "robots", content: isPrivate ? "noindex, nofollow" : "index, follow, max-image-preview:large" });
    setMeta('meta[property="og:title"]', { property: "og:title", content: seo.title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: seo.description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: seo.type });
    setMeta('meta[property="og:url"]', { property: "og:url", content: seo.canonical });
    setMeta('meta[property="og:image"]', { property: "og:image", content: absoluteUrl(seo.image) });
    setMeta('meta[property="og:locale"]', { property: "og:locale", content: language === "he" ? "he_IL" : "en_US" });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: seo.title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: seo.description });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: absoluteUrl(seo.image) });

    let jsonLd = document.head.querySelector('script[data-seo-json-ld="page"]');
    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.type = "application/ld+json";
      jsonLd.dataset.seoJsonLd = "page";
      document.head.appendChild(jsonLd);
    }
      jsonLd.textContent = JSON.stringify(seo.schema || {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: seo.title,
      description: seo.description,
      url: seo.canonical,
      inLanguage: language,
      isPartOf: { "@type": "WebSite", name: language === "en" ? SITE_NAME_EN : SITE_NAME, url: SITE_URL },
      });
    }
    updateSeo();
    return () => { cancelled = true; };
  }, [pathname, search, language]);

  return null;
}
