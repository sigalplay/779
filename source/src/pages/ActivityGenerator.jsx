import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Camera, Check, Pencil, Plus, Printer, Save, Sparkles, Trash2, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslator } from "@/lib/language";
import { isCloudSignedIn } from "@/lib/cloud-auth";
import { addActivity, addToDraftPlan, getCustomActivities, updateCustomActivity } from "@/lib/storage";
import { readPhotoFile } from "@/lib/session-board-tools";
import { generateActivity, loadIllustrationCatalog, suggestIllustrations, toSiteActivity } from "@/lib/activity-generator";

const AGES = ["3-4", "5-6", "7-9", "10+"];
const DURATIONS = [10, 15, 25];

// The activity generator: the therapist describes what she needs and gets an activity in the site's
// format, drawn with the site's own illustrations; where none fits she can choose another or upload
// her own photo. The result can be edited, saved to "My activities", added to the session board and printed.
export default function ActivityGenerator() {
  const { language, t } = useTranslator();
  const navigate = useNavigate();
  const signedIn = isCloudSignedIn();
  const [form, setForm] = useState({ request: "", age: "5-6", equipment: "home", duration: 15 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activity, setActivity] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [editing, setEditing] = useState(false);
  const [picker, setPicker] = useState(null); // { kind: "material" | "step", index }
  const [savedId, setSavedId] = useState(null);
  const [mine, setMine] = useState(() => getCustomActivities().filter((item) => item.ai_generated));

  const errors = {
    "sign-in": t("צריך להתחבר כדי ליצור פעילות.", "Please sign in to create an activity."),
    "daily-limit": t("הגעת למספר הפעילויות להיום. אפשר ליצור עוד מחר.", "You have reached today's limit. You can create more tomorrow."),
    refused: t("לא הצלחנו ליצור פעילות לבקשה הזאת. נסי לנסח אותה אחרת.", "We couldn't create an activity for this request. Try wording it differently."),
    busy: t("השירות עמוס כרגע. נסי שוב בעוד דקה.", "The service is busy. Please try again in a minute."),
    "not-deployed": t("מחולל הפעילויות עוד לא הופעל באתר.", "The activity generator is not switched on yet."),
    "not-configured": t("מחולל הפעילויות עוד לא הופעל באתר.", "The activity generator is not switched on yet."),
    empty: t("כתבי בכמה מילים מה הפעילות צריכה לתרגל.", "Describe in a few words what the activity should practice."),
  };

  async function create(event) {
    event.preventDefault();
    if (form.request.trim().length < 5) { setError(errors.empty); return; }
    setLoading(true);
    setError("");
    try {
      const result = await generateActivity({ ...form, language });
      if (!result.activity?.title) {
        setError(result.activity?.description || errors.refused);
        return;
      }
      setActivity(result.activity);
      setRemaining(result.remaining ?? null);
      setSavedId(null);
      setEditing(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (failure) {
      setError(errors[failure.code] || t("משהו השתבש. נסי שוב.", "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  const change = (patch) => { setActivity((current) => ({ ...current, ...patch })); };
  const changeItem = (key, index, patch) => {
    setActivity((current) => ({ ...current, [key]: current[key].map((item, i) => (i === index ? { ...item, ...patch } : item)) }));
  };
  const removeItem = (key, index) => setActivity((current) => ({ ...current, [key]: current[key].filter((_, i) => i !== index) }));
  const addItem = (key) => setActivity((current) => ({ ...current, [key]: [...current[key], key === "materials" ? { name: "", image: null } : { text: "", image: null }] }));

  // Saved once, then kept up to date, so the board and the activity page always show the latest version.
  function save() {
    const data = toSiteActivity({
      ...activity,
      materials: activity.materials.filter((item) => item.name.trim()),
      steps: activity.steps.filter((step) => step.text.trim()),
    }, { equipment: form.equipment, language });
    const saved = savedId ? updateCustomActivity(savedId, data) : addActivity(data);
    setSavedId(saved.id);
    setMine(getCustomActivities().filter((item) => item.ai_generated));
    return saved.id;
  }
  function saveWithMessage() {
    save();
    toast.success(t("נשמר ב\"הפעילויות שלי\"", "Saved to \"My activities\""));
  }
  function addToBoard() {
    addToDraftPlan("activity", save());
    toast.success(t("הפעילות נוספה ללוח המפגש", "Added to the session board"));
    navigate("/therapist/build?view=session");
  }
  function openToPrint() {
    navigate(`/activity/${save()}?mode=therapist`);
  }

  return (
    <AppShell mode="therapist">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-3xl font-black md:text-4xl">{t("מחולל פעילויות", "Activity generator")}</h1>
        <p className="mb-6 mt-1 text-muted-foreground">
          {t("מתארים מה צריך, ומקבלים פעילות מוכנה עם איורים מהמאגר של בואו נשחק.", "Describe what you need and get a ready activity with illustrations from the site.")}
          {" "}<Link to="/therapist/community-activities" className="font-bold text-primary underline underline-offset-4">{t("לפעילויות שמשתמשים יצרו", "Activities users created")}</Link>
        </p>

        {!signedIn ? (
          <div className="rounded-3xl border border-border/60 bg-card p-6 text-center">
            <p className="mb-4 font-semibold">{t("מחולל הפעילויות פתוח למטפלות מחוברות.", "The activity generator is for signed-in therapists.")}</p>
            <a href={`/auth?mode=login&redirect=${encodeURIComponent("/therapist/activity-generator")}`} className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground">{t("התחברות", "Sign in")}</a>
          </div>
        ) : !activity ? (
          <form onSubmit={create} className="space-y-4">
            <div className="space-y-4 rounded-3xl border border-border/60 bg-card p-5">
              <div>
                <Label htmlFor="generatorRequest" className="mb-2 block text-base font-bold">{t("מה הפעילות צריכה לתרגל?", "What should the activity practice?")}</Label>
                <Textarea
                  id="generatorRequest"
                  rows={4}
                  maxLength={800}
                  value={form.request}
                  onChange={(e) => setForm({ ...form, request: e.target.value })}
                  placeholder={t("לדוגמה: חיזוק אחיזה עדינה עם פינצטה, עם משהו עם סיפור קטן שיעניין את הילד", "For example: strengthening a fine pincer grasp with tweezers, with a little story to keep the child interested")}
                  className="rounded-2xl border-2 text-base leading-relaxed"
                />
              </div>
              <ChoiceRow label={t("גיל", "Age")} options={AGES.map((value) => [value, value])} value={form.age} onChange={(age) => setForm({ ...form, age })} />
              <ChoiceRow label={t("ציוד", "Equipment")} options={[["home", t("🏠 מהבית", "🏠 At home")], ["clinic", t("🏥 קליניקה", "🏥 Clinic")]]} value={form.equipment} onChange={(equipment) => setForm({ ...form, equipment })} />
              <ChoiceRow label={t("משך", "Duration")} options={DURATIONS.map((value) => [value, t(`${value} דק׳`, `${value} min`)])} value={form.duration} onChange={(duration) => setForm({ ...form, duration })} />
              <p className="rounded-xl bg-sage/15 px-3 py-2 text-xs text-sage-foreground">{t("🔒 בלי שם הילד ובלי פרטים מזהים. מספיק לתאר גיל ומטרה. הפעילות שתיווצר תתווסף גם ל„פעילויות שמשתמשים יצרו”, בלי שם היוצרת.", "🔒 No child's name or identifying details. Age and goal are enough. The activity will also be added to \"Activities users created\", without your name.")}</p>
            </div>
            {error && <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive" role="alert">{error}</p>}
            <Button type="submit" disabled={loading} className="min-h-12 w-full rounded-full text-base">
              <Sparkles className="h-4 w-4" aria-hidden="true" />{" "}
              {loading ? t("מכינה את הפעילות… זה לוקח כחצי דקה", "Creating the activity… about half a minute") : t("יצירת פעילות", "Create activity")}
            </Button>
          </form>
        ) : (
          <GeneratedActivity
            activity={activity}
            editing={editing}
            onEdit={() => setEditing((value) => !value)}
            onChange={change}
            onChangeItem={changeItem}
            onRemoveItem={removeItem}
            onAddItem={addItem}
            onPick={setPicker}
            onSave={saveWithMessage}
            onAddToBoard={addToBoard}
            onPrint={openToPrint}
            onNew={() => { setActivity(null); setError(""); }}
            remaining={remaining}
          />
        )}

        {signedIn && mine.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-3 font-display text-xl font-black">{t("הפעילויות שיצרתי", "Activities I created")}</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {mine.slice(0, 12).map((item) => (
                <li key={item.id}>
                  <Link to={`/activity/${item.id}?mode=therapist`} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 font-semibold hover:bg-muted/50">
                    <span className="text-2xl" aria-hidden="true">{item.emoji || "✨"}</span>{item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {picker && activity && (
        <IllustrationPicker
          text={picker.kind === "material" ? activity.materials[picker.index]?.name : activity.steps[picker.index]?.text}
          kind={picker.kind}
          title={picker.kind === "material" ? activity.materials[picker.index]?.name : t(`שלב ${picker.index + 1}`, `Step ${picker.index + 1}`)}
          current={(picker.kind === "material" ? activity.materials : activity.steps)[picker.index]?.image}
          onChoose={(image) => { changeItem(picker.kind === "material" ? "materials" : "steps", picker.index, { image }); setPicker(null); }}
          onClose={() => setPicker(null)}
        />
      )}
    </AppShell>
  );
}

function ChoiceRow({ label, options, value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold">{label}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map(([optionValue, optionLabel]) => (
          <button
            key={optionValue}
            type="button"
            aria-pressed={value === optionValue}
            onClick={() => onChange(optionValue)}
            className={cn("min-h-11 rounded-full border px-4 text-sm font-semibold", value === optionValue ? "border-foreground bg-foreground text-background" : "border-border bg-background")}
          >
            {optionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function GeneratedActivity({ activity, editing, onEdit, onChange, onChangeItem, onRemoveItem, onAddItem, onPick, onSave, onAddToBoard, onPrint, onNew, remaining }) {
  const { t } = useTranslator();
  const texts = [
    ["preparation", t("הכנה", "Preparation")],
    ["adaptations", t("התאמות", "Adaptations")],
    ["extensions", t("הרחבות", "Extensions")],
    ["safety", t("בטיחות", "Safety")],
  ];
  return (
    <article className="space-y-5">
      <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900">{t("⚠️ נוצר בעזרת AI. כדאי לעבור על הפעילות לפני המפגש.", "⚠️ Created with AI. Please review the activity before the session.")}</p>

      <div>
        {editing ? (
          <Input aria-label={t("שם הפעילות", "Activity title")} value={activity.title} onChange={(e) => onChange({ title: e.target.value })} className="h-auto py-2 font-display text-2xl font-black" />
        ) : (
          <h2 className="font-display text-2xl font-black"><span aria-hidden="true">{activity.emoji} </span>{activity.title}</h2>
        )}
        {editing ? (
          <Textarea aria-label={t("תיאור", "Description")} value={activity.description} onChange={(e) => onChange({ description: e.target.value })} rows={2} className="mt-2" />
        ) : (
          <p className="mt-1 text-muted-foreground">{activity.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold">
          <span className="rounded-full border border-border bg-card px-3 py-1">{t(`גיל ${activity.age_min}–${activity.age_max}`, `Ages ${activity.age_min}–${activity.age_max}`)}</span>
          <span className="rounded-full border border-border bg-card px-3 py-1">{t(`${activity.duration_min} דקות`, `${activity.duration_min} minutes`)}</span>
          {activity.goals.map((goal) => <span key={goal} className="rounded-full border border-border bg-card px-3 py-1">{goal}</span>)}
        </div>
      </div>

      <section>
        <h3 className="mb-2 font-bold">{t("ציוד", "Materials")}</h3>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {activity.materials.map((item, index) => (
            <li key={index} className="relative flex flex-col rounded-2xl border border-border/60 bg-card p-1.5 text-center">
              <button type="button" onClick={() => onPick({ kind: "material", index })} aria-label={t(`איור ל${item.name}`, `Picture for ${item.name}`)} className={cn("grid aspect-square place-items-center overflow-hidden rounded-xl", item.image ? "bg-white" : "border-2 border-dashed border-border bg-muted/40 text-sage-foreground")}>
                {item.image ? <img src={item.image} alt="" className="h-full w-full object-contain" /> : <span className="grid place-items-center gap-1 text-xs font-bold"><Camera className="h-6 w-6" aria-hidden="true" />{t("איור / תמונה", "Picture")}</span>}
              </button>
              {editing ? (
                <div className="mt-1 flex items-center gap-1">
                  <Input aria-label={t("שם הפריט", "Item name")} value={item.name} onChange={(e) => onChangeItem("materials", index, { name: e.target.value })} className="h-8 px-2 text-xs" />
                  <button type="button" onClick={() => onRemoveItem("materials", index)} aria-label={t("הסרה", "Remove")} className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              ) : (
                <span className="mt-1 text-sm font-semibold">{item.name}</span>
              )}
            </li>
          ))}
          {editing && (
            <li><button type="button" onClick={() => onAddItem("materials")} className="grid h-full min-h-24 w-full place-items-center rounded-2xl border-2 border-dashed border-border text-sm font-bold text-sage-foreground"><Plus className="h-5 w-5" aria-hidden="true" />{t("פריט", "Item")}</button></li>
          )}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 font-bold">{t("שלבים", "Steps")}</h3>
        <ol className="space-y-2">
          {activity.steps.map((step, index) => (
            <li key={index} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sage/30 text-sm font-bold">{index + 1}</span>
              <button type="button" onClick={() => onPick({ kind: "step", index })} aria-label={t(`איור לשלב ${index + 1}`, `Picture for step ${index + 1}`)} className={cn("grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl", step.image ? "bg-white" : "border-2 border-dashed border-border bg-muted/40 text-sage-foreground")}>
                {step.image ? <img src={step.image} alt="" className="h-full w-full object-contain" /> : <span className="grid place-items-center gap-1 text-[11px] font-bold"><Camera className="h-5 w-5" aria-hidden="true" />{t("איור / תמונה", "Picture")}</span>}
              </button>
              {editing ? (
                <>
                  <Textarea aria-label={t(`שלב ${index + 1}`, `Step ${index + 1}`)} value={step.text} onChange={(e) => onChangeItem("steps", index, { text: e.target.value })} rows={2} className="flex-1" />
                  <button type="button" onClick={() => onRemoveItem("steps", index)} aria-label={t("הסרת השלב", "Remove step")} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                </>
              ) : (
                <p className="flex-1 leading-relaxed">{step.text}</p>
              )}
            </li>
          ))}
        </ol>
        {editing && <Button type="button" variant="outline" onClick={() => onAddItem("steps")} className="mt-2 w-full rounded-full"><Plus className="h-4 w-4" aria-hidden="true" />{" "}{t("שלב", "Step")}</Button>}
      </section>

      {texts.map(([key, label]) => (editing || activity[key]) && (
        <section key={key}>
          <h3 className="mb-1 font-bold">{label}</h3>
          {editing ? <Textarea aria-label={label} value={activity[key]} onChange={(e) => onChange({ [key]: e.target.value })} rows={2} /> : <p className="leading-relaxed text-foreground/90">{activity[key]}</p>}
        </section>
      ))}

      <div className="grid grid-cols-2 gap-2 border-t border-border/60 pt-5">
        <Button type="button" variant="outline" onClick={onEdit} className="min-h-11 rounded-full">
          {editing ? <><Check className="h-4 w-4" aria-hidden="true" />{" "}{t("סיום עריכה", "Done editing")}</> : <><Pencil className="h-4 w-4" aria-hidden="true" />{" "}{t("עריכה", "Edit")}</>}
        </Button>
        <Button type="button" variant="outline" onClick={onSave} className="min-h-11 rounded-full"><Save className="h-4 w-4" aria-hidden="true" />{" "}{t("לפעילויות שלי", "To my activities")}</Button>
        <Button type="button" onClick={onAddToBoard} className="min-h-11 rounded-full"><Plus className="h-4 w-4" aria-hidden="true" />{" "}{t("ללוח המפגש", "To the session board")}</Button>
        <Button type="button" variant="outline" onClick={onPrint} className="min-h-11 rounded-full"><Printer className="h-4 w-4" aria-hidden="true" />{" "}{t("הדפסה", "Print")}</Button>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <button type="button" onClick={onNew} className="min-h-11 rounded-full px-3 font-semibold underline">{t("בקשה חדשה", "New request")}</button>
        {remaining != null && <span>{t(`נשארו לך היום ${remaining} פעילויות`, `${remaining} activities left today`)}</span>}
      </div>
    </article>
  );
}

// Another picture for a material or step: suggestions from the site's catalog, a search, the
// therapist's own photo, or no picture.
function IllustrationPicker({ text, kind, title, current, onChoose, onClose }) {
  const { t } = useTranslator();
  const [catalog, setCatalog] = useState(null);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  useEffect(() => { loadIllustrationCatalog().then(setCatalog); }, []);
  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const suggestions = useMemo(() => (catalog ? suggestIllustrations(catalog, query.trim() || text, kind, 12) : []), [catalog, query, text, kind]);

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      onChoose(await readPhotoFile(file, 700, 0.82));
    } catch {
      toast.error(t("לא הצלחנו לפתוח את התמונה.", "We couldn't open the photo."));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/40 sm:items-center" role="dialog" aria-modal="true" aria-label={t(`איור ל${title}`, `Picture for ${title}`)} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-background p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-black">{t(`איור ל${title}`, `Picture for ${title}`)}</h2>
            <p className="text-sm text-muted-foreground">{t("איורים מהמאגר שאולי מתאימים:", "Pictures from the site that may fit:")}</p>
          </div>
          <button type="button" onClick={onClose} aria-label={t("סגירה", "Close")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("חיפוש איור, למשל: כדור", "Search, e.g. ball")} aria-label={t("חיפוש איור", "Search pictures")} className="mb-3" />
        {!catalog ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("טוענת איורים…", "Loading pictures…")}</p>
        ) : suggestions.length ? (
          <div className="grid grid-cols-3 gap-2">
            {suggestions.map((item) => (
              <button key={item.image} type="button" onClick={() => onChoose(item.image)} aria-label={item.label} title={item.label} className={cn("aspect-square overflow-hidden rounded-xl border bg-white p-1", item.image === current ? "border-sage-foreground ring-2 ring-sage-foreground" : "border-border hover:border-primary")}>
                <img src={item.image} alt="" loading="lazy" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-muted-foreground">{t("לא מצאנו איור מתאים. אפשר לחפש מילה אחרת או להעלות תמונה.", "No matching picture. Try another word or upload a photo.")}</p>
        )}
        <p className="my-3 text-center text-xs text-muted-foreground">{t("או", "or")}</p>
        <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-card font-bold hover:bg-muted">
          <Camera className="h-5 w-5" aria-hidden="true" />{uploading ? t("מכינה תמונה…", "Preparing photo…") : t("העלאת תמונה שלי", "Upload my photo")}
          <input type="file" accept="image/*" onChange={upload} className="sr-only" />
        </label>
        <p className="mt-2 rounded-xl bg-sage/15 px-3 py-2 text-xs text-sage-foreground">{t("רק ציוד וחומרים, בלי תמונות של ילדים. התמונה נשמרת עם הפעילות במכשיר הזה.", "Equipment and materials only, no photos of children. The photo is kept with the activity on this device.")}</p>
        {current && <button type="button" onClick={() => onChoose(null)} className="mt-3 w-full rounded-full py-2 text-sm font-semibold text-muted-foreground underline">{t("בלי איור", "No picture")}</button>}
      </div>
    </div>
  );
}
