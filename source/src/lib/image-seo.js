import { useEffect } from "react";
import { getLanguage } from "@/lib/language";

const GENERATED_TITLE = "imageSeoTitle";
const GENERATED_ALT = "imageSeoAlt";

function cleanText(value = "") { return value.replace(/\s+/g, " ").trim(); }
function hasHebrew(value = "") { return /[֐-׿]/.test(value); }
function hasLatin(value = "") { return /[a-z]/i.test(value); }
function matchesLanguage(value, language) {
  if (!value) return false;
  return language === "he" ? !hasLatin(value) : !hasHebrew(value);
}

// Where an image appears. Every context says "for kids" — that is what people search for.
export const IMAGE_CONTEXT = {
  morning: ["לוח התארגנות בוקר לילדים", "Morning routine chart for kids"],
  evening: ["לוח התארגנות ערב לילדים", "Evening routine chart for kids"],
  weekly: ["לוח התארגנות שבועי לילדים", "Weekly visual schedule for kids"],
  activity: ["פעילות לילדים", "Activity for kids"],
  game: ["משחק לילדים", "Game for kids"],
  boardGame: ["משחק קופסה לילדים", "Board game for kids"],
  recipe: ["מתכון לילדים", "Recipe for kids"],
  experiment: ["ניסוי לילדים", "Science experiment for kids"],
  story: ["סיפור חברתי לילדים", "Social story for kids"],
  motorTrail: ["מסלול מוטורי לילדים", "Obstacle course for kids"],
  sessionBoard: ["לוח מפגש טיפולי לילדים", "Therapy session board for kids"],
  writing: ["הדרכה לכתיבה לילדים", "Handwriting guide for kids"],
  calendar: ["לוח שנה משפחתי להדפסה", "Printable family calendar"],
  activities: ["פעילויות לילדים", "Activities for kids"],
};

// The context of a page, from its address. Used for images that have no alt of their own.
const ROUTE_CONTEXT = [
  [/^\/(?:en\/)?(?:parent|therapist|child)\/morning-routine/, "morning"],
  [/^\/(?:en\/)?(?:parent|therapist|child)\/evening-routine/, "evening"],
  [/^\/(?:en\/)?(?:(?:parent|therapist)\/weekly-board|shared\/weekly-board)/, "weekly"],
  [/^\/(?:en\/)?(?:parent|therapist)\/social-stories/, "story"],
  [/^\/(?:en\/)?(?:parent|therapist)\/recipes/, "recipe"],
  [/^\/(?:en\/)?(?:parent|therapist)\/experiments/, "experiment"],
  [/^\/(?:en\/)?(?:board-game\/|(?:parent|therapist)\/board-games)/, "boardGame"],
  [/^\/(?:en\/)?therapist\/motor-trail/, "motorTrail"],
  [/^\/(?:en\/)?therapist\/(?:build|board)/, "sessionBoard"],
  [/^\/(?:en\/)?(?:(?:parent|therapist)\/hebrew-calendar|shared\/hebrew-calendar)/, "calendar"],
  [/^\/(?:en\/)?activity\//, "activity"],
  [/^\/(?:en\/)?(?:parent|therapist)\/(?:play|all)/, "activities"],
];

function routeContext(pathname = window.location.pathname) {
  return ROUTE_CONTEXT.find(([pattern]) => pattern.test(pathname))?.[1] || "";
}

const GAME_CATEGORIES = ["משחק", "משחק חברתי", "משחק ופנאי"];

// Playful activities are searched for as "משחקים לילדים", the rest as "פעילויות לילדים".
export function activityContext(activity) {
  if (!activity) return "activity";
  const title = activity.title || "";
  const isGame = (activity.categories || []).some((c) => GAME_CATEGORIES.includes(c))
    || (/(^|\s)(משחק|משחקי|תופסת|מחבואים)(\s|$)/.test(title) && !/^הכנת\s/.test(title));
  return isGame ? "game" : "activity";
}

export function shortLabel(text = "", max = 70) {
  const clean = cleanText(String(text)).replace(/[.:;,]+$/, "");
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(" ") > 30 ? cut.lastIndexOf(" ") : max).replace(/[.:;,]+$/, "") + "…";
}

// Alt text: what the image shows, then where it appears — "אני מצחצחת שיניים – לוח התארגנות בוקר לילדים".
export function imageAlt(label, context, language = getLanguage()) {
  const where = Array.isArray(IMAGE_CONTEXT[context]) ? IMAGE_CONTEXT[context][language === "en" ? 1 : 0] : context;
  const parts = [cleanText(label || ""), cleanText(where || "")].filter(Boolean);
  if (parts.length === 2 && parts[0].includes(parts[1])) return parts[0];
  return parts.join(" – ");
}

function localizedAttribute(img, name, language) {
  return cleanText(img.dataset[`${name}${language === "he" ? "He" : "En"}`] || "");
}

// The text shown next to an image: its button, list item, card or figure.
function nearbyLabel(img, language) {
  const explicit = cleanText(img.dataset.seoName || img.getAttribute("aria-label") || "");
  if (matchesLanguage(explicit, language)) return explicit;
  const parent = img.closest("figure, li, a, button, label, article, [data-image-label], [data-image-label-he], [data-image-label-en]");
  if (!parent) return "";
  const localizedParent = cleanText(parent.dataset?.[language === "he" ? "imageLabelHe" : "imageLabelEn"] || "");
  if (localizedParent) return localizedParent;
  const dataLabel = cleanText(parent.dataset?.imageLabel || "");
  if (matchesLanguage(dataLabel, language)) return dataLabel;
  const parentAriaLabel = cleanText(parent.getAttribute?.("aria-label") || "")
    .replace(/^(?:הגדלת|הקטנת)\s+/, "")
    .replace(/^(?:Enlarge|Reduce)\s+/i, "");
  if (matchesLanguage(parentAriaLabel, language)) return parentAriaLabel;
  const caption = cleanText(parent.querySelector?.("figcaption, h1, h2, h3, h4")?.textContent || parent.textContent || "");
  return matchesLanguage(caption, language) ? shortLabel(caption) : "";
}

function pageTitle(language) {
  const heading = cleanText(document.querySelector("main h1, h1")?.textContent || "");
  return matchesLanguage(heading, language) ? shortLabel(heading) : (language === "he" ? "בואו נשחק" : "Let's Play");
}

function describeImage(img, language) {
  const existingAlt = cleanText(img.getAttribute("alt") || "");
  const originalAlt = cleanText(img.dataset.imageSeoOriginalAlt || "");
  const canUseExistingAlt = img.dataset[GENERATED_ALT] !== "true" && matchesLanguage(existingAlt, language);
  const own = localizedAttribute(img, "alt", language) || (matchesLanguage(originalAlt, language) ? originalAlt : "") || (canUseExistingAlt ? existingAlt : "");
  if (own) return own;
  return imageAlt(nearbyLabel(img, language) || pageTitle(language), routeContext(), language);
}

function enrichImage(img, language = getLanguage()) {
  if (!(img instanceof HTMLImageElement)) return;
  if (!("imageSeoOriginalAlt" in img.dataset)) img.dataset.imageSeoOriginalAlt = img.getAttribute("alt") || "";
  if (!("imageSeoOriginalTitle" in img.dataset)) img.dataset.imageSeoOriginalTitle = img.getAttribute("title") || "";
  const description = describeImage(img, language);
  if (img.dataset.noHoverTitle !== "true") {
    const title = cleanText(img.getAttribute("title") || "");
    if (!title || img.dataset[GENERATED_TITLE] === "true" || !matchesLanguage(title, language)) {
      const originalTitle = cleanText(img.dataset.imageSeoOriginalTitle || "");
      img.setAttribute("title", localizedAttribute(img, "title", language) || (matchesLanguage(originalTitle, language) ? originalTitle : description));
      img.dataset[GENERATED_TITLE] = "true";
    }
  }
  const alt = cleanText(img.getAttribute("alt") || "");
  if (!alt || img.dataset[GENERATED_ALT] === "true" || !matchesLanguage(alt, language)) {
    img.setAttribute("alt", localizedAttribute(img, "alt", language) || description);
    img.dataset[GENERATED_ALT] = "true";
  }
}

export function useImageSeo() {
  useEffect(() => {
    const scan = (root = document) => {
      const language = getLanguage();
      if (root instanceof HTMLImageElement) enrichImage(root, language);
      root.querySelectorAll?.("img").forEach((img) => enrichImage(img, language));
    };
    const onLanguageChange = () => scan();
    scan();
    const observer = new MutationObserver((mutations) => mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node instanceof Element) scan(node);
    })));
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("boo_language_change", onLanguageChange);
    return () => { observer.disconnect(); window.removeEventListener("boo_language_change", onLanguageChange); };
  }, []);
}
