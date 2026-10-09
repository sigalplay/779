import { useEffect, useMemo, useState } from "react";
import { thumb } from "@/lib/thumb";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BookOpen, ImageIcon, Lock, LockOpen, Pencil, Plus, Save, Search, Sparkles, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isCloudSignedIn } from "@/lib/cloud-auth";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTranslator } from "@/lib/language";
import { translatedTerm } from "@/lib/content-translations";
import { addActivity, addCustomRecipe, addToDraftPlan } from "@/lib/storage";
import { toSiteActivity, toSiteRecipe } from "@/lib/activity-generator";
import { deleteCommunityActivity, listCommunityActivities, updateCommunityActivity } from "@/lib/community-activities";
import { IllustrationPicker, SwapBadge } from "@/components/IllustrationPicker";
import { deleteCmsRow, getCachedCmsCollection, isCmsAdmin, saveCmsRow } from "@/lib/cms-content";

const AGES = [["3-4", 3, 4], ["5-6", 5, 6], ["7-9", 7, 9], ["10+", 10, 99]];

// The picture of a card: its main picture (chosen by an admin), else the first step with a picture,
// else the first material with one.
const coverImage = (activity) => activity.cover || activity.steps?.find((step) => step.image)?.image || activity.materials?.find((item) => item.image)?.image || null;

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
  // A signed-in user correcting the open activity (text and pictures): her draft, and which picture
  // she is choosing. An admin can also lock an activity so only admins can change it.
  const signedIn = isCloudSignedIn();
  const [draft, setDraft] = useState(null);
  const [picking, setPicking] = useState(null); // { key, index }
  const [savingPictures, setSavingPictures] = useState(false);

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
  const openShown = draft || open?.activity;
  const closeOpen = () => { setOpen(null); setDraft(null); setPicking(null); };
  const choosePicture = (image) => {
    setDraft((current) => (picking.key === "cover" ? { ...current, cover: image } : { ...current, [picking.key]: current[picking.key].map((item, i) => (i === picking.index ? { ...item, image } : item)) }));
    setPicking(null);
  };
  const canEdit = signedIn && open && (admin || !open.locked);
  // Edited text replaces the nikud version too, which no longer matches it.
  const setText = (key, index, value) => setDraft((current) => ({ ...current, [key]: current[key].map(({ textN, ...item }, i) => (i === index ? (key === "materials" ? { ...item, ...(textN ? { textN } : {}), name: value } : { ...item, text: value }) : { ...item, ...(textN ? { textN } : {}) })) }));
  const setField = (field, value) => setDraft(({ [`${field}N`]: _dropped, ...current }) => ({ ...current, [field]: value }));
  async function saveRow(fields, message) {
    setSavingPictures(true);
    try {
      const saved = await updateCommunityActivity(open.id, fields);
      setRows((current) => current.map((row) => (row.id === saved.id ? { ...row, ...saved } : row)));
      setOpen((current) => ({ ...current, ...saved }));
      setDraft(null);
      toast.success(message);
    } catch {
      toast.error(t("השמירה לא הצליחה. ייתכן שהפעילות ננעלה או שחסרה הרשאה ב־Supabase.", "Couldn't save. The activity may be locked, or a permission is missing in Supabase."));
    } finally {
      setSavingPictures(false);
    }
  }
  // An admin can publish a recipe from the bank on the main recipes page (as CMS content, id "bank-<row id>").
  // It is a copy: after later corrections she publishes it again to update it.
  const pageId = open ? `bank-${open.id}` : "";
  const [cmsTick, setCmsTick] = useState(0);
  const onRecipesPage = useMemo(() => Boolean(pageId) && getCachedCmsCollection("recipe", []).some((item) => item.id === pageId), [pageId, cmsTick]); // eslint-disable-line react-hooks/exhaustive-deps
  async function publishToRecipesPage() {
    setSavingPictures(true);
    try {
      await saveCmsRow({ content_type: "recipe", content_id: pageId, payload: { ...toSiteRecipe(open.activity, open.language), ai_generated: false }, status: "published" });
      setCmsTick((value) => value + 1);
      toast.success(onRecipesPage ? t("המתכון עודכן בדף המתכונים", "Updated on the recipes page") : t("המתכון נוסף לדף המתכונים", "Added to the recipes page"));
    } catch {
      toast.error(t("לא הצלחנו להוסיף לדף המתכונים.", "Couldn't add it to the recipes page."));
    } finally {
      setSavingPictures(false);
    }
  }
  async function removeFromRecipesPage() {
    if (!window.confirm(t("להסיר את המתכון מדף המתכונים? הוא יישאר בבנק.", "Remove the recipe from the recipes page? It stays in the bank."))) return;
    try {
      await deleteCmsRow("recipe", pageId);
      setCmsTick((value) => value + 1);
      toast.success(t("המתכון הוסר מדף המתכונים", "Removed from the recipes page"));
    } catch {
      toast.error(t("ההסרה לא הצליחה.", "Couldn't remove it."));
    }
  }
  const savePictures = () => saveRow({ activity: draft, title: draft.title }, t("השינויים נשמרו בבנק", "Changes saved"));
  const toggleLock = () => saveRow({ locked: !open.locked }, open.locked ? t("הפעילות פתוחה לעריכה", "The activity is open for editing") : t("הפעילות ננעלה", "The activity is locked"));
  // A picture in the open activity; while an admin edits, tapping it chooses another.
  const picture = (item, key, index, className) => {
    const img = item.image ? <img src={item.image} alt="" className={className} /> : null;
    if (!draft) return img;
    return (
      <button type="button" onClick={() => setPicking({ key, index })} aria-label={t(`איור ל${item.name ?? item.text ?? ""}`, `Picture for ${item.name ?? item.text ?? ""}`)} className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-white", !item.image && "aspect-square w-16 border-2 border-dashed border-border")}>
        {img || <ImageIcon className="h-5 w-5 text-sage-foreground" aria-hidden="true" />}
        <SwapBadge />
      </button>
    );
  };
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
                          ? <img src={thumb(image)} alt="" loading="lazy" className="absolute inset-0 m-auto h-4/5 max-w-[90%] object-contain mix-blend-multiply" />
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

      <Dialog open={Boolean(open)} onOpenChange={(value) => !value && closeOpen()}>
        {open && (
          <DialogContent dir={language === "en" ? "ltr" : "rtl"} className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{draft ? <Input aria-label={t("שם", "Title")} value={draft.title} onChange={(e) => setField("title", e.target.value)} className="h-auto py-2 text-lg font-black" /> : <>{open.activity.emoji} {open.activity.title}</>}</DialogTitle>
              {open.locked && <p className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground"><Lock className="h-3.5 w-3.5" aria-hidden="true" />{t("נעולה לעריכה", "Locked for editing")}</p>}
            </DialogHeader>
            {picking?.key === "cover" ? (
              <IllustrationPicker inline allowUpload={false} text={openShown.title} kind="material" title={t("איור ראשי", "the main picture")} current={openShown.cover} onChoose={choosePicture} onClose={() => setPicking(null)} />
            ) : picking ? (
              <IllustrationPicker
                inline
                allowUpload={false}
                text={openShown[picking.key][picking.index]?.name ?? openShown[picking.key][picking.index]?.text}
                kind={picking.key === "steps" ? "step" : "material"}
                title={picking.key === "steps" ? t(`שלב ${picking.index + 1}`, `Step ${picking.index + 1}`) : (openShown[picking.key][picking.index]?.name ?? openShown[picking.key][picking.index]?.text)}
                current={openShown[picking.key][picking.index]?.image}
                onChoose={choosePicture}
                onClose={() => setPicking(null)}
              />
            ) : <>
            {(draft || openShown.cover) && (
              <div className="flex items-center gap-3">
                {draft ? <div className="h-28 w-28 shrink-0 [&>button]:h-28 [&>button]:w-28">{picture({ image: openShown.cover, name: t("איור ראשי", "the main picture") }, "cover", 0, "h-28 w-28 object-contain")}</div> : <img src={openShown.cover} alt="" className="h-28 w-28 shrink-0 object-contain" />}
                {draft && <p className="text-xs text-muted-foreground">{t("איור ראשי: מופיע בכרטיס בבנק ובראש הפעילות. נוגעים כדי לבחור.", "Main picture: shown on the card and at the top. Tap to choose.")}</p>}
              </div>
            )}
            {draft ? <Textarea aria-label={t("תיאור", "Description")} value={draft.description || ""} onChange={(e) => setField("description", e.target.value)} rows={2} /> : <p className="text-muted-foreground">{open.activity.description}</p>}
            <p className="text-xs font-semibold text-muted-foreground">
              {t(`גיל ${open.activity.age_min}–${open.activity.age_max}`, `Age ${open.activity.age_min}–${open.activity.age_max}`)} · {t(`${open.activity.duration_min} דק׳`, `${open.activity.duration_min} min`)}{isRecipe ? "" : ` · ${open.equipment === "clinic" ? t("קליניקה", "Clinic") : t("מהבית", "At home")}`}
            </p>

            {(isRecipe
              ? [[t("מצרכים", "Ingredients"), "ingredients"], [t("כלים", "Tools"), "tools"]]
              : [[t("ציוד", "Materials"), "materials"]]
            ).map(([heading, key]) => [heading, key, openShown[key]]).map(([heading, key, items]) => (
              <div key={heading}>
                <h3 className="mb-2 mt-2 font-bold">{heading}</h3>
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {(items || []).map((item, index) => (
                    <li key={index} className="rounded-2xl border border-border/60 bg-background p-2 text-center text-xs font-semibold">
                      {draft ? <div className="mx-auto mb-1 w-full [&>button]:aspect-square [&>button]:w-full">{picture(item, key, index, "aspect-square w-full object-contain")}</div> : item.image ? <img src={item.image} alt="" className="mx-auto aspect-square w-full object-contain" /> : <span className="grid aspect-square place-items-center text-2xl" aria-hidden="true">•</span>}
                      {draft ? <Input aria-label={t("שם הפריט", "Item name")} value={item.name ?? item.text ?? ""} onChange={(e) => setText(key, index, e.target.value)} className="h-8 px-2 text-xs" /> : (item.name ?? item.text)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <h3 className="mt-2 font-bold">{t("שלבים", "Steps")}</h3>
            <ol className="space-y-2">
              {openShown.steps.map((step, index) => (
                <li key={index} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-2">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sage/25 text-sm font-bold">{index + 1}</span>
                  {draft ? <div className="h-16 w-16 shrink-0 [&>button]:h-16 [&>button]:w-16">{picture(step, "steps", index, "h-16 w-16 object-contain")}</div> : step.image && <img src={step.image} alt="" className="h-16 w-16 shrink-0 object-contain" />}
                  {draft ? <Textarea aria-label={t(`שלב ${index + 1}`, `Step ${index + 1}`)} value={step.text} onChange={(e) => setText("steps", index, e.target.value)} rows={2} className="flex-1" /> : <span className="text-sm leading-relaxed">{step.text}</span>}
                </li>
              ))}
            </ol>
            {draft ? (draft.safety !== undefined || isRecipe) && <Textarea aria-label={t("בטיחות", "Safety")} value={draft.safety || ""} onChange={(e) => setField("safety", e.target.value)} rows={2} placeholder={t("בטיחות", "Safety")} /> : open.activity.safety && <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm">⚠️ {open.activity.safety}</p>}

            {draft ? (
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Button className="min-h-11 rounded-full" disabled={savingPictures} onClick={savePictures}>
                <Save className="h-4 w-4" aria-hidden="true" /> {savingPictures ? t("שומרת…", "Saving…") : t("שמירת השינויים בבנק", "Save changes")}
              </Button>
              <Button variant="outline" className="min-h-11 rounded-full" onClick={() => setDraft(null)}>{t("ביטול", "Cancel")}</Button>
            </div>
            ) : isRecipe ? (
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
            {!draft && (canEdit || admin) && (
              <div className="mt-1 flex flex-wrap justify-center gap-4">
                {canEdit && (
                  <button type="button" onClick={() => setDraft(structuredClone(open.activity))} className="inline-flex items-center gap-1 text-sm font-semibold text-sage-foreground">
                    <Pencil className="h-4 w-4" aria-hidden="true" /> {t("עריכה ותיקון", "Edit and correct")}
                  </button>
                )}
                {admin && (
                  <button type="button" disabled={savingPictures} onClick={toggleLock} className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                    {open.locked ? <LockOpen className="h-4 w-4" aria-hidden="true" /> : <Lock className="h-4 w-4" aria-hidden="true" />} {open.locked ? t("ביטול נעילה (מנהלת)", "Unlock (admin)") : t("נעילה לעריכה (מנהלת)", "Lock editing (admin)")}
                  </button>
                )}
                {admin && isRecipe && (
                  <button type="button" disabled={savingPictures} onClick={publishToRecipesPage} className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
                    <BookOpen className="h-4 w-4" aria-hidden="true" /> {onRecipesPage ? t("עדכון בדף המתכונים (מנהלת)", "Update on the recipes page (admin)") : t("הוספה לדף המתכונים (מנהלת)", "Add to the recipes page (admin)")}
                  </button>
                )}
                {admin && isRecipe && onRecipesPage && (
                  <button type="button" onClick={removeFromRecipesPage} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                    {t("הסרה מדף המתכונים", "Remove from the recipes page")}
                  </button>
                )}
                {admin && (
                  <button type="button" onClick={() => remove(open)} className="inline-flex items-center gap-1 text-sm font-semibold text-destructive">
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> {t("מחיקה מהבנק (מנהלת)", "Delete from the bank (admin)")}
                  </button>
                )}
              </div>
            )}
            </>}
          </DialogContent>
        )}
      </Dialog>
    </AppShell>
  );
}
