import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FolderOpen, Loader2, Plus, Sparkles, Trash2, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addActivity, deleteCustomActivity, getCustomActivities } from "@/lib/storage";
import { generateActivityDraft } from "@/lib/activity-generator";
import { illustrationCount, searchIllustrations } from "@/lib/illustration-search";

function findFirst(text, kind) {
  return searchIllustrations(text, kind)[0] || null;
}

function findAll(text, kind) {
  return searchIllustrations(text, kind);
}

function IllustrationPicker({ text, type, selected, onSelect }) {
  const [failedPaths, setFailedPaths] = useState(() => new Set());
  const selectedPaths = Array.isArray(selected) ? selected : [selected].filter(Boolean);
  const matches = findAll(text, type);
  const choices = [...new Set([...selectedPaths, ...matches])].filter((path) => !failedPaths.has(path));
  return (
    <div>
      {choices.length ? <p className="mb-1 text-xs text-muted-foreground">נמצאו {choices.length} איורים מתאימים · לחצי לבחירה</p> : null}
      <div className="grid max-h-64 grid-cols-4 gap-1 overflow-y-auto rounded-2xl sm:grid-cols-6">
      {choices.length ? choices.map((path) => (
        <button key={path} type="button" onClick={() => onSelect(type === "step" ? (selectedPaths.includes(path) ? selectedPaths.filter((item) => item !== path) : [...selectedPaths, path]) : path)} aria-label="בחירת איור" className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border bg-white p-1.5 ${selectedPaths.includes(path) ? "border-primary ring-2 ring-primary/25" : "border-border/60"}`}>
          <img src={path} alt="" onError={() => setFailedPaths((current) => new Set([...current, path]))} className="max-h-full max-w-full object-contain" />
        </button>
      )) : <span className="col-span-full flex h-16 items-center rounded-2xl border border-dashed border-border px-3 text-xs text-muted-foreground">לא נמצא איור מתאים</span>}
      </div>
    </div>
  );
}

export function ActivityGenerator() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState("home");
  const [savedActivities, setSavedActivities] = useState(() => getCustomActivities());
  const [idea, setIdea] = useState("");
  const [draft, setDraft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState(false);

  async function generate() {
    if (idea.trim().length < 3) return toast.error("כתבי רעיון קצר לפעילות");
    setLoading(true);
    try {
      const result = await generateActivityDraft(idea.trim());
      const activity = result.activity;
      const materialImages = Object.fromEntries(activity.materials.map((item) => [item, findFirst(item, "material")]));
      const steps = activity.steps.map((step) => {
        const images = findAll(step.text, "step");
        return { ...step, images, image: images[0] || null };
      });
      const heroImage = Object.values(materialImages).find(Boolean) || steps.map((step) => step.image).find(Boolean) || null;
      setDraft({ ...activity, material_images: materialImages, steps, hero_image: heroImage });
      setDemo(result.demo);
      toast.success("הפעילות מוכנה לבדיקה ועריכה");
    } catch {
      toast.error("לא הצלחנו ליצור פעילות כרגע. נסי שוב.");
    } finally {
      setLoading(false);
    }
  }

  function update(field, value) { setDraft((current) => ({ ...current, [field]: value })); }

  function updateMaterial(index, value) {
    const previous = draft.materials[index];
    const materials = draft.materials.map((item, i) => i === index ? value : item);
    const materialImages = { ...draft.material_images };
    delete materialImages[previous];
    materialImages[value] = findFirst(value, "material");
    setDraft({ ...draft, materials, material_images: materialImages });
  }

  function updateStep(index, text) {
    const images = findAll(text, "step");
    update("steps", draft.steps.map((step, i) => i === index ? { ...step, text, images, image: images[0] || null } : step));
  }

  function save() {
    if (!draft.title.trim() || !draft.steps.some((step) => step.text.trim())) return toast.error("יש להשלים שם ושלב אחד לפחות");
    const cleanMaterials = draft.materials.map((item) => item.trim()).filter(Boolean);
    const cleanMaterialImages = Object.fromEntries(
      cleanMaterials.map((material) => {
        const original = draft.materials.find((item) => item.trim() === material);
        return [material, draft.material_images?.[original] || draft.material_images?.[material] || findFirst(material, "material") || null];
      }),
    );
    const saved = addActivity({
      ...draft,
      title: draft.title.trim(),
      materials: cleanMaterials,
      material_images: cleanMaterialImages,
      steps: draft.steps.map((step, index) => {
        const images = step.images?.length ? step.images : [step.image].filter(Boolean);
        return { n: index + 1, text: step.text.trim(), images, image: images[0] || null };
      }).filter((step) => step.text),
      goals: draft.goals.map((item) => item.trim()).filter(Boolean),
    });
    toast.success("הפעילות נשמרה בפעילויות שלי");
    setSavedActivities(getCustomActivities());
    navigate(`/activity/${saved.id}?mode=therapist&returnPath=/therapist/build?tab=create&returnLabel=חזרה ליצירת פעילות`);
  }

  function removeSaved(id) {
    deleteCustomActivity(id);
    setSavedActivities(getCustomActivities());
    toast.success("הפעילות נמחקה");
  }

  if (screen === "home") {
    return (
      <section className="space-y-5 rounded-3xl border border-border/60 bg-card p-5 md:p-6">
        <div><h2 className="font-display text-2xl font-black">יצירת פעילות עם AI ואיורים</h2><p className="mt-1 text-sm text-muted-foreground">מה תרצי לעשות? המאגר כולל {illustrationCount().toLocaleString("he-IL")} איורים.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => setScreen("new")} className="group rounded-3xl border border-sage/55 bg-sage/15 p-6 text-right transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sage/35 text-sage-foreground"><WandSparkles className="h-6 w-6" /></span>
            <h3 className="font-display text-xl font-black">יצירת פעילות חדשה</h3>
            <p className="mt-1 text-sm text-muted-foreground">כותבים רעיון, בוחרים איורים ושומרים.</p>
          </button>
          <button type="button" onClick={() => setScreen("saved")} className="group rounded-3xl border border-rose/55 bg-secondary/75 p-6 text-right transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose/30 text-rose-foreground"><FolderOpen className="h-6 w-6" /></span>
            <h3 className="font-display text-xl font-black">הפעילויות שלי</h3>
            <p className="mt-1 text-sm text-muted-foreground">{savedActivities.length ? `${savedActivities.length} פעילויות שמורות` : "כאן יישמרו הפעילויות שתיצרי"}</p>
          </button>
        </div>
      </section>
    );
  }

  if (screen === "saved") {
    return (
      <section className="space-y-5 rounded-3xl border border-border/60 bg-card p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-2xl font-black">הפעילויות שלי</h2><p className="mt-1 text-sm text-muted-foreground">כל הפעילויות שיצרת נשמרות כאן.</p></div><Button variant="outline" className="rounded-full" onClick={() => setScreen("home")}><ArrowRight className="h-4 w-4" /> חזרה</Button></div>
        {savedActivities.length ? <div className="grid gap-4 sm:grid-cols-2">{savedActivities.map((activity) => (
          <article key={activity.id} className="overflow-hidden rounded-3xl border border-border/60 bg-background">
            <div className="flex h-40 items-center justify-center bg-white p-3"><img src={activity.hero_image || Object.values(activity.material_images || {}).find(Boolean) || "/icon-bank/manual/pencil-2.webp"} alt="" className="max-h-full max-w-full object-contain" /></div>
            <div className="p-4"><h3 className="font-display text-lg font-black">{activity.title}</h3><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{activity.short_description}</p><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" className="rounded-full" onClick={() => navigate(`/activity/${activity.id}?mode=therapist&returnPath=/therapist/build?tab=create&returnLabel=חזרה לפעילויות שלי`)}>הצג פעילות</Button><Button size="sm" variant="outline" className="rounded-full text-destructive" onClick={() => removeSaved(activity.id)}><Trash2 className="h-3.5 w-3.5" /> מחיקה</Button></div></div>
          </article>
        ))}</div> : <div className="rounded-3xl border border-dashed border-border p-10 text-center"><FolderOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" /><p className="font-bold">עדיין אין פעילויות שמורות</p><Button className="mt-4 rounded-full" onClick={() => setScreen("new")}><Plus className="h-4 w-4" /> יצירת פעילות ראשונה</Button></div>}
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-3xl border border-border/60 bg-card p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-2xl font-black">יצירת פעילות חדשה</h2><p className="mt-1 text-sm text-muted-foreground">כתבי רעיון קצר, והמערכת תכין ציוד ושלבים ותציג בכל שלב את הכלי שבו מבצעים את הפעולה.</p></div><Button variant="outline" className="rounded-full" onClick={() => { setDraft(null); setScreen("home"); }}><ArrowRight className="h-4 w-4" /> חזרה</Button></div>
      <div className="space-y-2"><Label htmlFor="activity-idea">מה תרצי להכין?</Label><div className="flex flex-col gap-2 sm:flex-row"><Input id="activity-idea" value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="לדוגמה: הכנת עוגיות קורנפלקס" onKeyDown={(event) => event.key === "Enter" && generate()} /><Button onClick={generate} disabled={loading} className="rounded-full">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} יצירת פעילות</Button></div></div>
      {draft ? <div className="space-y-6 border-t border-border/60 pt-5">
        {demo ? <div className="rounded-2xl bg-butter/50 px-4 py-3 text-sm">מצב הדגמה פעיל. חיפוש האיורים פועל על המאגר הקיים.</div> : null}
        <div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>שם הפעילות</Label><Input value={draft.title} onChange={(e) => update("title", e.target.value)} /></div><div className="space-y-2"><Label>משך בדקות</Label><Input type="number" min="5" max="120" value={draft.duration_min} onChange={(e) => update("duration_min", Number(e.target.value))} /></div></div>
        <div className="space-y-2"><Label>תיאור קצר</Label><Textarea value={draft.short_description} onChange={(e) => update("short_description", e.target.value)} /></div>
        <div><div className="mb-3 flex items-center justify-between"><h3 className="font-display text-lg font-bold">מה צריך?</h3><Button variant="outline" size="sm" className="rounded-full" onClick={() => setDraft({ ...draft, materials: [...draft.materials, ""], material_images: { ...draft.material_images, "": null } })}><Plus className="h-3.5 w-3.5" /> הוספה</Button></div><div className="grid gap-3 sm:grid-cols-2">
          {draft.materials.map((item, index) => <div key={index} className="space-y-2 rounded-2xl border border-border/60 p-2"><div className="flex items-center gap-2"><Input value={item} onChange={(e) => updateMaterial(index, e.target.value)} /><Button variant="ghost" size="icon" onClick={() => update("materials", draft.materials.filter((_, i) => i !== index))} aria-label="מחיקת פריט"><Trash2 className="h-4 w-4" /></Button></div><IllustrationPicker text={item} type="material" selected={draft.material_images?.[item]} onSelect={(path) => update("material_images", { ...draft.material_images, [item]: path })} /></div>)}
        </div></div>
        <div><div className="mb-3 flex items-center justify-between"><h3 className="font-display text-lg font-bold">שלבי הפעילות</h3><Button variant="outline" size="sm" className="rounded-full" onClick={() => update("steps", [...draft.steps, { n: draft.steps.length + 1, text: "", images: [], image: null }])}><Plus className="h-3.5 w-3.5" /> שלב</Button></div><div className="space-y-3">
          {draft.steps.map((step, index) => <div key={index} className="rounded-2xl border border-border/60 p-2"><div className="flex items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">{index + 1}</span><Textarea value={step.text} onChange={(e) => updateStep(index, e.target.value)} className="min-h-16" /><Button variant="ghost" size="icon" onClick={() => update("steps", draft.steps.filter((_, i) => i !== index))} aria-label="מחיקת שלב"><Trash2 className="h-4 w-4" /></Button></div><div className="mt-2 mr-10"><IllustrationPicker text={step.text} type="step" selected={step.images?.length ? step.images : [step.image].filter(Boolean)} onSelect={(images) => update("steps", draft.steps.map((item, i) => i === index ? { ...item, images, image: images[0] || null } : item))} /></div></div>)}
        </div></div>
        <div className="space-y-2"><Label>מטרות טיפוליות — מופרדות בפסיקים</Label><Input value={draft.goals.join(", ")} onChange={(e) => update("goals", e.target.value.split(","))} /></div>
        <div className="space-y-2"><Label>הורדת רמת הקושי</Label><Textarea value={draft.adaptations} onChange={(e) => update("adaptations", e.target.value)} /></div><div className="space-y-2"><Label>העלאת רמת הקושי</Label><Textarea value={draft.extensions} onChange={(e) => update("extensions", e.target.value)} /></div>
        <div className="flex flex-wrap gap-2"><Button onClick={save} className="rounded-full">שמירה בפעילויות שלי</Button><Button variant="outline" onClick={() => setDraft(null)} className="rounded-full">ביטול</Button></div>
      </div> : null}
    </section>
  );
}
