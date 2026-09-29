import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Save, Search, Sparkles, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTranslator } from "@/lib/language";
import { translatedTerm } from "@/lib/content-translations";
import { addActivity, addCustomRecipe, addToDraftPlan } from "@/lib/storage";
import { toSiteActivity, toSiteRecipe } from "@/lib/activity-generator";
import { deleteCommunityActivity, listCommunityActivities } from "@/lib/community-activities";
import { isCmsAdmin } from "@/lib/cms-content";

const AGES = [["3-4", 3, 4], ["5-6", 5, 6], ["7-9", 7, 9], ["10+", 10, 99]];

// The picture of a card: the first step with a picture, else the first material with one.
const coverImage = (activity) => activity.steps?.find((step) => step.image)?.image || activity.materials?.find((item) => item.image)?.image || null;

export default function CommunityActivities() {
  const { language, t } = useTranslator();
  const navigate = useNavigate();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [goal, setGoal] = useState(null);
  const [age, setAge] = useState(null);
  const [open, setOpen] = useState(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    listCommunityActivities().then(setRows).catch(() => { setRows([]); setError(t("לא הצלחנו לטעון את הפעילויות. נסו שוב בעוד רגע.", "We couldn't load the activities. Please try again in a moment.")); });
    isCmsAdmin().then(setAdmin).catch(() => setAdmin(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Hebrew and English activities are separate banks: each site language shows its own.
  const mine = useMemo(() => (rows || []).filter((row) => (row.language || "he") === (language === "en" ? "en" : "he")), [rows, language]);

  const goals = useMemo(() => {
    const count = new Map();
    for (const row of mine) for (const item of row.activity.goals || []) count.set(item, (count.get(item) || 0) + 1);
    return [...count].sort((a, b) => b[1] - a[1]).map(([name]) => name);
  }, [mine]);

  const shown = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const range = AGES.find(([id]) => id === age);
    return mine.filter(({ activity }) => {
      if (goal && !(activity.goals || []).includes(goal)) return false;
      if (range && (activity.age_max < range[1] || activity.age_min > range[2])) return false;
      if (!words.length) return true;
      const text = [activity.title, activity.description, ...(activity.materials || []).map((item) => item.name), ...(activity.steps || []).map((step) => step.text)].join(" ").toLowerCase();
      return words.every((word) => text.includes(word));
    });
  }, [mine, query, goal, age]);

  const isRecipe = open?.activity?.kind === "recipe";
  const saveRecipe = (row) => addCustomRecipe(toSiteRecipe(row.activity, row.language));
  const saveToMine = (row) => addActivity(toSiteActivity(row.activity, { equipment: row.equipment, language: row.language }));

  async function remove(row) {
    if (!window.confirm(t(`למחוק את "${row.activity.title}" מהבנק?`, `Delete "${row.activity.title}" from the bank?`))) return;
    try {
      await deleteCommunityActivity(row.id);
      setRows((list) => list.filter((item) => item.id !== row.id));
      setOpen(null);
      toast.success(t("הפעילות נמחקה", "Activity deleted"));
    } catch {
      toast.error(t("המחיקה לא הצליחה", "Couldn't delete the activity"));
    }
  }

  const chip = (selected) => cn("min-h-10 rounded-full border px-4 text-sm font-semibold", selected ? "border-foreground bg-foreground text-background" : "border-border bg-background");

  return (
    <AppShell mode="therapist">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl font-black md:text-4xl">{t("פעילויות שמשתמשים יצרו", "Activities users created")}</h1>
        <p className="mb-5 mt-1 text-muted-foreground">
          {t("כל הפעילויות שנוצרו במחולל הפעילויות של האתר. שמרו לפעילויות שלכם או הוסיפו ישר ללוח המובנה.", "Every activity made with the site's activity generator. Save it to your activities or add it straight to the session board.")}
          {" "}<Link to="/therapist/activity-generator" className="font-bold text-primary underline underline-offset-4">{t("ליצירת פעילות חדשה", "Create a new activity")}</Link>
        </p>

        <div className="mb-4 space-y-3">
          <label className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4">
            <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("חיפוש: פינצטה, קשב, מטבח…", "Search: tweezers, attention, kitchen…")} className="min-h-12 w-full bg-transparent outline-none" />
          </label>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("גיל", "Age")}>
            {AGES.map(([id]) => <button key={id} type="button" aria-pressed={age === id} className={chip(age === id)} onClick={() => setAge(age === id ? null : id)}>{t(`גיל ${id}`, `Age ${id}`)}</button>)}
          </div>
          {goals.length > 1 && (
            <div className="flex flex-wrap gap-2" role="group" aria-label={t("מטרה", "Goal")}>
              <button type="button" aria-pressed={!goal} className={chip(!goal)} onClick={() => setGoal(null)}>{t("הכול", "All")}</button>
              {goals.map((name) => <button key={name} type="button" aria-pressed={goal === name} className={chip(goal === name)} onClick={() => setGoal(goal === name ? null : name)}>{translatedTerm(name, language)}</button>)}
            </div>
          )}
        </div>

        {error && <p className="mb-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive" role="alert">{error}</p>}
        {rows === null ? (
          <p className="py-10 text-center text-muted-foreground">{t("טוען…", "Loading…")}</p>
        ) : shown.length ? (
          <>
            <p className="mb-3 text-sm text-muted-foreground">{t(`${shown.length} פעילויות`, `${shown.length} activities`)}</p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((row) => {
                const { activity } = row;
                const image = coverImage(activity);
                return (
                  <li key={row.id}>
                    <button type="button" onClick={() => setOpen(row)} className="flex h-full w-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-card text-start shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <span className="relative block aspect-[4/3] w-full bg-sage/15">
                        {image
                          ? <img src={image} alt="" loading="lazy" className="absolute inset-0 m-auto h-4/5 max-w-[90%] object-contain mix-blend-multiply" />
                          : <span className="absolute inset-0 grid place-items-center text-5xl" aria-hidden="true">{activity.emoji || "✨"}</span>}
                      </span>
                      <span className="flex flex-1 flex-col gap-1 p-4">
                        {activity.kind === "recipe" && <span className="w-fit rounded-full bg-[#f5f0fd] px-2.5 py-0.5 text-xs font-bold text-[#4a3a73]">{t("🍪 מתכון", "🍪 Recipe")}</span>}
                        <span className="font-display text-lg font-black leading-snug">{activity.title}</span>
                        <span className="line-clamp-2 text-sm text-muted-foreground">{activity.description}</span>
                        <span className="mt-auto pt-2 text-xs font-semibold text-muted-foreground">
                          {t(`גיל ${activity.age_min}–${activity.age_max}`, `Age ${activity.age_min}–${activity.age_max}`)} · {t(`${activity.duration_min} דק׳`, `${activity.duration_min} min`)}
                          {(activity.goals || []).length > 0 && ` · ${activity.goals.map((item) => translatedTerm(item, language)).join(", ")}`}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-8 text-center">
            <p className="mb-4 text-muted-foreground">{mine.length ? t("לא נמצאו פעילויות. נסו חיפוש אחר.", "No activities found. Try another search.") : t("עוד אין כאן פעילויות. הפעילות הראשונה יכולה להיות שלך!", "No activities yet. The first one could be yours!")}</p>
            <Link to="/therapist/activity-generator" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground"><Sparkles className="h-4 w-4" />{t("ליצירת פעילות", "Create an activity")}</Link>
          </div>
        )}
      </div>

      <Dialog open={Boolean(open)} onOpenChange={(value) => !value && setOpen(null)}>
        {open && (
          <DialogContent dir={language === "en" ? "ltr" : "rtl"} className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{open.activity.emoji} {open.activity.title}</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">{open.activity.description}</p>
            <p className="text-xs font-semibold text-muted-foreground">
              {t(`גיל ${open.activity.age_min}–${open.activity.age_max}`, `Age ${open.activity.age_min}–${open.activity.age_max}`)} · {t(`${open.activity.duration_min} דק׳`, `${open.activity.duration_min} min`)}{isRecipe ? "" : ` · ${open.equipment === "clinic" ? t("קליניקה", "Clinic") : t("מהבית", "At home")}`}
            </p>

            {(isRecipe
              ? [[t("מצרכים", "Ingredients"), open.activity.ingredients], [t("כלים", "Tools"), open.activity.tools]]
              : [[t("ציוד", "Materials"), open.activity.materials]]
            ).map(([heading, items]) => (
              <div key={heading}>
                <h3 className="mb-2 mt-2 font-bold">{heading}</h3>
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {(items || []).map((item, index) => (
                    <li key={index} className="rounded-2xl border border-border/60 bg-background p-2 text-center text-xs font-semibold">
                      {item.image ? <img src={item.image} alt="" className="mx-auto aspect-square w-full object-contain" /> : <span className="grid aspect-square place-items-center text-2xl" aria-hidden="true">•</span>}
                      {item.name ?? item.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <h3 className="mt-2 font-bold">{t("שלבים", "Steps")}</h3>
            <ol className="space-y-2">
              {open.activity.steps.map((step, index) => (
                <li key={index} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sage/25 text-sm font-bold">{index + 1}</span>
                  {step.image && <img src={step.image} alt="" className="h-16 w-16 shrink-0 object-contain" />}
                  <span className="text-sm leading-relaxed">{step.text}</span>
                </li>
              ))}
            </ol>
            {open.activity.safety && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm">⚠️ {open.activity.safety}</p>}

            {isRecipe ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Button className="min-h-11 rounded-full" onClick={() => { addToDraftPlan("recipe", saveRecipe(open).id); navigate("/therapist/build?view=session"); }}>
                <Plus className="h-4 w-4" aria-hidden="true" /> {t("ללוח המובנה", "Add to session board")}
              </Button>
              <Button variant="outline" className="min-h-11 rounded-full" onClick={() => { const saved = saveRecipe(open); toast.success(t("נשמר במתכונים שלי", "Saved to my recipes")); navigate(`/therapist/recipes/${saved.id}`); }}>
                <Save className="h-4 w-4" aria-hidden="true" /> {t("שמירה למתכונים שלי", "Save to my recipes")}
              </Button>
            </div>
            ) : (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Button className="min-h-11 rounded-full" onClick={() => { addToDraftPlan("activity", saveToMine(open).id); navigate("/therapist/build?view=session"); }}>
                <Plus className="h-4 w-4" aria-hidden="true" /> {t("ללוח המובנה", "Add to session board")}
              </Button>
              <Button variant="outline" className="min-h-11 rounded-full" onClick={() => { const saved = saveToMine(open); toast.success(t("נשמר בפעילויות שלי", "Saved to my activities")); navigate(`/activity/${saved.id}?mode=therapist`); }}>
                <Save className="h-4 w-4" aria-hidden="true" /> {t("שמירה לפעילויות שלי", "Save to my activities")}
              </Button>
            </div>
            )}
            {admin && (
              <button type="button" onClick={() => remove(open)} className="mx-auto mt-1 inline-flex items-center gap-1 text-sm font-semibold text-destructive">
                <Trash2 className="h-4 w-4" aria-hidden="true" /> {t("מחיקה מהבנק (מנהלת)", "Delete from the bank (admin)")}
              </button>
            )}
          </DialogContent>
        )}
      </Dialog>
    </AppShell>
  );
}
