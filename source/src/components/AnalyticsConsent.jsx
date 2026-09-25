import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslator } from "@/lib/language";

// Google Analytics נטען רק אחרי שהגולש אישר Cookies.
const GA_MEASUREMENT_ID = "G-751BTFV83S";
const CONSENT_KEY = "boo_nesahek_analytics_consent";

function readConsent() {
  try {
    return window.localStorage.getItem(CONSENT_KEY);
  } catch {
    return null;
  }
}

function loadAnalytics() {
  if (window.__booAnalyticsLoaded) return;
  window.__booAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.dataset.booAnalytics = "true";
  document.head.appendChild(script);
}

export function AnalyticsConsent() {
  const location = useLocation();
  const { language, t } = useTranslator();
  const [consent, setConsent] = useState(readConsent);
  const lastPage = useRef("");

  // "העדפות Cookies" בפוטר פותח שוב את ההודעה.
  useEffect(() => {
    const reopen = () => setConsent(null);
    window.addEventListener("boo_open_cookie_preferences", reopen);
    return () => window.removeEventListener("boo_open_cookie_preferences", reopen);
  }, []);

  useEffect(() => {
    if (consent !== "accepted") return;
    loadAnalytics();
    const page = `${location.pathname}${location.search}${location.hash}`;
    if (lastPage.current === page) return;
    lastPage.current = page;
    window.gtag("event", "page_view", { page_title: document.title, page_location: window.location.href, page_path: page });
  }, [consent, location.pathname, location.search, location.hash]);

  const choose = (value) => {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* storage may be blocked */
    }
    setConsent(value);
  };

  if (consent === "accepted" || consent === "declined") return null;
  return (
    <section className="analytics-consent" dir={language === "en" ? "ltr" : "rtl"} role="dialog" aria-live="polite" aria-label={t("העדפות פרטיות", "Privacy preferences")}>
      <p>{t("אתר זה משתמש בקבצי Cookies על מנת להעניק חווית גלישה מתקדמת", "This website uses Cookies to provide an enhanced browsing experience")}</p>
      <div className="analytics-consent__actions">
        <button type="button" className="analytics-consent__accept" onClick={() => choose("accepted")}>{t("קבל", "Accept")}</button>
        <button type="button" className="analytics-consent__decline" onClick={() => choose("declined")}>{t("דחה", "Decline")}</button>
      </div>
    </section>
  );
}
