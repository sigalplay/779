import { Link, useLocation } from "react-router-dom";
import { Home, Heart, LayoutGrid, Info, BriefcaseBusiness, ChevronDown, Search, FolderOpen, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { isCloudSignedIn } from "@/lib/cloud-auth";
import { brandLogo, useTranslator } from "@/lib/language";

export function AppShell({ mode, children, pageClassName, fullScreen = false }) {
  const location = useLocation();
  const [signedIn, setSignedIn] = useState(false);
  const [treatmentMenuOpen, setTreatmentMenuOpen] = useState(false);
  const { language, changeLanguage, t } = useTranslator();

  useEffect(() => {
    setSignedIn(isCloudSignedIn());
    const onChange = () => setSignedIn(isCloudSignedIn());
    window.addEventListener("pp_auth_change", onChange);
    return () => window.removeEventListener("pp_auth_change", onChange);
  }, []);

  useEffect(() => {
    setTreatmentMenuOpen(false);
  }, [location.pathname, location.search]);

  const treatmentItems = [
    { href: "/therapist/build?tab=search", label: t("מנוע חיפוש", "Activity search"), icon: Search },
    { href: "/therapist/plans", label: t("התוכניות השמורות שלי", "My saved plans"), icon: FolderOpen },
  ];

  const items = [
    ...(mode === "therapist" ? [] : [{ href: "/", label: t("בית", "Home"), icon: Home }]),
    ...(mode === "therapist" ? [{ href: "/therapist/diary", label: t("יומן מטפל", "Therapist diary"), icon: CalendarDays }] : []),
    {
      href: mode === "therapist" ? "/therapist/all" : "/parent/all",
      label: t("כל הפעילויות", "All activities"),
      icon: LayoutGrid,
    },
    { href: "/favorites", label: t("מועדפים", "Favorites"), icon: Heart },
  ];

  const mobileItems = [
    ...items,
    { href: "/about", label: t("אודות", "About"), icon: Info },
  ];

  return (
    <div className={cn("min-h-screen bg-background", pageClassName)}>
      <div className="global-print-brand hidden print:block" aria-hidden>
        <img src={brandLogo(language)} alt="" />
      </div>
      {!fullScreen && <header className="sticky top-0 z-40 border-b border-border/60 bg-cream/80 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Link
              to="/about"
              className={cn(
                "hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors md:flex",
                location.pathname === "/about"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Info className="h-4 w-4" />
              {t("אודות", "About")}
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <img src={brandLogo(language)} alt={t("בואו נשחק", "Let's Play")} title={t("בואו נשחק", "Let's Play")} className="h-12 w-auto max-w-[150px] object-contain md:h-14 md:max-w-[180px]" />
            </Link>
          </div>
          <nav className="hidden gap-1 md:flex">
            {mode === "therapist" && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setTreatmentMenuOpen((open) => !open)}
                  aria-expanded={treatmentMenuOpen}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    location.pathname.startsWith("/therapist/build") || location.pathname.startsWith("/therapist/plans")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <BriefcaseBusiness className="h-4 w-4" />
                  {t("תכנית טיפול", "Treatment plan")}
                  <ChevronDown className={cn("h-4 w-4 transition-transform", treatmentMenuOpen && "rotate-180")} />
                </button>
                {treatmentMenuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 min-w-56 rounded-2xl border border-border/70 bg-white p-2 shadow-lg">
                    {treatmentItems.map((item) => (
                      <Link key={item.label} to={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted">
                        <item.icon className="h-4 w-4 text-muted-foreground" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            {items.map((it) => {
              const active = location.pathname === it.href;
              return (
                <Link
                  key={it.label}
                  to={it.href}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <it.icon className="h-4 w-4" />
                  {it.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex rounded-full border bg-white/70 p-0.5" aria-label={t("בחירת שפה", "Choose language")}>
              <button className={`rounded-full px-2 py-1 text-xs ${language === "he" ? "bg-foreground text-background" : "text-muted-foreground"}`} onClick={() => changeLanguage("he")}>עברית</button>
              <button className={`rounded-full px-2 py-1 text-xs ${language === "en" ? "bg-foreground text-background" : "text-muted-foreground"}`} onClick={() => changeLanguage("en")}>English</button>
            </div>
            <div className="hidden md:block">
            {signedIn ? (
              <Link to="/profile" className="rounded-full px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                {t("החשבון שלי", "My account")}
              </Link>
            ) : (
              <Link to="/auth" className="rounded-full bg-sage px-4 py-2 text-sage-foreground hover:opacity-90">
                {t("כניסה", "Sign in")}
              </Link>
            )}
            </div>
          </div>
        </div>
      </header>}

      <main className={fullScreen ? "min-h-screen w-full px-4 py-5 md:px-10 md:py-8" : "mx-auto max-w-6xl px-4 pb-24 pt-6 md:pb-10"}>{children}</main>

      {!fullScreen && <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-cream/95 backdrop-blur md:hidden print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-around px-2 py-2">
          {mode === "therapist" && (
            <div className="relative flex flex-1 justify-center">
              <button type="button" onClick={() => setTreatmentMenuOpen((open) => !open)} aria-expanded={treatmentMenuOpen} className="flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium text-muted-foreground">
                <BriefcaseBusiness className="h-5 w-5" />
                {t("תכנית טיפול", "Treatment plan")}
              </button>
              {treatmentMenuOpen && (
                <div className="absolute bottom-full right-0 z-50 mb-3 min-w-56 rounded-2xl border border-border/70 bg-white p-2 shadow-lg">
                  {treatmentItems.map((item) => (
                    <Link key={item.label} to={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground hover:bg-muted">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
          {mobileItems.map((it) => {
            const active = location.pathname === it.href;
            return (
              <Link
                key={it.label}
                to={it.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <it.icon className="h-5 w-5" />
                {it.label}
              </Link>
            );
          })}
        </div>
      </nav>}
    </div>
  );
}
