import { useEffect, useState } from "react";
import { Accessibility, Eye, Link2, Minus, PauseCircle, Plus, RotateCcw, X } from "lucide-react";
import { useTranslator } from "@/lib/language";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "letsplayot_accessibility";
const DEFAULTS = { textSize: 0, highContrast: false, underlineLinks: false, reduceMotion: false };

function readSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return DEFAULTS; }
}

function applySettings(settings) {
  const root = document.documentElement;
  root.classList.toggle("a11y-text-large", settings.textSize === 1);
  root.classList.toggle("a11y-text-larger", settings.textSize === 2);
  root.classList.toggle("a11y-high-contrast", settings.highContrast);
  root.classList.toggle("a11y-underline-links", settings.underlineLinks);
  root.classList.toggle("a11y-reduce-motion", settings.reduceMotion);
}

export function AccessibilityWidget() {
  const { t, language } = useTranslator();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState(readSettings);

  useEffect(() => {
    applySettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  const toggle = (key) => setSettings((current) => ({ ...current, [key]: !current[key] }));
  const optionClass = (active) => cn(
    "flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-2 text-start text-sm font-bold transition",
    active ? "border-primary bg-sage/30" : "border-border bg-background hover:bg-muted",
  );

  return (
    <div className="accessibility-widget print:hidden" dir={language === "en" ? "ltr" : "rtl"}>
      {open && (
        <section className="accessibility-panel" role="dialog" aria-modal="false" aria-label={t("אפשרויות נגישות", "Accessibility options")}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-display text-lg font-black"><Accessibility className="h-5 w-5" />{t("אפשרויות נגישות", "Accessibility options")}</h2>
            <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted" aria-label={t("סגירה", "Close")}><X className="h-5 w-5" /></button>
          </div>

          <div className="mb-2 grid grid-cols-2 gap-2">
            <button type="button" className={optionClass(false)} onClick={() => setSettings((current) => ({ ...current, textSize: Math.min(2, current.textSize + 1) }))}><Plus className="h-5 w-5" />{t("הגדלת טקסט", "Larger text")}</button>
            <button type="button" className={optionClass(false)} onClick={() => setSettings((current) => ({ ...current, textSize: Math.max(0, current.textSize - 1) }))}><Minus className="h-5 w-5" />{t("הקטנת טקסט", "Smaller text")}</button>
          </div>
          <div className="space-y-2">
            <button type="button" aria-pressed={settings.highContrast} className={optionClass(settings.highContrast)} onClick={() => toggle("highContrast")}><Eye className="h-5 w-5" />{t("ניגודיות גבוהה", "High contrast")}</button>
            <button type="button" aria-pressed={settings.underlineLinks} className={optionClass(settings.underlineLinks)} onClick={() => toggle("underlineLinks")}><Link2 className="h-5 w-5" />{t("הדגשת קישורים", "Highlight links")}</button>
            <button type="button" aria-pressed={settings.reduceMotion} className={optionClass(settings.reduceMotion)} onClick={() => toggle("reduceMotion")}><PauseCircle className="h-5 w-5" />{t("עצירת אנימציות", "Reduce motion")}</button>
            <button type="button" className={optionClass(false)} onClick={() => setSettings(DEFAULTS)}><RotateCcw className="h-5 w-5" />{t("איפוס הגדרות", "Reset settings")}</button>
          </div>
        </section>
      )}
      <button type="button" className="accessibility-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={t("פתיחת אפשרויות נגישות", "Open accessibility options")} title={t("נגישות", "Accessibility")}>
        <Accessibility className="h-7 w-7" />
      </button>
    </div>
  );
}
