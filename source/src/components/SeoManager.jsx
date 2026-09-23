import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/lib/language";

const SITE_URL = "https://www.letsplayot.com";
const SITE_NAME = "בואו נשחק";
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
  "/parent/morning-routine": ["Morning Routine Board — Let's Play", "Create a personalised visual morning routine for your child."],
  "/parent/evening-routine": ["Evening Routine Board — Let's Play", "Create a personalised visual evening routine for your child."],
  "/parent/weekly-board": ["Weekly Visual Planner — Let's Play", "Create a clear weekly planner using child-friendly illustrations."],
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
    const [{ SEED_ACTIVITIES }, { activityHero }] = await Promise.all([import("@/lib/activities-data"), import("@/lib/activity-icons")]);
    const id = decodeURIComponent(pathname.split("/").pop());
    const activity = SEED_ACTIVITIES.find((item) => item.id === id);
    if (activity) return {
      title: `${activity.title} — פעילות לילדים | ${SITE_NAME}`,
      description: activity.short_description || activity.description,
      image: activityHero(activity.id) || activity.hero_image || DEFAULT_IMAGE,
      canonical: `${SITE_URL}/activity/${encodeURIComponent(activity.id)}`,
      type: "article",
      schema: {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: activity.title,
        description: activity.short_description || activity.description,
        image: absoluteUrl(activityHero(activity.id) || activity.hero_image || DEFAULT_IMAGE),
        url: `${SITE_URL}/activity/${encodeURIComponent(activity.id)}`,
        inLanguage: "he",
        audience: { "@type": "PeopleAudience", suggestedMinAge: activity.age_min, suggestedMaxAge: activity.age_max },
        educationalUse: "פעילות טיפולית לילדים",
      },
    };
  }

  if (pathname === "/parent/recipes" && params.get("r")) {
    const { RECIPES } = await import("@/pages/TherapistRecipes");
    const recipe = RECIPES.find((item) => item.id === params.get("r"));
    if (recipe) return {
      title: `${recipe.title} — מתכון לילדים | ${SITE_NAME}`,
      description: recipe.description || `מתכון מאויר להכנת ${recipe.title} עם ילדים.`,
      image: recipe.cover || DEFAULT_IMAGE,
      canonical: `${SITE_URL}/parent/recipes?r=${encodeURIComponent(recipe.id)}`,
      type: "article",
    };
  }

  if (pathname === "/parent/experiments" && params.get("e")) {
    const { EXPERIMENTS, experimentHero } = await import("@/pages/TherapistExperiments");
    const experiment = EXPERIMENTS.find((item) => item.id === params.get("e"));
    if (experiment) return {
      title: `${experiment.title} — ניסוי לילדים | ${SITE_NAME}`,
      description: `${experiment.title}: ציוד, שלבים מאוירים והסבר מדעי לילדים.`,
      image: experimentHero(experiment.id),
      canonical: `${SITE_URL}/parent/experiments?e=${encodeURIComponent(experiment.id)}`,
      type: "article",
    };
  }

  if (pathname.startsWith("/board-game/")) {
    const { BOARD_GAMES } = await import("@/lib/board-games-data");
    const id = decodeURIComponent(pathname.split("/").pop());
    const game = BOARD_GAMES.find((item) => item.id === id);
    if (game) return {
      title: `${game.title} — משחק לילדים | ${SITE_NAME}`,
      description: game.short_description || game.description,
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
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      });
    }
    updateSeo();
    return () => { cancelled = true; };
  }, [pathname, search, language]);

  return null;
}
