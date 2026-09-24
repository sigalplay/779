import { useEffect, useState } from "react";

const KEY = "boo_nesahek_language";
function readLanguage() {
  try { return window.localStorage.getItem(KEY); }
  catch { return null; }
}

// הבחירה באנגלית נשמרת לשיחת הגלישה הנוכחית (sessionStorage). ביקור חדש נפתח בעברית,
// אלא אם הכתובת מתחילה ב-/en.
const SESSION_KEY = "boo_english_preview";

function isEnglishPath() {
  const path = window.location.pathname;
  return path === "/en" || path.startsWith("/en/");
}

export function getLanguage() {
  if (isEnglishPath()) return "en";
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1" && readLanguage() === "en" ? "en" : "he";
  } catch {
    return readLanguage() === "en" ? "en" : "he";
  }
}
export function setLanguage(language) {
  try {
    window.localStorage.setItem(KEY, language);
    if (language === "en") window.sessionStorage.setItem(SESSION_KEY, "1");
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch { /* The site must still work when browser storage is blocked. */ }
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
