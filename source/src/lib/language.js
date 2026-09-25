import { useEffect, useState } from "react";

const KEY = "boo_nesahek_language";

// The address decides the language: English pages live under /en/ and Hebrew pages everywhere else.
// Each page has one address per language, so search engines can index both.
export function isEnglishPath(path = window.location.pathname) {
  return path === "/en" || path.startsWith("/en/");
}

// The router runs under /en for English pages, so links inside the app keep the language.
export function routerBasename() {
  return isEnglishPath() ? "/en" : undefined;
}

// The same page in the other language: /activity/seed-9 <-> /en/activity/seed-9.
export function languagePath(language, location = window.location) {
  const bare = location.pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  const path = language === "en" ? `/en${bare === "/" ? "/" : bare}` : bare;
  return `${path}${location.search}${location.hash}`;
}

export function getLanguage() {
  return isEnglishPath() ? "en" : "he";
}
export function setLanguage(language) {
  try {
    window.localStorage.setItem(KEY, language);
  } catch { /* The site must still work when browser storage is blocked. */ }
  if (language !== getLanguage()) {
    window.location.assign(languagePath(language));
    return;
  }
  document.documentElement.lang = language;
  document.documentElement.dir = language === "he" ? "rtl" : "ltr";
  window.dispatchEvent(new Event("boo_language_change"));
}
export function useLanguage() {
  const [language, update] = useState(getLanguage);
  useEffect(() => {
    setLanguage(getLanguage());
    const listener = () => update(getLanguage());
    window.addEventListener("boo_language_change", listener);
    return () => window.removeEventListener("boo_language_change", listener);
  }, []);
  return [language, setLanguage];
}

export function translate(language, hebrew, english) {
  return language === "en" ? english : hebrew;
}

export function brandLogo(language) {
  return language === "en" ? "/boo-nesahek-logo-en-fast.webp" : "/boo-nesahek-logo-fast.webp";
}

export function useTranslator() {
  const [language, changeLanguage] = useLanguage();
  return {
    language,
    changeLanguage,
    t: (hebrew, english) => translate(language, hebrew, english),
  };
}

// Standalone pages (outside the React app) that have a separate English copy under /en/.
const ENGLISH_STANDALONE = new Set(["/parent/routine-boards/", "/parent/daily-routine/", "/child/daily-routine/", "/parent/daily-sequences/"]);

export function standaloneHref(href, language) {
  return language === "en" && ENGLISH_STANDALONE.has(href) ? `/en${href}` : href;
}
