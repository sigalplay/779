import { Link, useLocation } from "react-router-dom";
import { Home, Heart, LayoutGrid, Menu, X, UserRound, Sparkles, BriefcaseBusiness } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { isCloudSignedIn } from "@/lib/cloud-auth";
import { brandLogo, useTranslator } from "@/lib/language";
import { SiteFooter } from "@/components/SiteFooter";
import { AccessibilityWidget } from "@/components/AccessibilityWidget";

export function AppShell({ mode = "parent", children, pageClassName, fullScreen = false }) {
  const location = useLocation();
  const [signedIn, setSignedIn] = useState(() => isCloudSignedIn());
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, changeLanguage, t } = useTranslator();

  useEffect(() => {
    const onChange = () => setSignedIn(isCloudSignedIn());
    window.addEventListener("pp_auth_change", onChange);
    return () => window.removeEventListener("pp_auth_change", onChange);
  }, []);
  useEffect(() => { setMenuOpen(false); }, [location.pathname, location.search]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    const close = (event) => { if (event.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  const parentLinks = [
    ["/parent/play", "במה נשחק היום?", "What shall we play today?"], ["/parent/all", "כל הפעילויות", "All activities"], ["/parent/social-stories", "סיפורים חברתיים", "Social stories"], ["/parent/morning-routine", "לוח התארגנות בוקר", "Morning routine"], ["/parent/evening-routine", "לוח התארגנות ערב", "Evening routine"], ["/parent/weekly-board", "לוח התארגנות שבועי", "Weekly planner"], ["/parent/hebrew-calendar", "יצירת לוח שנה", "Create a calendar"], ["/parent/cipher", "מחולל כתב סתרים", "Secret code generator"], ["/parent/recipes", "מתכונים", "Recipes"], ["/parent/experiments", "ניסויים", "Experiments"], ["/parent/board-games", "משחקי קופסה", "Board games"],
  ];
  const therapistLinks = [
    ["/therapist/build", "בניית מפגש טיפולי", "Build a therapy session"], ["/therapist/diary", "יומן מטפל", "Therapist diary"], ["/therapist/plans", "התוכניות השמורות שלי", "My saved plans"], ["/therapist/all", "מאגר הפעילויות", "Activity library"], ["/therapist/motor-trail", "בניית מסלול מוטורי", "Motor course builder"], ["/therapist/social-stories", "סיפורים חברתיים", "Social stories"], ["/therapist/weekly-board", "לוח שבועי", "Weekly board"], ["/therapist/hebrew-calendar", "יצירת לוח שנה", "Create a calendar"], ["/therapist/session-notes", "הערות טיפול", "Session notes"], ["/therapist/recipes", "מתכונים", "Recipes"], ["/therapist/experiments", "ניסויים", "Experiments"],
  ];
  const active = (href) => location.pathname === href || (href !== "/" && location.pathname.startsWith(`${href}/`));
  const sectionLink = "rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-muted hover:text-foreground";
  const contextualAll = mode === "therapist" ? "/therapist/all" : "/parent/all";

  return <div className={cn("min-h-screen bg-background", pageClassName)}>
    <div className="global-print-brand hidden print:block" aria-hidden><img src={brandLogo(language)} alt="" /></div>
    {!fullScreen && <header className="sticky top-0 z-50 border-b border-border/70 bg-cream/95 backdrop-blur print:hidden">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5">
        <Link to="/" className="shrink-0"><img src={brandLogo(language)} alt={t("בואו נשחק", "Let's Play")} className="h-11 w-auto max-w-[130px] object-contain md:h-14 md:max-w-[155px]" /></Link>
        <nav className="hidden min-w-0 items-center justify-center gap-1 lg:flex" aria-label={t("ניווט ראשי", "Main navigation")}>
          {[["/", t("בית", "Home")], ["/parent/play", t("להורים", "Parents")], ["/therapist/build", t("למטפלים", "Therapists")], [contextualAll, t("כל הפעילויות", "All activities")], ["/favorites", t("מועדפים", "Favorites")], ["/about", t("אודות", "About")]].map(([href, label]) => <Link key={`${href}-${label}`} to={href} className={cn("whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition", active(href) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>{label}</Link>)}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden rounded-full border bg-white p-0.5 sm:flex" aria-label={t("בחירת שפה", "Choose language")}><button type="button" className={cn("rounded-full px-2 py-1 text-xs", language === "he" ? "bg-foreground text-background" : "text-muted-foreground")} onClick={() => changeLanguage("he")}>עברית</button><button type="button" className={cn("rounded-full px-2 py-1 text-xs", language === "en" ? "bg-foreground text-background" : "text-muted-foreground")} onClick={() => changeLanguage("en")}>English</button></div>
          <Link to={signedIn ? "/profile" : "/auth?mode=login"} className="hidden items-center gap-1.5 rounded-full bg-sage px-3.5 py-2 text-sm font-bold text-sage-foreground md:flex"><UserRound className="h-4 w-4" />{signedIn ? t("החשבון שלי", "My account") : t("כניסה", "Sign in")}</Link>
          <button type="button" onClick={() => setMenuOpen((value) => !value)} aria-expanded={menuOpen} aria-controls="site-navigation-menu" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm font-bold shadow-sm">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}<span className="hidden sm:inline">{t("תפריט", "Menu")}</span></button>
        </div>
      </div>
      {menuOpen && <div id="site-navigation-menu" className="absolute inset-x-0 top-full max-h-[calc(100vh-4.5rem)] overflow-y-auto border-y border-border bg-white shadow-xl" dir={language === "en" ? "ltr" : "rtl"}>
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-6 md:grid-cols-3">
          <section><h2 className="mb-2 flex items-center gap-2 font-black"><Sparkles className="h-5 w-5 text-rose" />{t("כלים להורים", "Tools for parents")}</h2><div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-1">{parentLinks.map(([href, he, en]) => <Link key={href} to={href} className={cn(sectionLink, active(href) && "bg-secondary text-foreground")}>{t(he, en)}</Link>)}</div></section>
          <section><h2 className="mb-2 flex items-center gap-2 font-black"><BriefcaseBusiness className="h-5 w-5 text-primary" />{t("כלים למטפלים", "Tools for therapists")}</h2><div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-1">{therapistLinks.map(([href, he, en]) => <Link key={href} to={href} className={cn(sectionLink, active(href) && "bg-sage/25 text-foreground")}>{t(he, en)}</Link>)}</div></section>
          <section><h2 className="mb-2 font-black">{t("החשבון והאתר", "Account and website")}</h2><div className="grid gap-1"><Link to={signedIn ? "/profile" : "/auth?mode=login"} className={sectionLink}>{signedIn ? t("החשבון שלי", "My account") : t("כניסה או הרשמה", "Sign in or register")}</Link><Link to="/favorites" className={sectionLink}>{t("המועדפים שלי", "My favourites")}</Link><Link to="/about" className={sectionLink}>{t("אודות ויצירת קשר", "About and contact")}</Link><Link to="/privacy" className={sectionLink}>{t("מדיניות פרטיות", "Privacy Policy")}</Link><Link to="/terms" className={sectionLink}>{t("תנאי שימוש", "Terms of Use")}</Link><button type="button" className={cn(sectionLink, "text-start sm:hidden")} onClick={() => changeLanguage(language === "he" ? "en" : "he")}>{language === "he" ? "English" : "עברית"}</button></div></section>
        </div>
      </div>}
    </header>}
    <main className={fullScreen ? "min-h-screen w-full px-4 py-5 md:px-10 md:py-8" : "mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-10"}>{children}</main>
    {!fullScreen && <SiteFooter />}
    <AccessibilityWidget />
    {!fullScreen && <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-cream/95 backdrop-blur md:hidden print:hidden" aria-label={t("ניווט מהיר", "Quick navigation")}><div className="mx-auto grid max-w-lg grid-cols-4 px-2 py-2">
      {[["/", t("בית", "Home"), Home], [contextualAll, t("פעילויות", "Activities"), LayoutGrid], ["/favorites", t("מועדפים", "Favorites"), Heart]].map(([href, label, Icon]) => <Link key={href} to={href} className={cn("flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold", active(href) ? "text-primary" : "text-muted-foreground")}><Icon className="h-5 w-5" />{label}</Link>)}
      <button type="button" onClick={() => setMenuOpen((value) => !value)} className={cn("flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold", menuOpen ? "text-primary" : "text-muted-foreground")}><Menu className="h-5 w-5" />{t("תפריט", "Menu")}</button>
    </div></nav>}
  </div>;
}
