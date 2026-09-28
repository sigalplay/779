// The blog: categories, the articles and which of them are already published.
//
// Each article targets one search phrase of its own, a question that none of the site's pages
// targets (see the keyword map in the SEO research). It links to the page that owns the broader
// phrase of its subject, so the two support each other instead of competing (no cannibalization).
//
// An article is published on its date (Israel time). The site is rebuilt every day, so an article
// written ahead with a future date appears on its own, one every three days.
import { BLOG_POSTS } from "@/lib/blog-posts";

export const BLOG_CATEGORIES = [
  { id: "fine-motor", he: "מוטוריקה עדינה", en: "Fine motor skills", color: "#e8f3ec" },
  { id: "sensory", he: "ויסות חושי", en: "Sensory regulation", color: "#eaf2fb" },
  { id: "social-stories", he: "סיפורים חברתיים", en: "Social stories", color: "#fdeef0" },
  { id: "routine", he: "שגרה וכלים חזותיים", en: "Routines and visual tools", color: "#fff5dc" },
  { id: "autism", he: "אוטיזם וצרכים מיוחדים", en: "Autism and special needs", color: "#f1ecfa" },
  { id: "kitchen-science", he: "מטבח וניסויים", en: "Cooking and science", color: "#fdf0e4" },
  { id: "play", he: "משחק והתפתחות", en: "Play and development", color: "#eef6f6" },
];

export const BLOG_AUTHOR = {
  he: "סיגל ששון־ספקטור, מרפאה בעיסוק התפתחותית",
  en: "Sigal Sasson-Spector, developmental occupational therapist",
};

// Today's date in Israel, as "YYYY-MM-DD".
export function todayInIsrael(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function publishedPosts(today = todayInIsrael()) {
  return BLOG_POSTS.filter((post) => post.date <= today).sort((a, b) => b.date.localeCompare(a.date));
}

export function findPost(slug, today = todayInIsrael()) {
  return publishedPosts(today).find((post) => post.slug === slug) || null;
}

export function blogCategory(id) {
  return BLOG_CATEGORIES.find((category) => category.id === id) || null;
}

// Minutes to read the article body (about 200 words a minute).
export function readingMinutes(post, language) {
  const words = (post[language]?.body || []).flatMap((block) => (Array.isArray(block[1]) ? block[1] : [block[1]])).join(" ").split(/\s+/).length;
  return Math.max(2, Math.round(words / 200));
}

export function formatPostDate(date, language) {
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "he-IL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

// Plain text of the article (for descriptions and the search engines' article data).
export function postText(post, language) {
  return (post[language]?.body || [])
    .flatMap((block) => (Array.isArray(block[1]) ? block[1] : [block[1]]))
    .join(" ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
