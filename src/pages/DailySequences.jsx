import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Check, Plus, Printer, RotateCcw, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { DAILY_SEQUENCE_TEMPLATES, stepsForDailySequence } from "@/lib/daily-sequences";

const storageKey = (templateId, gender) => `pp_daily_sequence_${templateId}_${gender}`;

export default function DailySequences() {
  const [templateId, setTemplateId] = useState(null);
  const [gender, setGender] = useState("girl");
  const [layout, setLayout] = useState("grid");
  const allSteps = useMemo(() => templateId ? stepsForDailySequence(templateId, gender) : [], [templateId, gender]);
  const [order, setOrder] = useState([]);
  const [completed, setCompleted] = useState(new Set());

  useEffect(() => {
    if (!templateId) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey(templateId, gender)) || "null");
      const defaultIds = allSteps.filter((step) => !step.optional).map((step) => step.id);
      const hasSavedChoice = saved && Array.isArray(saved.order);
      const validSaved = hasSavedChoice ? saved.order.filter((id) => allSteps.some((step) => step.id === id)) : [];
      setOrder(hasSavedChoice ? validSaved : defaultIds);
    } catch { setOrder(allSteps.filter((step) => !step.optional).map((step) => step.id)); }
    setCompleted(new Set());
  }, [templateId, gender, allSteps]);

  useEffect(() => {
    if (templateId) localStorage.setItem(storageKey(templateId, gender), JSON.stringify({ order }));
  }, [templateId, gender, order]);

  const selected = order.map((id) => allSteps.find((step) => step.id === id)).filter(Boolean);
  const missing = allSteps.filter((step) => !order.includes(step.id));
  const template = DAILY_SEQUENCE_TEMPLATES.find((item) => item.id === templateId);

  function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }

  if (!templateId) return (
    <AppShell mode="parent">
      <div className="mb-7"><h1 className="font-display text-4xl font-black">רצפים של פעולות יום־יומיות</h1><p className="mt-2 text-muted-foreground">בחרו רצף, סדרו את השלבים והדפיסו לוח חזותי ברור.</p></div>
      <div className="mb-6 rounded-3xl border border-sky/50 bg-sky/10 p-5 md:p-6">
        <h2 className="mb-2 font-display text-base font-bold">במה רצפים חזותיים עוזרים?</h2>
        <p className="text-sm leading-relaxed text-foreground/90">
          רצף חזותי מפרק פעולה יום־יומית לשלבים ברורים ומציג לילד/ה מה עושים עכשיו ומה מגיע אחר כך. הוא יכול להפחית חוסר ודאות,
          לתמוך בזכירת סדר הפעולות, לצמצם את הצורך בתזכורות חוזרות ולחזק עצמאות, התארגנות ותחושת הצלחה.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">{DAILY_SEQUENCE_TEMPLATES.map((item) => (
        <button key={item.id} type="button" onClick={() => setTemplateId(item.id)} className="group overflow-hidden rounded-3xl border border-sky/60 bg-white text-right shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex h-56 items-center justify-center bg-white p-4"><img src={item.cover} alt={`איור ${item.title}`} className="max-h-full max-w-full object-contain" /></div>
          <div className="border-t border-rose/40 bg-secondary/90 p-5"><h2 className="font-display text-xl font-black">{item.title}</h2><p className="mt-1 text-sm text-muted-foreground">{item.description}</p></div>
        </button>
      ))}</div>
    </AppShell>
  );

  return (
    <AppShell mode="parent">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden"><div><button onClick={() => setTemplateId(null)} className="mb-2 inline-flex items-center gap-1 text-sm font-bold text-muted-foreground"><ArrowRight className="h-4 w-4" /> חזרה לכל הרצפים</button><h1 className="font-display text-3xl font-black">{template?.title}</h1></div><div className="flex gap-2"><Button variant="outline" className="rounded-full" onClick={() => { setOrder(allSteps.filter((step) => !step.optional).map((step) => step.id)); setCompleted(new Set()); }}><RotateCcw className="h-4 w-4" /> איפוס</Button><Button className="rounded-full" onClick={() => window.print()}><Printer className="h-4 w-4" /> הדפסה</Button></div></div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden"><div className="flex gap-2"><button type="button" onClick={() => setGender("girl")} className={`rounded-full border px-5 py-2 text-sm font-bold ${gender === "girl" ? "border-primary bg-primary text-primary-foreground" : "bg-white"}`}>בת</button><button type="button" onClick={() => setGender("boy")} className={`rounded-full border px-5 py-2 text-sm font-bold ${gender === "boy" ? "border-primary bg-primary text-primary-foreground" : "bg-white"}`}>בן</button></div><div className="flex gap-2"><button type="button" onClick={() => setLayout("grid")} className={`rounded-full border px-4 py-2 text-sm font-bold ${layout === "grid" ? "border-sky bg-sky/30" : "bg-white"}`}>כרטיסים</button><button type="button" onClick={() => setLayout("column")} className={`rounded-full border px-4 py-2 text-sm font-bold ${layout === "column" ? "border-sky bg-sky/30" : "bg-white"}`}>רצף לאורך</button></div></div>
      <section className="daily-sequence-print rounded-[2rem] border border-border/60 bg-white p-5 md:p-7">
        <div className="mb-5 hidden items-center justify-between border-b border-border pb-3 print:flex"><img src="/boo-nesahek-logo.png" alt="בואו נשחק" className="h-14 w-16 object-contain" /><h1 className="font-display text-3xl font-black">{template?.title}</h1><span className="w-16" /></div>
        <ol className={`grid gap-4 ${layout === "column" ? "mx-auto max-w-2xl grid-cols-1" : "sm:grid-cols-2 lg:grid-cols-3"}`}>{selected.map((step, index) => {
          const done = completed.has(step.id);
          return <li key={step.id} className={`relative overflow-hidden rounded-3xl border-2 transition ${done ? "border-sage bg-sage/20" : "border-sky/70 bg-white"}`}>
            <div className="flex h-44 items-center justify-center p-1"><img src={step.image} alt={`איור: ${step.label}`} className="h-full w-full object-contain" /></div>
            <div className="flex items-center gap-3 border-t border-rose/35 bg-secondary/85 p-3"><button type="button" onClick={() => setCompleted((current) => { const next = new Set(current); next.has(step.id) ? next.delete(step.id) : next.add(step.id); return next; })} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 ${done ? "border-sage-foreground bg-sage text-sage-foreground" : "border-border bg-white text-transparent"}`}><Check className="h-5 w-5" /></button><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white font-black">{index + 1}</span><p className="font-bold leading-snug">{step.label}</p></div>
            <div className="absolute left-2 top-2 flex gap-1 print:hidden"><button onClick={() => move(index, -1)} disabled={index === 0} className="rounded-full bg-white p-1.5 shadow disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button><button onClick={() => move(index, 1)} disabled={index === order.length - 1} className="rounded-full bg-white p-1.5 shadow disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button><button onClick={() => setOrder(order.filter((id) => id !== step.id))} className="rounded-full bg-white p-1.5 text-destructive shadow"><X className="h-4 w-4" /></button></div>
          </li>;
        })}</ol>
      </section>
      {missing.length ? <div className="mt-5 rounded-3xl border border-dashed border-border p-4 print:hidden"><h2 className="mb-1 font-bold">שלבים נוספים לבחירה</h2><p className="mb-3 text-sm text-muted-foreground">לחצו כדי להוסיף לרצף. ניתן להסיר כל שלב באמצעות ה־× שעל הכרטיס.</p><div className="flex flex-wrap gap-2">{missing.map((step) => <button key={step.id} onClick={() => setOrder([...order, step.id])} className="inline-flex items-center gap-1 rounded-full border bg-white px-3 py-2 text-sm font-bold"><Plus className="h-4 w-4" /> {step.label}</button>)}</div></div> : null}
    </AppShell>
  );
}
