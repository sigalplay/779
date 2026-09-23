import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Share2, Printer, Clock, Layers, RotateCcw, Download, Info, ArrowRight, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { getActivity, toggleFavorite, logView, isSignedIn, isFavorite } from "@/lib/storage";
import { activityEmoji } from "@/lib/activity-emoji";
import { getActivityDurationLabel } from "@/lib/activity-duration";
import { ACTIVITY_ICON_SETS, activityHero } from "@/lib/activity-icons";
import { libMaterialIcon, libStepIcon } from "@/lib/icon-library";
import { bankMaterialIcon, bankStepIcon } from "@/lib/icon-bank";
import { TagList } from "@/components/TagList";
import { TherapistPostureScissorsTips } from "@/components/TherapistPostureScissorsTips";
import { VisualSessionTimer } from "@/components/VisualSessionTimer";
import { brandLogo, useTranslator } from "@/lib/language";
import { activityTitle, translatedTerm } from "@/lib/content-translations";
import { activityEnglishContent } from "@/lib/activity-content-en";

const NIKUD_KEY = "activity:nikud";
const HANDWRITING_KEY = "activity:handwriting";

function useToggleSetting(storageKey) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    try {
      setOn(window.localStorage.getItem(storageKey) === "1");
    } catch {
      /* ignore */
    }
  }, [storageKey]);
  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(storageKey, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [storageKey]);
  return { on, toggle };
}

function useNikud() {
  return useToggleSetting(NIKUD_KEY);
}

function useHandwriting() {
  return useToggleSetting(HANDWRITING_KEY);
}

function useStepChecklist(activityId, total) {
  const key = `steps:${activityId}`;
  const [checked, setChecked] = useState(() => new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      setChecked(new Set(Array.isArray(arr) ? arr : []));
    } catch {
      setChecked(new Set());
    }
  }, [key]);

  const toggle = useCallback(
    (n) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(n)) next.delete(n);
        else next.add(n);
        try {
          window.localStorage.setItem(key, JSON.stringify([...next]));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key],
  );

  const reset = useCallback(() => {
    setChecked(new Set());
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }, [key]);

  return { checked, toggle, reset, done: checked.size, total };
}

function useMaterialsChecklist(activityId) {
  const key = `materials:${activityId}`;
  const [checked, setChecked] = useState(() => new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      setChecked(new Set(Array.isArray(arr) ? arr : []));
    } catch {
      setChecked(new Set());
    }
  }, [key]);

  const toggle = useCallback(
    (n) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(n)) next.delete(n);
        else next.add(n);
        try {
          window.localStorage.setItem(key, JSON.stringify(Array.from(next)));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key],
  );

  return { checked, toggle };
}

export default function ActivityDetail() {
  const { language, t } = useTranslator();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "parent" ? "parent" : "therapist";
  const returnTo = searchParams.get("returnTo"); // "session" when opened from the treatment session board
  const requestedReturnPath = searchParams.get("returnPath");
  const returnPath = requestedReturnPath?.startsWith("/") && !requestedReturnPath.startsWith("//")
    ? requestedReturnPath
    : mode === "parent" ? "/parent/play" : "/therapist/build";
  const returnLabel = searchParams.get("returnLabel") || (mode === "parent" ? t("חזרה לפעילויות", "Back to activities") : t("חזרה לתכנון המפגש", "Back to session planning"));

  const [activity, setActivity] = useState(undefined);
  const [saved, setSaved] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const nikud = useNikud();
  const handwriting = useHandwriting();
  const pick = (t, tn) => (nikud.on && tn ? tn : t);
  const hwClass = handwriting.on ? "font-handwriting" : "";

  useEffect(() => {
    const a = getActivity(id);
    setActivity(a);
    if (a) setSaved(isFavorite(a.id));
    if (a && isSignedIn()) logView(a.id);
  }, [id]);

  function handleFav() {
    if (!isSignedIn()) {
      toast.error(t("צריך להתחבר כדי לשמור למועדפים", "Please sign in to save favourites"));
      return;
    }
    const res = toggleFavorite(id);
    setSaved(res.favored);
    toast.success(res.favored ? t("נשמר למועדפים", "Saved to favourites") : t("הוסר מהמועדפים", "Removed from favourites"));
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: activity?.title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success(t("קישור הועתק", "Link copied"));
    }
  }

  if (activity === undefined) {
    return (
      <AppShell mode={mode}>
        <div className="p-10 text-center text-muted-foreground">{t("טוען...", "Loading...")}</div>
      </AppShell>
    );
  }
  if (!activity) {
    return (
      <AppShell mode={mode}>
        <div className="py-20 text-center text-muted-foreground">
          {t("הפעילות לא נמצאה.", "Activity not found.")}
          <div className="mt-4">
            <Link to="/" className="text-primary underline">
              {t("חזרה לדף הבית", "Back to home")}
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const a = activity;
  const en = language === "en" ? activityEnglishContent(a) : null;
  const title = activityTitle(a, language);
  const description = en?.description || pick(a.description || a.short_description, a.descriptionN || a.short_descriptionN);
  const materials = en?.materials || a.materials || [];
  const steps = a.steps?.map((step, index) => ({ ...step, displayText: en?.steps?.[index] || pick(step.text, step.textN), displayTooltip: en?.stepTooltips?.[index] || step.tooltip, displayDownloadLabel: en?.downloadLabels?.[index] || step.download?.label })) || [];
  const preparation = en?.preparation || pick(a.preparation, a.preparationN);
  const flowText = en?.flow_text || pick(a.flow_text, a.flow_textN);
  const adaptations = en?.adaptations || pick(a.adaptations, a.adaptationsN);
  const extensions = en?.extensions || pick(a.extensions, a.extensionsN);

  return (
    <AppShell mode={mode}>
      {language === "he" ? <TherapistPostureScissorsTips>
        <VisualSessionTimer roundTrigger />
      </TherapistPostureScissorsTips> : null}
      <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`space-y-6 ${hwClass}`}>
        {returnTo === "session" && (
          <Link
            to={returnPath === "/therapist/build" ? "/therapist/build?view=session" : returnPath}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2.5 text-base font-bold text-foreground shadow-sm transition-colors hover:bg-sage/10 print:hidden"
          >
            <ArrowRight className="h-5 w-5" /> {t("חזרה למפגש", "Back to session")}
          </Link>
        )}
        {returnTo !== "session" && (
          <Link
            to={returnPath}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2.5 text-base font-bold text-foreground shadow-sm transition-colors hover:bg-sage/10 print:hidden"
          >
            <ArrowRight className="h-5 w-5" /> {returnLabel}
          </Link>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex h-56 items-center justify-center overflow-hidden rounded-3xl border border-border/40 bg-gradient-to-br from-sage/30 via-sky/30 to-primary/20 md:h-72 print:hidden"
        >
          {activityHero(a.id) || a.hero_image ? (
            <img src={activityHero(a.id) || a.hero_image} alt={t(`איור של הפעילות ${a.title}`, `Illustration for ${title}`)} title={t(`${a.title} — פעילות לילדים מבואו נשחק`, `${title} — a Let's Play activity for children`)} data-seo-name={t(`${a.title} פעילות לילדים`, `${title} activity for children`)} className="max-h-[90%] max-w-[90%] object-contain" />
          ) : (
            (() => {
              const GenericIcon = libMaterialIcon("דף");
              return GenericIcon ? <GenericIcon className="h-28 w-28 md:h-36 md:w-36" /> : null;
            })()
          )}
        </motion.div>

        <header className="rounded-3xl bg-gradient-to-br from-sage/20 to-sky/30 p-6 md:p-8 print:hidden">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              {a.categories?.length > 0 && <div className="text-sm text-muted-foreground print:hidden">{a.categories.map((item) => translatedTerm(item, language)).join(" · ")}</div>}
              <h1 className="mt-1 font-display text-3xl font-black md:text-4xl">{title}</h1>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button onClick={handleFav} variant="outline" size="icon" className="h-11 w-11 rounded-full">
                <Heart className={`h-5 w-5 ${saved ? "fill-current text-primary" : ""}`} />
              </Button>
              <Button onClick={share} variant="outline" size="icon" className="h-11 w-11 rounded-full">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button onClick={() => window.print()} variant="outline" size="icon" className="h-11 w-11 rounded-full">
                <Printer className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Pill>
              {t("גיל", "Ages")} {a.age_min}–{a.age_max}
            </Pill>
            <Pill>
              <Clock className="h-3.5 w-3.5" /> {language === "en" ? `${a.duration_min} minutes` : getActivityDurationLabel(a)}
            </Pill>
            <span className="inline-flex items-center gap-1 rounded-full bg-warm px-3 py-1 text-foreground/80">
              <Layers className="h-3.5 w-3.5" /> {language === "en" ? (a.difficulty === "easy" ? "Easy" : a.difficulty === "medium" ? "Moderate" : "Advanced") : (a.difficulty === "easy" ? "קל" : a.difficulty === "medium" ? "בינוני" : "מתקדם")}
            </span>
            {language === "he" ? <button
              type="button"
              onClick={nikud.toggle}
              aria-pressed={nikud.on}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold transition-colors print:hidden ${
                nikud.on ? "bg-sage text-sage-foreground" : "bg-white/80 hover:bg-white"
              }`}
            >
              אָ ניקוד {nikud.on ? "פעיל" : "כבוי"}
            </button> : null}
            {language === "he" ? <button
              type="button"
              onClick={handwriting.toggle}
              aria-pressed={handwriting.on}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold transition-colors print:hidden ${
                handwriting.on ? "bg-sage text-sage-foreground" : "bg-white/80 hover:bg-white"
              }`}
            >
              ✏️ כתב יד {handwriting.on ? "פעיל" : "כבוי"}
            </button> : null}
          </div>
        </header>

        <PrintSheet activity={a} activityId={id} pick={pick} language={language} title={title} description={description} materials={materials} steps={steps} preparation={preparation} flowText={flowText} adaptations={adaptations} extensions={extensions} tips={en?.tips || a.tips} />

        {(a.description || a.short_description) && (
          <section className="rounded-3xl border border-border/60 bg-card p-5 md:p-6 print:hidden">
            <button
              type="button"
              onClick={() => setShowDescription((v) => !v)}
              aria-expanded={showDescription}
              className="flex w-full items-center justify-between gap-2 text-right"
            >
              <h2 className="font-display text-lg font-bold">{t("תיאור המשימה", "Activity description")}</h2>
              <ChevronDown className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${showDescription ? "rotate-180" : ""}`} />
            </button>
            {showDescription && (
              <div className="mt-3 text-base leading-relaxed text-foreground/90 md:text-lg">
                {mode === "therapist" ? (
                  <div className="flex items-start gap-3">
                    <div
                      aria-hidden
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky/40 to-sage/30 text-3xl leading-none"
                    >
                      📝
                    </div>
                    <div className="flex-1">{description}</div>
                  </div>
                ) : (
                  <>{description}</>
                )}
              </div>
            )}
          </section>
        )}

        {a.materials?.length ? (
          <MaterialsChecklist activityId={id} materials={a.materials} displayMaterials={materials} materialsN={a.materialsN} materialImages={a.material_images} pick={pick} hwClass={hwClass} language={language} />
        ) : null}

        {a.attachments?.length ? (
          <Section title={t("קבצים להורדה ולהדפסה", "Downloads and printables")}>
            <div className="flex flex-wrap gap-3">
              {a.attachments.map((att) => (
                <div key={att.file} className="group relative">
                  <a
                    href={att.file}
                    download
                    className="flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-sage/20"
                  >
                    <Download className="h-4 w-4" />
                    {en?.attachmentLabels?.[a.attachments.indexOf(att)] || att.label}
                  </a>
                  <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                    <img
                      src={att.preview || att.file}
                      alt=""
                      className="h-56 w-96 max-w-[85vw] rounded-xl border border-border/60 bg-white object-contain p-2 shadow-xl md:h-72 md:w-[32rem]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        ) : null}

        {a.preparation && (
          <Section title={t("הכנה מוקדמת", "Preparation")}>
            <span className={hwClass}>{preparation}</span>
          </Section>
        )}

        {a.flow_text ? (
          <Section title={t("מהלך הפעילות", "How to play")}>
            {ACTIVITY_ICON_SETS[id]?.flow ? (
              <img
                src={ACTIVITY_ICON_SETS[id].flow}
                alt=""
                className="mx-auto mb-4 h-52 w-full max-w-md rounded-2xl bg-white object-contain md:h-64"
              />
            ) : null}
            <span className={hwClass}>{flowText}</span>
          </Section>
        ) : a.steps?.length ? <StepsChecklist activityId={id} steps={steps} pick={pick} hwClass={hwClass} language={language} /> : null}

        {(en?.tips || a.tips)?.length ? (
          <section className="rounded-3xl border border-sky/50 bg-sky/10 p-5 md:p-6 print:hidden">
            <ul className="space-y-2.5">
              {(en?.tips || a.tips).map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/90">
                  <span aria-hidden className="shrink-0">
                    ⭐
                  </span>
                  <span>
                    {tip.boldPrefix && <strong className="text-blue-600">{tip.boldPrefix} </strong>}
                    {tip.text}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {a.adaptations && (
          <Section title={t("הורדת רמת הקושי", "Make it easier")}>
            <span className={hwClass}>{adaptations}</span>
          </Section>
        )}
        {a.extensions && (
          <Section title={t("העלאת רמת הקושי / שדרוג", "Add a challenge")}>
            <span className={hwClass}>{extensions}</span>
          </Section>
        )}

        {a.goals?.length || a.functions?.length || a.sensory_systems?.length ? (
          <Section title={t("על מה עובד (מבחינה התפתחותית)", "Developmental skills supported")}>
            <div className="space-y-3 print:hidden">
              {a.goals?.length ? <TagList items={a.goals.map((item) => translatedTerm(item, language))} /> : null}
              {a.functions?.length ? <TagList items={a.functions.map((item) => translatedTerm(item, language))} tone="sky" /> : null}
              {a.sensory_systems?.length ? <TagList items={a.sensory_systems.map((item) => translatedTerm(item, language))} tone="sage" /> : null}
            </div>
          </Section>
        ) : null}

        {a.tags?.length ? (
          <div className="print:hidden">
            <button
              type="button"
              onClick={() => setShowTags((v) => !v)}
              className="text-sm font-medium text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
            >
              {showTags ? t("הסתר תגיות", "Hide tags") : t("הצג תגיות", "Show tags")}
            </button>
            {showTags ? (
              <Section title={t("תגיות", "Tags")}>
                <TagList items={a.tags.map((item) => translatedTerm(item, language))} />
              </Section>
            ) : null}
          </div>
        ) : null}
      </motion.article>
    </AppShell>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-5 md:p-6 print:hidden">
      <h2 className="mb-2 font-display text-lg font-bold">{title}</h2>
      <div className="text-base leading-relaxed text-foreground/90 md:text-lg">{children}</div>
    </section>
  );
}
function Pill({ children }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1">{children}</span>;
}

function PrintCellIcon({ src, srcs, Icon, size = "large" }) {
  const imgClass = size === "large" ? "mx-auto h-24 w-24 object-contain" : "mx-auto h-14 w-14 object-contain";
  const iconClass = size === "large" ? "mx-auto h-12 w-12" : "mx-auto h-7 w-7";
  const images = srcs?.length ? srcs : [src].filter(Boolean);
  if (images.length) return <div className="flex flex-wrap items-center justify-center gap-1">{images.map((path) => <img key={path} src={path} alt="" className={images.length > 1 ? (size === "large" ? "h-16 w-16 object-contain" : "h-10 w-10 object-contain") : imgClass} />)}</div>;
  if (Icon) return <Icon className={iconClass} />;
  return null;
}

function PrintSheet({ activity: a, activityId, pick, language, title, description, materials, steps, preparation, flowText, adaptations, extensions, tips }) {
  const customMaterials = ACTIVITY_ICON_SETS[activityId]?.materials;
  const customSteps = ACTIVITY_ICON_SETS[activityId]?.steps;

  const materialCell = (m) => {
    const custom = a.material_images?.[m] || customMaterials?.[m];
    if (typeof custom === "string") return { src: custom };
    if (custom) return { Icon: custom };
    const bank = bankMaterialIcon(m);
    if (bank) return { src: bank };
    const lib = libMaterialIcon(m);
    if (lib) return { Icon: lib };
    return {};
  };

  const stepCell = (s) => {
    const custom = customSteps?.[s.n];
    if (s.images?.length) return { srcs: s.images };
    if (s.image) return { src: s.image };
    if (typeof custom === "string") return { src: custom };
    if (custom) return { Icon: custom };
    const bank = bankStepIcon(s.text);
    if (bank) return { src: bank };
    const lib = libStepIcon(s.text);
    if (lib) return { Icon: lib };
    return {};
  };

  const hero = activityHero(activityId);
  const desc = description;
  const label = (he, en) => language === "en" ? en : he;

  return (
    <div className="activity-print-sheet hidden print:block print:space-y-4 print:text-black">
      <div className="relative flex items-center justify-center gap-5 border-b-2 border-black pb-3">
        <img src={brandLogo(language)} alt={label("בואו נשחק", "Let's Play")} className="print-sheet-brand absolute left-0 top-0 h-14 w-16 object-contain" />
        {hero ? <img src={hero} alt="" className="h-24 w-24 shrink-0 object-contain" /> : null}
        <h1 className="text-center text-4xl font-black">{title}</h1>
      </div>

      {desc ? <p className="text-lg leading-relaxed">{desc}</p> : null}

      {a.materials?.length ? (
        <div>
          <div className="mb-1 text-xl font-bold">{label("כלים:", "Materials:")}</div>
          <table className="w-full table-fixed border-collapse border border-black text-base">
            <tbody>
              {a.materials.map((m, i) => {
                const cell = materialCell(m);
                const w = i === 0 ? { checkbox: "6%", num: "8%", icon: "16%", label: "70%" } : {};
                return (
                  <tr key={i}>
                    <td style={i === 0 ? { width: w.checkbox } : undefined} className="border border-black p-1 text-center">
                      <span aria-hidden className="mx-auto block h-4 w-4 border-2 border-black" />
                    </td>
                    <td style={i === 0 ? { width: w.num } : undefined} className="border border-black p-1 text-center">
                      {i + 1}
                    </td>
                    <td style={i === 0 ? { width: w.icon } : undefined} className="border border-black p-1">
                      <PrintCellIcon {...cell} size="small" />
                    </td>
                    <td style={i === 0 ? { width: w.label } : undefined} className="border border-black p-1">
                      {materials[i] || pick(m, a.materialsN?.[i])}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {a.preparation ? (
        <p className="text-lg leading-relaxed">
          <strong>{label("הכנה מוקדמת: ", "Preparation: ")}</strong>
          {preparation}
        </p>
      ) : null}

      {a.steps?.length ? (
        <div style={{ breakBefore: "page" }}>
          <div className="mb-1 text-xl font-bold">{label("שלבים:", "Steps:")}</div>
          <table className="w-full table-fixed border-collapse border border-black text-base">
            <tbody>
              {steps.map((s, i) => {
                const cell = stepCell(s);
                const w = i === 0 ? { checkbox: "5%", num: "6%", icon: "18%", label: "71%" } : {};
                return (
                  <tr key={s.n}>
                    <td style={i === 0 ? { width: w.checkbox } : undefined} className="border border-black p-1.5 text-center">
                      <span aria-hidden className="mx-auto block h-4 w-4 border-2 border-black" />
                    </td>
                    <td style={i === 0 ? { width: w.num } : undefined} className="border border-black p-1.5 text-center">
                      {s.n}
                    </td>
                    <td style={i === 0 ? { width: w.icon } : undefined} className="border border-black p-1.5">
                      <PrintCellIcon {...cell} />
                    </td>
                    <td style={i === 0 ? { width: w.label } : undefined} className="border border-black p-1.5">
                      {s.displayText}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : a.flow_text ? (
        <div className="text-lg leading-relaxed" style={{ breakBefore: "page" }}>
          {ACTIVITY_ICON_SETS[activityId]?.flow ? (
            <img src={ACTIVITY_ICON_SETS[activityId].flow} alt="" className="mx-auto mb-4 h-56 w-full object-contain" />
          ) : null}
          <p>
            <strong>{label("מהלך הפעילות: ", "How to play: ")}</strong>
            {flowText}
          </p>
        </div>
      ) : null}

      {tips?.length ? (
        <div>
          <div className="mb-1 text-xl font-bold">דגשים:</div>
          <ul className="space-y-1 text-lg">
            {tips.map((tip, i) => (
              <li key={i}>
                ⭐ {tip.boldPrefix ? <strong>{tip.boldPrefix} </strong> : null}
                {tip.text}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {a.adaptations ? (
        <p className="text-lg leading-relaxed">
          <strong>{label("הורדת רמת הקושי: ", "Make it easier: ")}</strong>
          {adaptations}
        </p>
      ) : null}
      {a.extensions ? (
        <p className="text-lg leading-relaxed">
          <strong>{label("העלאת רמת הקושי / שדרוג: ", "Add a challenge: ")}</strong>
          {extensions}
        </p>
      ) : null}

      <div className="mt-6 text-center text-xs text-muted-foreground/70">
        {label("© בואו נשחק — כל הזכויות שמורות. הפעילות הודפסה לשימוש אישי ומשפחתי/טיפולי בלבד; אין להעתיק, למכור או להפיץ מחדש בלי אישור.", "© Let's Play — All rights reserved. Printed for personal, family, or therapeutic use only. Do not copy, sell, or redistribute without permission.")}
      </div>
    </div>
  );
}

function HighlightableText({ text, stepKey, highlighted, onToggle }) {
  if (!text) return null;
  const words = text.split(/(\s+)/); // keep whitespace tokens so spacing is preserved exactly
  return (
    <>
      {words.map((word, i) => {
        if (/^\s+$/.test(word)) return <span key={i}>{word}</span>;
        if (!word) return null;
        const key = `${stepKey}-${i}`;
        const isOn = highlighted.has(key);
        return (
          <span
            key={i}
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(key);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onToggle(key);
              }
            }}
            className={`cursor-pointer rounded px-0.5 transition-colors ${isOn ? "bg-butter text-foreground" : "hover:bg-sky/20"}`}
          >
            {word}
          </span>
        );
      })}
    </>
  );
}

function StepsChecklist({ activityId, steps, pick, hwClass, language }) {
  const { checked, toggle, reset, done, total } = useStepChecklist(activityId, steps.length);
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const customSteps = ACTIVITY_ICON_SETS[activityId]?.steps;
  const [expandedStep, setExpandedStep] = useState(null);
  const [openTooltips, setOpenTooltips] = useState(() => new Set());
  const [highlightedWords, setHighlightedWords] = useState(() => new Set());
  const toggleWord = (key) => {
    setHighlightedWords((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };
  const toggleTooltip = (n) => {
    setOpenTooltips((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-5 md:p-6 print:hidden">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">{language === "en" ? "How to play" : "מהלך הפעילות"}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {language === "en" ? `Tick each step when completed · Select a step to enlarge it · Select a word to highlight it · ${done}/${total}` : `סמני כל שלב לאחר ביצועו · לחצו על שלב כדי להגדיל · לחצו על מילה כדי לסמן אותה · ${done}/${total}`}
          </p>
        </div>
        {done > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} className="rounded-full text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5" /> {language === "en" ? "Reset" : "אפס"}
          </Button>
        )}
      </div>
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-sage transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <ol className="space-y-3">
        {steps.map((s) => {
          const isChecked = checked.has(s.n);
          const stepImages = s.images?.length ? s.images : [s.image].filter(Boolean);
          const CustomIcon = customSteps?.[s.n];
          const BankImg = !CustomIcon ? bankStepIcon(s.text) : null;
          const LibIcon = !CustomIcon && !BankImg ? libStepIcon(s.text) : null;
          const isTooltipOpen = openTooltips.has(s.n);
          const isExpanded = expandedStep === s.n;
          return (
            <li
              key={s.n}
              className={`relative rounded-2xl border p-3 transition-all duration-300 print:scale-100 print:shadow-none ${
                isExpanded
                  ? "z-10 scale-[1.02] border-black/60 bg-white shadow-lg"
                  : isChecked
                    ? "border-black/60 bg-white"
                    : "border-black/60 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`step-${s.n}`}
                  checked={isChecked}
                  onCheckedChange={() => toggle(s.n)}
                  aria-label={language === "en" ? `Mark step ${s.n} as complete` : `סימון שלב ${s.n} כהושלם`}
                  className="h-5 w-5 shrink-0 print:hidden"
                />
                <button
                  type="button"
                  onClick={() => setExpandedStep((current) => (current === s.n ? null : s.n))}
                  aria-pressed={isExpanded}
                  aria-label={language === "en" ? `${isExpanded ? "Reduce" : "Enlarge"} step ${s.n}` : `${isExpanded ? "הקטנת" : "הגדלת"} שלב ${s.n}`}
                  className={`flex min-w-0 flex-1 cursor-zoom-in items-center gap-3 text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky ${
                    isExpanded ? "flex-col sm:flex-row" : ""
                  }`}
                >
                  <div
                    aria-hidden
                    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/40 bg-white p-2 transition-all duration-300 ${
                      isExpanded
                        ? "h-36 w-36 md:h-44 md:w-44 print:h-16 print:w-16"
                        : "h-16 w-16 print:h-12 print:w-12"
                    }`}
                  >
                    {stepImages.length ? (
                      <div className={`grid h-full w-full place-items-center gap-1 ${stepImages.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                        {stepImages.map((path) => <img key={path} src={path} alt="" className="max-h-full max-w-full object-contain" />)}
                      </div>
                    ) : typeof CustomIcon === "string" ? (
                      <img src={CustomIcon} alt="" className="h-full w-full object-contain" />
                    ) : CustomIcon ? (
                      <CustomIcon />
                    ) : BankImg ? (
                      <img src={BankImg} alt="" className="h-full w-full object-contain" />
                    ) : LibIcon ? (
                      <LibIcon />
                    ) : (
                      <img src={activityHero(activityId)} alt="" className="h-full w-full object-contain" />
                    )}
                  </div>
                  <span
                    className={`min-w-0 flex-1 leading-relaxed transition-all duration-300 ${
                      isExpanded ? "text-xl md:text-2xl" : "text-base md:text-lg"
                    } ${isChecked ? "text-muted-foreground line-through" : ""} ${hwClass}`}
                  >
                    <span className="me-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sage/70 align-middle text-xs font-bold text-sage-foreground">
                      {s.n}
                    </span>
                    <HighlightableText
                      text={s.displayText || pick(s.text, s.textN)}
                      stepKey={s.n}
                      highlighted={highlightedWords}
                      onToggle={toggleWord}
                    />
                  </span>
                </button>
                <div className="flex shrink-0 items-center gap-1.5">
                  {s.displayTooltip && (
                    <div className="group relative">
                      <button
                        type="button"
                        onClick={() => toggleTooltip(s.n)}
                        aria-label={language === "en" ? "Information for parents" : "הסבר להורה"}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-sky/20 hover:text-foreground"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                      <div
                        className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-56 -translate-x-1/2 rounded-xl border border-border/60 bg-card p-3 text-xs leading-relaxed text-foreground shadow-lg transition-opacity ${
                          isTooltipOpen ? "opacity-100" : "opacity-0"
                        } group-hover:opacity-100`}
                      >
                        {s.displayTooltip}
                      </div>
                    </div>
                  )}
                  {s.download && (
                    <div className="group relative">
                      <a
                        href={s.download.file}
                        download
                        aria-label={language === "en" ? `Download ${s.displayDownloadLabel}` : `הורדת ${s.displayDownloadLabel}`}
                        title={s.displayDownloadLabel}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-sage/20 hover:text-foreground"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 -translate-x-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                        <img
                          src={s.download.file}
                          alt=""
                          className="h-56 w-96 max-w-[85vw] rounded-xl border border-border/60 bg-white object-contain p-2 shadow-xl md:h-72 md:w-[32rem]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function MaterialsChecklist({ activityId, materials, displayMaterials, materialsN, materialImages, pick, hwClass, language }) {
  const { checked, toggle } = useMaterialsChecklist(activityId);
  const [expandedMaterial, setExpandedMaterial] = useState(null);
  const done = materials.filter((_, i) => checked.has(i)).length;
  const customMaterials = ACTIVITY_ICON_SETS[activityId]?.materials;
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-5 md:p-6 print:hidden">
      <div className="mb-4">
        <h2 className="font-display text-lg font-bold">{language === "en" ? "Materials" : "ציוד נדרש"}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {language === "en" ? `Tick each item when ready · Select an item to enlarge it · ${done}/${materials.length}` : `סמני כל פריט לאחר הכנתו · לחצו על פריט כדי להגדיל · ${done}/${materials.length}`}
        </p>
      </div>
      <ol className={materials.length > 4 ? "grid grid-cols-2 items-start gap-2" : "space-y-2"}>
        {materials.map((m, i) => {
          const isChecked = checked.has(i);
          const isExpanded = expandedMaterial === i;
          const CustomIcon = materialImages?.[m] || customMaterials?.[m];
          const BankImg = !CustomIcon ? bankMaterialIcon(m) : null;
          const LibIcon = !CustomIcon && !BankImg ? libMaterialIcon(m) : null;
          return (
            <li
              key={`${i}-${m}`}
              className={`min-w-0 rounded-2xl border p-3 transition-all duration-300 ${
                isExpanded
                  ? "relative z-10 border-black/60 bg-white shadow-lg"
                  : isChecked
                    ? "border-black/60 bg-white"
                    : "border-black/60 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox id={`mat-${i}`} checked={isChecked} onCheckedChange={() => toggle(i)} className="h-5 w-5 shrink-0" />
                <button
                  type="button"
                  onClick={() => setExpandedMaterial((current) => (current === i ? null : i))}
                  aria-pressed={isExpanded}
                  aria-label={language === "en" ? `${isExpanded ? "Reduce" : "Enlarge"} ${displayMaterials?.[i] || m}` : `${isExpanded ? "הקטנת" : "הגדלת"} ${pick(m, materialsN?.[i])}`}
                  className={`flex min-w-0 flex-1 cursor-zoom-in items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky ${
                    isExpanded ? "w-full flex-col justify-center text-center" : "text-right"
                  }`}
                >
                  <div
                    aria-hidden
                    className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/40 bg-white p-1.5 transition-all duration-300 ${
                      isExpanded ? "h-36 w-36 md:h-44 md:w-44" : "h-16 w-16"
                    }`}
                  >
                    {typeof CustomIcon === "string" ? (
                      <img src={CustomIcon} alt="" className="h-full w-full object-contain" />
                    ) : CustomIcon ? (
                      <CustomIcon />
                    ) : BankImg ? (
                      <img src={BankImg} alt="" className="h-full w-full object-contain" />
                    ) : LibIcon ? (
                      <LibIcon />
                    ) : (
                      <img src={activityHero(activityId)} alt="" className="h-full w-full object-contain" />
                    )}
                  </div>
                  <span
                    className={`min-w-0 leading-relaxed transition-all duration-300 ${
                      isExpanded ? "text-lg md:text-xl" : "flex-1 text-base md:text-lg"
                    } ${isChecked ? "text-muted-foreground line-through" : ""} ${hwClass}`}
                  >
                    <span className="me-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky/60 align-middle text-xs font-bold">
                      {i + 1}
                    </span>
                    {displayMaterials?.[i] || pick(m, materialsN?.[i])}
                  </span>
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
