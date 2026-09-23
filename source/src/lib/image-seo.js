import { useEffect } from "react";
import { getLanguage } from "@/lib/language";

const FILE_TERMS = {
  apple: ["תפוח", "apple"], apples: ["תפוחים", "apples"], biscuit: ["ביסקוויט", "biscuit"], biscuits: ["ביסקוויטים", "biscuits"],
  chocolate: ["שוקולד", "chocolate"], fridge: ["מקרר", "refrigerator"], refrigerator: ["מקרר", "refrigerator"],
  scissors: ["מספריים", "scissors"], pencil: ["עיפרון", "pencil"], glue: ["דבק", "glue"], book: ["ספר", "book"], books: ["ספרים", "books"],
  balloon: ["בלון", "balloon"], milk: ["חלב", "milk"], cup: ["כוס", "cup"], plate: ["צלחת", "plate"], water: ["מים", "water"],
  timer: ["טיימר חזותי", "visual timer"], bowl: ["קערה", "bowl"], spoon: ["כף", "spoon"], tray: ["מגש", "tray"],
  soap: ["סבון", "soap"], faucet: ["ברז", "faucet"], tap: ["ברז", "faucet"], experiment: ["ניסוי", "experiment"],
  marker: ["טוש", "marker"], markers: ["טושים", "markers"], black: ["שחור", "black"], red: ["אדום", "red"],
  paper: ["נייר", "paper"], crepe: ["קרפ", "crepe"], cardboard: ["קרטון", "cardboard"],
  bread: ["לחם", "bread"], tortilla: ["טורטייה", "tortilla"], cheese: ["גבינה", "cheese"], olives: ["זיתים", "olives"], olive: ["זית", "olive"],
  flour: ["קמח", "flour"], sugar: ["סוכר", "sugar"], salt: ["מלח", "salt"], oil: ["שמן", "oil"], vinegar: ["חומץ", "vinegar"],
  baking: ["אפייה", "baking"], soda: ["סודה", "soda"], food: ["מאכל", "food"], colouring: ["צבע מאכל", "food colouring"], color: ["צבע", "colour"],
  knife: ["סכין", "knife"], fork: ["מזלג", "fork"], bottle: ["בקבוק", "bottle"], bag: ["שקית", "bag"],
  candle: ["נר", "candle"], straw: ["קש", "straw"], string: ["חוט", "string"], tape: ["סרט הדבקה", "tape"],
  towel: ["מגבת", "towel"], hands: ["ידיים", "hands"], hand: ["יד", "hand"], socks: ["גרביים", "socks"], shoes: ["נעליים", "shoes"],
  shirt: ["חולצה", "shirt"], trousers: ["מכנסיים", "trousers"], pants: ["מכנסיים", "trousers"], shower: ["מקלחת", "shower"],
  logo: ["בואו נשחק", "Let's Play"],
};

const GENERATED_TITLE = "imageSeoTitle";
const GENERATED_ALT = "imageSeoAlt";

function cleanText(value = "") { return value.replace(/\s+/g, " ").trim(); }
function hasHebrew(value = "") { return /[\u0590-\u05ff]/.test(value); }
function hasLatin(value = "") { return /[a-z]/i.test(value); }
function matchesLanguage(value, language) {
  if (!value) return false;
  return language === "he" ? !hasLatin(value) : !hasHebrew(value);
}

export function labelFromFile(src = "", language = "he") {
  const raw = decodeURIComponent(src.split("?")[0].split("/").pop() || "")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/(?:^|[-_])(hero|cover|image|img|icon|material|step)(?:[-_]|$)/gi, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\b(?:seed|v)\d+\b/gi, " ")
    .replace(/\b\d+\b/g, " ");
  const translated = cleanText(raw).split(" ").map((word) => FILE_TERMS[word.toLowerCase()]?.[language === "he" ? 0 : 1] || word).join(" ");
  const cleaned = cleanText(translated);
  return matchesLanguage(cleaned, language) ? cleaned : (language === "he" ? "איור לילדים" : "Children's illustration");
}

function localizedAttribute(img, name, language) {
  return cleanText(img.dataset[`${name}${language === "he" ? "He" : "En"}`] || "");
}

function nearbyLabel(img, language) {
  const localized = localizedAttribute(img, "alt", language) || localizedAttribute(img, "title", language);
  if (localized) return localized;
  const explicit = cleanText(img.dataset.seoName || img.getAttribute("aria-label") || "");
  if (matchesLanguage(explicit, language)) return explicit;
  const parent = img.closest("figure, a, button, article, [data-image-label], [data-image-label-he], [data-image-label-en]");
  const localizedParent = cleanText(parent?.dataset?.[language === "he" ? "imageLabelHe" : "imageLabelEn"] || "");
  if (localizedParent) return localizedParent;
  const dataLabel = cleanText(parent?.dataset?.imageLabel || "");
  if (matchesLanguage(dataLabel, language)) return dataLabel;
  const parentAriaLabel = cleanText(parent?.getAttribute?.("aria-label") || "")
    .replace(/^(?:הגדלת|הקטנת)\s+/, "")
    .replace(/^(?:Enlarge|Reduce)\s+/i, "");
  if (matchesLanguage(parentAriaLabel, language)) return parentAriaLabel;
  const heading = parent?.querySelector?.("h1, h2, h3, h4, figcaption");
  const headingText = cleanText(heading?.textContent || "");
  if (matchesLanguage(headingText, language)) return headingText.slice(0, 100);
  return labelFromFile(img.currentSrc || img.src, language);
}

function describeImage(img, language) {
  const existingAlt = cleanText(img.getAttribute("alt") || "");
  const originalAlt = cleanText(img.dataset.imageSeoOriginalAlt || "");
  const canUseExistingAlt = img.dataset[GENERATED_ALT] !== "true" && matchesLanguage(existingAlt, language);
  const label = localizedAttribute(img, "alt", language) || (matchesLanguage(originalAlt, language) ? originalAlt : "") || (canUseExistingAlt ? existingAlt : "") || nearbyLabel(img, language);
  const brand = language === "he" ? "בואו נשחק" : "Let's Play";
  return label.includes(brand) ? label : `${label} — ${brand}`;
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
  const decorative = img.getAttribute("aria-hidden") === "true" || img.closest('[aria-hidden="true"]');
  const alt = cleanText(img.getAttribute("alt") || "");
  if (!decorative && (!alt || img.dataset[GENERATED_ALT] === "true" || !matchesLanguage(alt, language))) {
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
