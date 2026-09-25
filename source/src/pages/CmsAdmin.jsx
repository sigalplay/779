import { useEffect, useMemo, useState } from "react";
import { Save, Trash2, Plus, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SEED_ACTIVITIES } from "@/lib/activities-data";
import { RECIPES } from "@/pages/TherapistRecipes";
import { EXPERIMENTS } from "@/pages/TherapistExperiments";
import { STORY_TEMPLATES } from "@/lib/social-story-templates";
import { deleteCmsRow, getCmsAdminRows, isCmsAdmin, saveCmsRow } from "@/lib/cms-content";
import { toast } from "sonner";

const TYPES = [
  { id: "activity", label: "פעילויות", items: SEED_ACTIVITIES },
  { id: "recipe", label: "מתכונים", items: RECIPES },
  { id: "experiment", label: "ניסויים", items: EXPERIMENTS },
  { id: "social_story", label: "סיפורים חברתיים", items: STORY_TEMPLATES },
];

export default function CmsAdmin() {
  const [allowed, setAllowed] = useState(null);
  const [type, setType] = useState("activity");
  const [rows, setRows] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("draft");
  const selectedType = TYPES.find((item) => item.id === type);
  const cmsById = useMemo(() => new Map(rows.filter((row) => row.content_type === type).map((row) => [row.content_id, row])), [rows, type]);

  useEffect(() => {
    isCmsAdmin().then(async (ok) => {
      setAllowed(ok);
      if (ok) setRows(await getCmsAdminRows());
    }).catch(() => setAllowed(false));
  }, []);

  function openItem(id) {
    const saved = cmsById.get(id);
    const base = selectedType.items.find((item) => item.id === id) || { id, title: "" };
    setSelectedId(id);
    setStatus(saved?.status || "draft");
    setDraft(JSON.stringify(saved?.payload || base, null, 2));
  }

  async function save() {
    try {
      const payload = JSON.parse(draft);
      const contentId = selectedId || payload.id;
      if (!contentId) return toast.error("יש להזין מזהה לפריט");
      await saveCmsRow({ content_type: type, content_id: contentId, payload: { ...payload, id: contentId }, status });
      setRows(await getCmsAdminRows());
      setSelectedId(contentId);
      toast.success(status === "published" ? "התוכן פורסם באתר" : "הטיוטה נשמרה");
    } catch (error) {
      toast.error(error instanceof SyntaxError ? "מבנה התוכן אינו תקין" : "לא ניתן לשמור את התוכן");
    }
  }

  async function removeOverride() {
    if (!selectedId || !window.confirm("למחוק את גרסת ה-CMS ולחזור לתוכן המקורי?")) return;
    await deleteCmsRow(type, selectedId);
    setRows(await getCmsAdminRows());
    openItem(selectedId);
    toast.success("גרסת ה-CMS נמחקה; התוכן המקורי נשמר");
  }

  if (allowed === null) return <div className="flex min-h-screen items-center justify-center">בודקת הרשאת ניהול…</div>;
  if (!allowed) return <AppShell mode="therapist"><div className="mx-auto max-w-xl rounded-3xl border bg-card p-8 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-sage-foreground" /><h1 className="mt-3 text-2xl font-black">ה‑CMS נעול</h1><p className="mt-2 text-muted-foreground">רק חשבון מנהלת שאושר מראש יכול לערוך ולפרסם תוכן.</p></div></AppShell>;

  return <AppShell mode="therapist"><div className="space-y-5">
    <div><h1 className="font-display text-3xl font-black">ניהול תוכן</h1><p className="text-muted-foreground">פעילויות, מתכונים, ניסויים וסיפורים בלבד. היומן אינו מחובר למסך זה.</p></div>
    <div className="flex flex-wrap gap-2">{TYPES.map((item) => <button key={item.id} onClick={() => { setType(item.id); setSelectedId(""); setDraft(""); }} className={`rounded-full border px-4 py-2 text-sm font-bold ${type === item.id ? "border-sage bg-sage/20" : "bg-card"}`}>{item.label}</button>)}</div>
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <section className="rounded-3xl border bg-card p-4">
        <Button variant="outline" className="mb-3 w-full rounded-full" onClick={() => { const id = `new-${Date.now()}`; setSelectedId(id); setStatus("draft"); setDraft(JSON.stringify({ id, title: "פריט חדש" }, null, 2)); }}><Plus className="h-4 w-4" /> פריט חדש</Button>
        <div className="max-h-[65vh] space-y-1 overflow-auto">{selectedType.items.map((item) => <button key={item.id} onClick={() => openItem(item.id)} className={`w-full rounded-xl p-2 text-right text-sm ${selectedId === item.id ? "bg-sage/20 font-bold" : "hover:bg-muted"}`}>{cmsById.has(item.id) ? "● " : ""}{item.title}</button>)}</div>
      </section>
      <section className="rounded-3xl border bg-card p-5">
        {draft ? <><label className="text-sm font-bold">מזהה קבוע</label><Input value={selectedId} readOnly className="mt-1" /><div className="mt-4 flex gap-2"><button onClick={() => setStatus("draft")} className={`rounded-full border px-3 py-1.5 text-sm ${status === "draft" ? "bg-muted font-bold" : ""}`}>טיוטה</button><button onClick={() => setStatus("published")} className={`rounded-full border px-3 py-1.5 text-sm ${status === "published" ? "bg-emerald-100 font-bold" : ""}`}>מפורסם</button></div><label className="mt-4 block text-sm font-bold">תוכן הפריט</label><p className="mb-2 text-xs text-muted-foreground">בשלב הבטא מוצג כל מבנה הפריט כדי שלא ייעלמו שדות מקצועיים.</p><Textarea value={draft} onChange={(event) => setDraft(event.target.value)} dir="ltr" className="min-h-[420px] font-mono text-xs" /><div className="mt-4 flex flex-wrap gap-2"><Button onClick={save} className="rounded-full bg-sage text-sage-foreground"><Save className="h-4 w-4" /> שמירה</Button>{cmsById.has(selectedId) && <Button onClick={removeOverride} variant="outline" className="rounded-full text-red-700"><Trash2 className="h-4 w-4" /> חזרה למקור</Button>}</div></> : <div className="py-20 text-center text-muted-foreground">בחרי פריט לעריכה או צרי פריט חדש</div>}
      </section>
    </div>
  </div></AppShell>;
}
