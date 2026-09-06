import { Link } from "react-router-dom";
import { Cookie, Mail } from "lucide-react";
import { brandLogo, useTranslator } from "@/lib/language";

export function SiteFooter() {
  const { language, t } = useTranslator();
  return <footer className="border-t border-border/70 bg-white/75 print:hidden" dir={language === "en" ? "ltr" : "rtl"}>
    <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex items-center gap-3"><img src={brandLogo(language)} alt="" className="h-12 w-auto" /><div><p className="font-bold">{t("בואו נשחק", "Let's Play")}</p><p className="mt-1 text-xs text-muted-foreground">{t("רעיונות וכלים להורים ולמטפלים", "Ideas and tools for parents and therapists")}</p></div></div>
      <nav className="flex flex-wrap gap-x-4 gap-y-3 text-sm font-semibold text-muted-foreground" aria-label={t("מידע משפטי", "Legal information")}>
        <Link className="hover:text-foreground" to="/about">{t("אודות", "About")}</Link><Link className="hover:text-foreground" to="/privacy">{t("מדיניות פרטיות", "Privacy Policy")}</Link><Link className="hover:text-foreground" to="/terms">{t("תנאי שימוש", "Terms of Use")}</Link><Link className="hover:text-foreground" to="/cookies">{t("מדיניות Cookies", "Cookie Policy")}</Link>
        <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => window.dispatchEvent(new Event("boo_open_cookie_preferences"))}><Cookie className="h-4 w-4" />{t("העדפות Cookies", "Cookie preferences")}</button>
        <a className="inline-flex items-center gap-1 hover:text-foreground" href="mailto:sigalsplay@gmail.com"><Mail className="h-4 w-4" />{t("יצירת קשר", "Contact")}</a>
      </nav>
    </div>
    <div className="border-t border-border/50 px-5 py-3 text-center text-xs text-muted-foreground">© 2026 {t("בואו נשחק · כל הזכויות שמורות.", "Let's Play · All rights reserved.")}</div>
  </footer>;
}
