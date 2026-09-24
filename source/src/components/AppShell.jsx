import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Accessibility,
  Contrast,
  Cookie,
  Heart,
  House,
  Info,
  LayoutGrid,
  Mail,
  Menu,
  RotateCcw,
  Type,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isCloudSignedIn } from "@/lib/cloud-auth";
import { brandLogo, useTranslator } from "@/lib/language";

// תפריט האתר: שלוש קבוצות קישורים וקבוצת "החשבון והאתר".
const MENU_GROUPS = [
  {
    className: "menu-parents",
    title: ["הורים", "Parents"],
    links: [
      ["/parent/play", "במה נשחק היום?", "What should we play today?"],
      ["/parent/all", "כל הפעילויות", "All activities"],
    ],
  },
  {
    className: "menu-therapists",
    title: ["מטפלים", "Therapists"],
    links: [
      ["/therapist/build?tab=search", "בניית מפגש טיפולי", "Build a therapy session"],
      ["/therapist/diary", "יומן מטפל", "Therapist calendar"],
      ["/therapist/plans", "התכניות השמורות שלי", "Saved Plans"],
      ["/therapist/motor-trail", "מסלול מוטורי", "Obstacle course"],
    ],
  },
  {
    className: "menu-more-tools",
    title: ["כלים נוספים", "More tools"],
    links: [
      ["/parent/daily-routine/", "לוח התארגנות יומי", "Daily routine board"],
      ["/parent/morning-routine", "לוח התארגנות בוקר", "Morning routine board"],
      ["/parent/evening-routine", "לוח התארגנות ערב", "Evening routine board"],
      ["/parent/weekly-board", "לוח התארגנות שבועי", "Weekly routine board"],
      ["/parent/social-stories", "סיפורים חברתיים", "Social stories"],
      ["/parent/hebrew-calendar", "יצירת לוח שנה", "Create a calendar"],
      ["/parent/recipes", "מתכונים", "Kid-Friendly Recipes"],
      ["/parent/experiments", "ניסויים", "Kids’ Science Experiments"],
      ["/parent/board-games", "משחקי קופסה", "Board games"],
    ],
  },
];

// עמודים שאינם חלק מאפליקציית React ונטענים בטעינה מלאה.
const isStandalonePage = (href) => /^\/(en\/)?(parent|child|therapist)\/(daily-routine|routine-boards|daily-sequences|school-holidays|card-games-generator|my-patients|board|tools)\/$/.test(href);

const MENU_LINK = "rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-muted hover:text-foreground";
const HOME_PATHS = new Set(["/", "/parent", "/therapist"]);

// אזור המטפלות: כל עמודי /therapist, וגם פעילות או משחק שנפתחו מתוך אזור המטפלות.
export function isTherapistArea(location) {
  if (location.pathname.startsWith("/therapist/")) return true;
  if (!location.pathname.startsWith("/activity/") && !location.pathname.startsWith("/board-game/")) return false;
  const params = new URLSearchParams(location.search);
  return params.get("mode") === "therapist" || (params.get("returnPath") || "").startsWith("/therapist/");
}

function NavLink({ to, className, children, ...rest }) {
  if (isStandalonePage(to)) return <a href={to} className={className} {...rest}>{children}</a>;
  return <Link to={to} className={className} {...rest}>{children}</Link>;
}

export function AppShell({ mode = "parent", children, pageClassName, fullScreen = false }) {
  const location = useLocation();
  const headerRef = useRef(null);
  const [signedIn, setSignedIn] = useState(() => isCloudSignedIn());
  const [menuOpen, setMenuOpen] = useState(false);
  const { language, changeLanguage, t } = useTranslator();
  const therapistArea = isTherapistArea(location);
  const path = location.pathname.replace(/\/$/, "") || "/";

  useEffect(() => {
    const onChange = () => setSignedIn(isCloudSignedIn());
    window.addEventListener("pp_auth_change", onChange);
    return () => window.removeEventListener("pp_auth_change", onChange);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // בפלאפון התפריט נפתח מתחת לכותרת, לכן שומרים את גובה הכותרת במשתנה CSS.
  useEffect(() => {
    if (!menuOpen || !headerRef.current) return;
    const menu = document.getElementById("site-navigation-menu");
    menu?.style.setProperty("--mobile-menu-top", `${headerRef.current.getBoundingClientRect().bottom}px`);
  }, [menuOpen]);

  useEffect(() => {
    const isHome = HOME_PATHS.has(path);
    document.body.classList.toggle("home-return-top", isHome);
    document.body.classList.toggle("therapist-area-mobile-nav-ready", therapistArea && !fullScreen);
    return () => document.body.classList.remove("therapist-area-mobile-nav-ready");
  }, [path, therapistArea, fullScreen]);

  const isActive = (href) => location.pathname === href || (href !== "/" && location.pathname.startsWith(`${href}/`));
  const allActivitiesPath = mode === "therapist" ? "/therapist/all" : "/parent/all";
  const accountPath = signedIn ? "/profile" : "/auth?mode=login";
  const switchLanguage = () => changeLanguage(language === "he" ? "en" : "he");
  const languageLabel = language === "en" ? "עברית" : "English";

  const params = new URLSearchParams(location.search);
  const patientBoard = params.get("patientBoard");
  const patientSuffix = patientBoard ? `&patientBoard=${encodeURIComponent(patientBoard)}&cloudBoardReady=1` : "";

  const headerLinks = therapistArea
    ? [
        ["/", t("בית", "Home")],
        ["/therapist/build?view=session", t("לוח מובנה", "Session board")],
        ["/therapist/diary", t("יומן", "Diary")],
        ["/therapist/build?tab=search", t("מנוע חיפוש", "Search")],
        ["/therapist/my-patients/", t("המטופלים שלי", "My clients")],
        ["/favorites", t("מועדפים", "Favorites")],
        ["/about", t("אודות", "About")],
      ]
    : [
        ["/", t("בית", "Home")],
        ["/parent/play", t("להורים", "Parents")],
        // בעמודי ההורים לא מציגים את הקישור למטפלים.
        ...(location.pathname.startsWith("/parent") ? [] : [["/therapist/build?view=session", t("למטפלים", "Therapists")]]),
        [allActivitiesPath, t("כל הפעילויות", "All activities")],
        ["/favorites", t("מועדפים", "Favorites")],
        ["/about", t("אודות", "About")],
      ];

  return (
    <div className={cn("min-h-screen bg-background", pageClassName)}>
      <div className="global-print-brand hidden print:block" aria-hidden>
        <img src={brandLogo(language)} alt="" />
      </div>

      {!fullScreen && (
        <header ref={headerRef} className="sticky top-0 z-50 border-b border-border/70 bg-cream/95 backdrop-blur print:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5">
            <Link to="/" className="shrink-0">
              <img src={brandLogo(language)} alt={t("בואו נשחק", "Let's Play")} className="h-11 w-auto max-w-[130px] object-contain md:h-14 md:max-w-[155px]" />
            </Link>
            <nav className="hidden min-w-0 items-center justify-center gap-1 lg:flex" aria-label={t("ניווט ראשי", "Main navigation")}>
              {headerLinks.map(([href, label]) => {
                const [hrefPath, hrefQuery] = href.split("?");
                const active = hrefQuery ? location.pathname === hrefPath && location.search.includes(hrefQuery) : isActive(hrefPath);
                return (
                  <NavLink
                    key={`${href}-${label}`}
                    to={href}
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition",
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {label}
                  </NavLink>
                );
              })}
            </nav>
            <div className="flex shrink-0 items-center gap-2">
              <div className="hidden rounded-full border bg-white p-0.5 sm:flex" aria-label={t("בחירת שפה", "Choose language")}>
                <button type="button" className={cn("rounded-full px-2 py-1 text-xs", language === "he" ? "bg-foreground text-background" : "text-muted-foreground")} onClick={() => changeLanguage("he")}>
                  עברית
                </button>
                <button type="button" className={cn("rounded-full px-2 py-1 text-xs", language === "en" ? "bg-foreground text-background" : "text-muted-foreground")} onClick={() => changeLanguage("en")}>
                  English
                </button>
              </div>
              <button type="button" className="language-switch-compact sm:hidden" onClick={switchLanguage} aria-label={language === "en" ? "מעבר לעברית" : "Switch to English"}>
                <GlobeIcon />
                <span>{languageLabel}</span>
              </button>
              <Link to={accountPath} className="hidden items-center gap-1.5 rounded-full bg-sage px-3.5 py-2 text-sm font-bold text-sage-foreground md:flex">
                <UserRound className="h-4 w-4" />
                {signedIn ? t("החשבון שלי", "My account") : t("כניסה", "Sign in")}
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-controls="site-navigation-menu"
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm font-bold shadow-sm"
              >
                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="hidden sm:inline">{t("תפריט", "Menu")}</span>
              </button>
            </div>
          </div>

          {menuOpen && (
            <div id="site-navigation-menu" className="absolute inset-x-0 top-full max-h-[calc(100vh-4.5rem)] overflow-y-auto border-y border-border bg-white shadow-xl" dir={language === "en" ? "ltr" : "rtl"}>
              <div className="language-switch-menu-row">
                <button type="button" className="language-switch-menu" onClick={switchLanguage} aria-label={language === "en" ? "מעבר לעברית" : "Switch to English"}>
                  <GlobeIcon />
                  <span>{languageLabel}</span>
                </button>
              </div>
              <div className="mx-auto grid max-w-6xl gap-6 px-5 py-6 md:grid-cols-3">
                <div className="unified-menu-sections md:col-span-2">
                  {MENU_GROUPS.map((group) => (
                    <section key={group.className} className={group.className}>
                      <h2>{t(...group.title)}</h2>
                      <div className="unified-menu-links">
                        {group.links.map(([href, he, en]) => (
                          <NavLink key={href} to={href}>{t(he, en)}</NavLink>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
                <section className="menu-account-section">
                  <h2 className="mb-2 font-black">{t("החשבון והאתר", "Account and website")}</h2>
                  <div className="grid gap-1">
                    <Link to={accountPath} className={MENU_LINK}>{signedIn ? t("החשבון שלי", "My account") : t("כניסה או הרשמה", "Sign in or register")}</Link>
                    <Link to="/favorites" className={MENU_LINK}>{t("המועדפים שלי", "My favorites")}</Link>
                    <Link to="/about" className={MENU_LINK}>{t("אודות ויצירת קשר", "About and contact")}</Link>
                    <Link to="/privacy" className={MENU_LINK}>{t("מדיניות פרטיות", "Privacy Policy")}</Link>
                    <Link to="/terms" className={MENU_LINK}>{t("תנאי שימוש", "Terms of Use")}</Link>
                  </div>
                </section>
              </div>
            </div>
          )}
        </header>
      )}

      <main className={fullScreen ? "min-h-screen w-full px-4 py-5 md:px-10 md:py-8" : "mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-10"}>{children}</main>

      {!fullScreen && <SiteFooter />}
      <div className="global-print-legal" dir="rtl">
        © בואו נשחק. כל הזכויות שמורות. התכנים נועדו להעשרה ולתרגול בלבד ואינם מהווים אבחון, המלצה טיפולית אישית או תחליף להערכה, לייעוץ או לטיפול של איש מקצוע מוסמך.
      </div>
      <AccessibilityMenu />

      {!fullScreen && !therapistArea && (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-cream/95 backdrop-blur md:hidden print:hidden" aria-label={t("ניווט מהיר", "Quick navigation")}>
          <div className="mx-auto grid max-w-lg grid-cols-5 px-2 py-2">
            {[
              ["/", t("בית", "Home"), House],
              [allActivitiesPath, t("פעילויות", "Activities"), LayoutGrid],
              ["/favorites", t("מועדפים", "Favorites"), Heart],
              ["/about", t("אודות", "About"), Info],
            ].map(([href, label, Icon]) => (
              <Link
                key={href}
                to={href}
                className={cn("flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold", isActive(href) ? "text-primary" : "text-muted-foreground")}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={cn("flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold", menuOpen ? "text-primary" : "text-muted-foreground")}
            >
              <Menu className="h-5 w-5" />
              {t("תפריט", "Menu")}
            </button>
          </div>
        </nav>
      )}

      {!fullScreen && therapistArea && (
        <TherapistWorkflowNav
          path={path}
          view={params.get("view")}
          patientSuffix={patientSuffix}
          onMenu={() => setMenuOpen((open) => !open)}
        />
      )}
    </div>
  );
}

// ניווט תחתון באזור המטפלות (פלאפון וטאבלט).
function TherapistWorkflowNav({ path, view, patientSuffix, onMenu }) {
  const { t } = useTranslator();
  const active = path === "/therapist/my-patients" ? "patients"
    : path === "/therapist/diary" ? "diary"
    : path === "/therapist/build" && view === "session" ? "board"
    : path === "/therapist/build" ? "search"
    : "";
  const links = [
    ["search", `/therapist/build?tab=search&boardMode=1${patientSuffix}`, t("מנוע חיפוש", "Search"), <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>],
    ["board", `/therapist/build?view=session${patientSuffix}`, t("לוח המפגש", "Session board"), <><rect x="4" y="3" width="16" height="18" rx="3" /><path d="M8 8h8M8 12h8M8 16h5" /></>],
    ["patients", "/therapist/my-patients/", t("המטופלים שלי", "My clients"), <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3.5 20c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M14 15c3.7-.7 5.8 1 6.5 4" /></>],
    ["diary", "/therapist/diary", t("יומן", "Diary"), <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4M17 3v4M3 10h18M8 14h3M13 14h3M8 17h3" /></>],
  ];
  return (
    <nav className="therapist-mobile-workflow-nav print:hidden" aria-label={t("ניווט מהיר באזור המטפלות", "Quick therapist navigation")}>
      <div className="therapist-mobile-workflow-nav__inner">
        {links.map(([key, href, label, icon]) => (
          <NavLink key={key} to={href} aria-current={active === key ? "page" : undefined}>
            <svg aria-hidden="true" viewBox="0 0 24 24">{icon}</svg>
            <strong>{label}</strong>
          </NavLink>
        ))}
        <button type="button" onClick={onMenu}>
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          <strong>{t("תפריט", "Menu")}</strong>
        </button>
      </div>
    </nav>
  );
}

function GlobeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "1em", height: "1em", flex: "none" }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
    </svg>
  );
}

function SiteFooter() {
  const { language, t } = useTranslator();
  return (
    <footer className="border-t border-border/70 bg-white/75 print:hidden" dir={language === "en" ? "ltr" : "rtl"}>
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 sm:grid-cols-[1fr_auto] sm:items-center">
        <div className="flex items-center gap-3">
          <img src={brandLogo(language)} alt="" className="h-12 w-auto" />
          <div>
            <p className="font-bold">{t("בואו נשחק", "Let's Play")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("רעיונות וכלים להורים ולמטפלים", "Ideas and tools for parents and therapists")}</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-3 text-sm font-semibold text-muted-foreground" aria-label={t("מידע משפטי", "Legal information")}>
          <Link className="hover:text-foreground" to="/about">{t("אודות", "About")}</Link>
          <Link className="hover:text-foreground" to="/privacy">{t("מדיניות פרטיות", "Privacy Policy")}</Link>
          <Link className="hover:text-foreground" to="/terms">{t("תנאי שימוש", "Terms of Use")}</Link>
          <Link className="hover:text-foreground" to="/cookies">{t("מדיניות Cookies", "Cookie Policy")}</Link>
          <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => window.dispatchEvent(new Event("boo_open_cookie_preferences"))}>
            <Cookie className="h-4 w-4" />
            {t("העדפות Cookies", "Cookie preferences")}
          </button>
          <a className="inline-flex items-center gap-1 hover:text-foreground" href="mailto:sigalsplay@gmail.com">
            <Mail className="h-4 w-4" />
            {t("יצירת קשר", "Contact")}
          </a>
        </nav>
      </div>
      <div className="border-t border-border/50 px-5 py-3 text-center text-xs text-muted-foreground">
        © 2026 {t("בואו נשחק. כל הזכויות שמורות.", "Let's Play. All rights reserved.")}
      </div>
    </footer>
  );
}

function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  function toggleLargeText() {
    const next = !largeText;
    setLargeText(next);
    document.documentElement.classList.toggle("accessibility-large-text", next);
  }
  function toggleHighContrast() {
    const next = !highContrast;
    setHighContrast(next);
    document.documentElement.classList.toggle("accessibility-high-contrast", next);
  }
  function reset() {
    setLargeText(false);
    setHighContrast(false);
    document.documentElement.classList.remove("accessibility-large-text", "accessibility-high-contrast");
  }

  return (
    <div className="accessibility-button fixed bottom-24 left-3 z-[70] md:bottom-5 print:hidden" dir="rtl">
      {open && (
        <div className="mb-2 grid min-w-48 gap-1 rounded-2xl border bg-white p-2 shadow-xl">
          <button type="button" onClick={toggleLargeText} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold hover:bg-muted">
            <Type className="h-4 w-4" /> טקסט גדול
          </button>
          <button type="button" onClick={toggleHighContrast} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold hover:bg-muted">
            <Contrast className="h-4 w-4" /> ניגודיות גבוהה
          </button>
          <button type="button" onClick={reset} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold hover:bg-muted">
            <RotateCcw className="h-4 w-4" /> איפוס נגישות
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="אפשרויות נגישות"
        aria-expanded={open}
        className="grid h-12 w-12 place-items-center rounded-full border-2 border-primary bg-white text-primary-foreground shadow-lg"
      >
        <Accessibility className="h-6 w-6" />
      </button>
    </div>
  );
}
