import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Archive, ArrowRight, CalendarPlus, Check, ChevronDown, ChevronLeft, ChevronUp, ClipboardList, MessageCircle, Pencil, Play, Plus, Save, Sparkles, Target, Trash2, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { TherapistDemoNotice } from "@/components/TherapistDemoNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getActivity } from "@/lib/storage";
import { addNextScheduledSession, archivePatient, deleteSession, getAllocationStatus, getFrameworks, getNextPatientNumber, getPatient, getSessions, savePatient, saveSession, saveTreatmentSchedule } from "@/lib/therapist-clinic";

const GOALS = ["מוטוריקה עדינה", "מוטוריקה גסה", "תכנון מוטורי", "ויסות כוח", "ויסות חושי", "תיאום עין-יד", "גרפו-מוטוריקה", "תפקודים ניהוליים", "משחק משותף"];
const WEEKDAYS = [{ value: 0, label: "א׳" }, { value: 1, label: "ב׳" }, { value: 2, label: "ג׳" }, { value: 3, label: "ד׳" }, { value: 4, label: "ה׳" }, { value: 5, label: "ו׳" }, { value: 6, label: "ש׳" }];
const LEGACY_SETTINGS = { kindergarten: "גן", school: "בית ספר", independent: "עצמאית", other: "אחר" };
const BASE_FRAMEWORKS = ["קליניקה", "גן", "בית ספר"];

function ActivityChip({ id }) {
  const activity = getActivity(id);
  if (!activity) return null;
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background p-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-lg">{activity.emoji || "✨"}</div>
      <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{activity.title}</div><div className="text-xs text-muted-foreground">{activity.duration_min} דקות</div></div>
    </div>
  );
}

export default function TherapistPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = id === "new";
  const existing = !isNew ? getPatient(id) : null;
  const frameworkChoices = [...new Set([...BASE_FRAMEWORKS, ...getFrameworks().map((framework) => framework.name)])];
  const [patient, setPatient] = useState(existing || { id: "", patientNumber: getNextPatientNumber(), name: "", age: "", goals: [] });
  const [patientDetailsOpen, setPatientDetailsOpen] = useState(isNew);
  const [editingGoalsDetails, setEditingGoalsDetails] = useState(!existing?.goalsDetails);
  const [addingFramework, setAddingFramework] = useState(false);
  const [schedule, setSchedule] = useState(() => existing?.treatmentSchedule || { frequency: "weekly", weekdays: [new Date(`${searchParams.get("date") || new Date().toISOString().slice(0, 10)}T12:00:00Z`).getUTCDay()], time: "", startDate: searchParams.get("date") || new Date().toISOString().slice(0, 10), totalAllocation: 12 });
  const [sessions, setSessions] = useState(() => (existing ? getSessions(id) : []));
  const [activeSessionId, setActiveSessionId] = useState(searchParams.get("session") || sessions[0]?.id || null);
  const [tab, setTab] = useState(searchParams.get("session") ? "session" : "overview");
  const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
  const [summary, setSummary] = useState(activeSession?.summary || "");
  const [next, setNext] = useState(activeSession?.next || "");
  const selectedGoals = patient.goals || [];
  const goalText = useMemo(() => selectedGoals.length ? selectedGoals.join(" · ") : "עדיין לא הוגדרו מטרות", [selectedGoals]);
  const patientTitle = `${patient.name || "מטופל חדש"}${patient.age ? `, ${patient.age}` : ""}`;

  function toggleGoal(goal) {
    setPatient((p) => ({ ...p, goals: p.goals.includes(goal) ? p.goals.filter((g) => g !== goal) : [...p.goals, goal] }));
  }
  function savePatientData() {
    if (!patient.name?.trim()) {
      toast.error("יש להזין שם פרטי");
      return;
    }
    const saved = savePatient({ ...patient, age: Number(patient.age) || patient.age });
    setPatient(saved);
    toast.success("פרטי המטופל נשמרו");
    if (isNew) navigate(`/therapist/patient/${saved.id}`, { replace: true });
  }
  function saveGoalsDetails() {
    savePatientData();
    setEditingGoalsDetails(false);
  }
  function movePatientToArchive() {
    if (isNew || !window.confirm(`להעביר את התיק של ${patient.name} לארכיון? כל המידע יישמר וניתן יהיה לשחזר אותו.`)) return;
    archivePatient(patient.id);
    toast.success("התיק הועבר לארכיון");
    navigate("/therapist/diary", { replace: true });
  }
  function chooseSession(session) {
    setActiveSessionId(session.id);
    setSummary(session.summary || "");
    setNext(session.next || "");
    setTab("session");
  }
  const allocation = !isNew ? getAllocationStatus(patient.id) : { total: 0, completed: 0, remaining: 0 };
  function saveSchedule() {
    if (isNew) { toast.error("יש לשמור קודם את פרטי המטופל"); return; }
    if (!schedule.weekdays?.length && schedule.frequency !== "daily") { toast.error("יש לבחור יום טיפול"); return; }
    const saved = saveTreatmentSchedule(patient.id, schedule);
    setPatient(saved);
    setSessions(getSessions(patient.id));
    toast.success("סדרת הטיפולים נוספה ליומן");
  }
  function toggleScheduleDay(day) {
    setSchedule((current) => {
      if (current.frequency === "weekly") return { ...current, weekdays: [day] };
      return { ...current, weekdays: current.weekdays.includes(day) ? current.weekdays.filter((item) => item !== day) : [...current.weekdays, day].sort() };
    });
  }
  function addNextMeeting() {
    if (isNew) return;
    const result = addNextScheduledSession(patient.id);
    if (!result.session) {
      toast.error(result.reason === "no-schedule" ? "יש להגדיר קודם סדרת טיפולים" : "לא ניתן להוסיף טיפול מעבר להקצאה");
      return;
    }
    setSessions(getSessions(patient.id));
    chooseSession(result.session);
    toast.success("המפגש הבא נוסף");
  }
  function removeSession(session) {
    const approved = window.confirm(`למחוק את ${session.title}? לא ניתן לבטל את המחיקה.`);
    if (!approved) return;
    deleteSession(session.id);
    const updated = getSessions(patient.id);
    setSessions(updated);
    if (activeSessionId === session.id) {
      const replacement = updated[0] || null;
      setActiveSessionId(replacement?.id || null);
      setSummary(replacement?.summary || "");
      setNext(replacement?.next || "");
      setTab(replacement ? "session" : "overview");
    }
    toast.success("הטיפול נמחק");
  }
  function saveSessionData() {
    if (!activeSession) return;
    saveSession({ ...activeSession, summary, next, status: "completed" });
    setSessions(getSessions(patient.id));
    toast.success("הטיפול נשמר");
  }
  function setPatientSessionStatus(session, status) {
    saveSession({ ...session, status, ...(status === "completed" ? { completedAt: new Date().toISOString() } : {}), ...(status === "cancelled" ? { cancelledAt: new Date().toISOString() } : {}) });
    setSessions(getSessions(patient.id));
    toast.success(status === "completed" ? "הטיפול סומן כבוצע" : "הטיפול סומן כמבוטל");
  }
  function addActivity() {
    if (!patient.id) return;
    const sessionPart = activeSession ? `&session=${activeSession.id}` : "";
    navigate(`/therapist/build?tab=search&patient=${patient.id}${sessionPart}&returnTo=patient`);
  }
  function startTreatment() {
    if (!activeSession) return;
    navigate(`/therapist/build?view=session&patient=${patient.id}&session=${activeSession.id}`);
  }

  return (
    <AppShell mode="therapist">
      <div className="space-y-6">
        <TherapistDemoNotice compact />
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><Link to="/therapist/diary" className="inline-flex items-center gap-1 hover:text-foreground"><ArrowRight className="h-4 w-4" /> יומן</Link><ChevronLeft className="h-4 w-4" /><span>{patient.name || "מטופל חדש"}</span></div>

        <section className="rounded-[2rem] border border-border/60 bg-card p-5 shadow-sm md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-sage/20 text-sage-foreground"><UserRound className="h-7 w-7" /></div>
              <div><div className="text-sm font-bold text-sage-foreground">תיק מטופל</div><h1 className="font-display text-3xl font-black">{patientTitle}</h1><p className="mt-1 text-sm text-muted-foreground">{patientDetailsOpen ? goalText : `${sessions.length} מפגשים${allocation.total > 0 ? ` · ${allocation.remaining} מתוך ${allocation.total} טיפולים נותרו` : ""}`}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 self-start">
              <Button type="button" variant="outline" onClick={movePatientToArchive} disabled={isNew} className="rounded-full text-muted-foreground hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"><Archive className="h-4 w-4" /> העברה לארכיון</Button>
              <button type="button" onClick={() => setPatientDetailsOpen((open) => !open)} aria-expanded={patientDetailsOpen} aria-controls="patient-file-details" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-bold transition hover:bg-muted">{patientDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}{patientDetailsOpen ? "סגירת פרטי התיק" : "פתיחת פרטי התיק"}</button>
            </div>
          </div>

          {patientDetailsOpen && <div id="patient-file-details">
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div><label className="mb-1.5 block text-sm font-bold">שם פרטי</label><Input value={patient.name || ""} onChange={(e) => setPatient((p) => ({ ...p, name: e.target.value }))} placeholder="שם פרטי בלבד" className="rounded-2xl" /><p className="mt-1 text-xs font-semibold text-amber-700">אין להזין שם משפחה או פרט מזהה נוסף.</p></div><div><label className="mb-1.5 block text-sm font-bold">גיל</label><Input type="number" value={patient.age} onChange={(e) => setPatient((p) => ({ ...p, age: e.target.value }))} placeholder="למשל: 4" className="rounded-2xl" /></div><div><label className="mb-1.5 block text-sm font-bold">מסגרת הטיפול</label>{addingFramework ? <Input autoFocus value={patient.settingName || ""} onChange={(e) => setPatient((p) => ({ ...p, settingName: e.target.value }))} placeholder="כתבי סוג מסגרת, ללא שם מזהה" className="rounded-2xl" /> : <select value={patient.settingName ?? LEGACY_SETTINGS[patient.setting] ?? "קליניקה"} onChange={(e) => { if (e.target.value === "__add__") { setAddingFramework(true); setPatient((p) => ({ ...p, settingName: "" })); } else { setPatient((p) => ({ ...p, settingName: e.target.value })); } }} className="h-10 w-full rounded-2xl border border-input bg-background px-3">{frameworkChoices.map((name) => <option key={name} value={name}>{name}</option>)}<option value="__add__">+ הוספת מסגרת</option></select>}</div><div><label className="mb-1.5 block text-sm font-bold">צבע המסגרת</label><div className="flex h-10 items-center gap-2 rounded-2xl border border-input bg-background px-3"><input type="color" value={patient.settingColor || "#A9CFAA"} onChange={(e) => setPatient((p) => ({ ...p, settingColor: e.target.value }))} className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0" /><span className="text-sm text-muted-foreground">בחירת צבע</span></div></div></div>
          <div className="mt-5 rounded-3xl bg-sage/10 p-4"><div className="mb-2 flex items-center gap-2"><Target className="h-5 w-5 text-sage-foreground" /><h2 className="font-display text-lg font-black">מטרות טיפול תפקודיות</h2></div><p className="mb-3 text-sm text-muted-foreground">המטרות נשארות בראש התיק כדי שיהיה קל לחבר כל טיפול למה שרוצים לקדם.</p><div className="flex flex-wrap gap-2">{GOALS.map((goal) => <button key={goal} onClick={() => toggleGoal(goal)} className={`rounded-full border px-3 py-1.5 text-sm transition ${selectedGoals.includes(goal) ? "border-sage bg-sage text-sage-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>{selectedGoals.includes(goal) && <Check className="me-1 inline h-3.5 w-3.5" />}{goal}</button>)}</div><div className="mt-4"><label className="mb-1.5 block text-sm font-bold">פירוט מטרות</label><Textarea value={patient.goalsDetails || ""} onChange={(event) => setPatient((current) => ({ ...current, goalsDetails: event.target.value }))} rows={2} className="rounded-2xl bg-card" placeholder="למשל: ישלים משימת גזירה לאורך קו ישר, תוך שמירה על אגודלים למעלה ובסיוע מילולי בלבד." /></div></div>
          <div className="mt-4 flex justify-end"><Button onClick={savePatientData} className="rounded-full bg-foreground text-background"><Save className="h-4 w-4" /> שמירת פרטי התיק</Button></div>

          <div id="treatment-schedule" className="mt-6 scroll-mt-6 rounded-3xl border border-sage/30 bg-sage/5 p-4 md:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-xl font-black">סדרת הטיפולים</h2><p className="mt-1 text-sm text-muted-foreground">הגדירי מתי הטיפול מתקיים וכמה טיפולים הוקצו. המפגשים יופיעו אוטומטית ביומן.</p></div>{allocation.total > 0 && <div className={`rounded-2xl px-4 py-2 text-sm font-bold ${allocation.remaining <= 3 ? "bg-amber-100 text-amber-800" : "bg-card"}`}>{allocation.remaining} מתוך {allocation.total} טיפולים נותרו</div>}</div>
            {allocation.total > 0 && allocation.remaining <= 3 && <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm font-bold text-amber-800">שימי לב: סדרת הטיפולים עומדת להסתיים.</div>}
            <div className="grid gap-4 md:grid-cols-4"><div><label className="mb-1.5 block text-sm font-bold">תדירות</label><select value={schedule.frequency} onChange={(e) => setSchedule((current) => ({ ...current, frequency: e.target.value, weekdays: e.target.value === "daily" ? [0,1,2,3,4,5,6] : current.weekdays.slice(0, e.target.value === "weekly" ? 1 : 2) }))} className="h-10 w-full rounded-2xl border border-input bg-background px-3"><option value="weekly">פעם בשבוע</option><option value="twice-weekly">פעמיים בשבוע</option><option value="daily">יומי</option></select></div><div><label className="mb-1.5 block text-sm font-bold">תאריך התחלה</label><Input type="date" value={schedule.startDate} onChange={(e) => setSchedule((current) => ({ ...current, startDate: e.target.value }))} className="rounded-2xl" /></div><div><label className="mb-1.5 block text-sm font-bold">שעה קבועה</label><Input type="time" value={schedule.time} onChange={(e) => setSchedule((current) => ({ ...current, time: e.target.value }))} className="rounded-2xl" /></div><div><label className="mb-1.5 block text-sm font-bold">הקצאת טיפולים</label><Input type="number" min="1" value={schedule.totalAllocation} onChange={(e) => setSchedule((current) => ({ ...current, totalAllocation: e.target.value }))} className="rounded-2xl" /></div></div>
            {schedule.frequency !== "daily" && <div className="mt-4"><label className="mb-2 block text-sm font-bold">ימי הטיפול</label><div className="flex flex-wrap gap-2">{WEEKDAYS.map((day) => { const selected = schedule.weekdays.includes(day.value); const limitReached = schedule.frequency === "twice-weekly" && !selected && schedule.weekdays.length >= 2; return <button type="button" key={day.value} disabled={limitReached} onClick={() => toggleScheduleDay(day.value)} className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${selected ? "border-sage bg-sage text-sage-foreground" : "border-border bg-card disabled:opacity-30"}`}>{day.label}</button>; })}</div></div>}
            <div className="mt-4 flex justify-end"><Button onClick={saveSchedule} disabled={isNew} className="rounded-full bg-sage text-sage-foreground"><CalendarPlus className="h-4 w-4" /> שמירה והוספה ליומן</Button></div>
          </div>
          </div>}
        </section>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-border/60 bg-card p-4">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-black">רצף המפגשים</h2><button type="button" onClick={addNextMeeting} aria-label="הוספת המפגש הבא" title="הוספת המפגש הבא" className="rounded-full p-2 hover:bg-muted"><Plus className="h-4 w-4" /></button></div>
            <div className="space-y-2">{sessions.map((s) => { const completed = s.status === "completed"; const cancelled = s.status === "cancelled"; return <div key={s.id} className={`overflow-hidden rounded-2xl border ${completed ? "border-emerald-300 bg-emerald-50" : cancelled ? "border-red-300 bg-red-50" : activeSessionId === s.id ? "border-sage bg-sage/10" : "border-border/60 hover:bg-muted"}`}><div className="flex items-stretch"><button type="button" onClick={() => removeSession(s)} aria-label={`מחיקת ${s.title}`} title="מחיקת טיפול" className="flex w-11 shrink-0 items-center justify-center border-l border-border/60 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button><button type="button" onClick={() => chooseSession(s)} className="min-w-0 flex-1 p-3 text-right"><div className="flex items-center justify-between gap-2"><span className="font-bold">{s.title}</span><span className="text-xs text-muted-foreground">{s.date}</span></div><div className={`mt-1 text-xs font-bold ${completed ? "text-emerald-700" : cancelled ? "text-red-700" : "text-muted-foreground"}`}>{completed ? "בוצע" : cancelled ? "בוטל" : s.status === "in-progress" ? "בטיפול" : "מתוכנן"}{s.activities?.length ? ` · ${s.activities.length} פעילויות` : ""}</div></button></div><div className="grid grid-cols-2 border-t border-current/10 bg-white/40 text-xs font-bold"><button type="button" onClick={() => setPatientSessionStatus(s, "completed")} className="flex items-center justify-center gap-1 py-2 text-emerald-700 hover:bg-emerald-100"><Check className="h-3.5 w-3.5" /> בוצע</button><button type="button" onClick={() => setPatientSessionStatus(s, "cancelled")} className="flex items-center justify-center gap-1 border-r border-current/10 py-2 text-red-700 hover:bg-red-100"><X className="h-3.5 w-3.5" /> בוטל</button></div></div>; })}{sessions.length === 0 && <div className="rounded-2xl bg-muted p-4 text-center text-sm text-muted-foreground">עדיין אין מפגשים</div>}</div>
          </aside>

          <section className="rounded-3xl border border-border/60 bg-card p-5 md:p-6">
            <div className="mb-5 flex flex-wrap gap-2 border-b border-border/60 pb-4"><button onClick={() => setTab("overview")} className={`rounded-full px-4 py-2 text-sm ${tab === "overview" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>סקירה</button><button onClick={() => setTab("session")} disabled={!activeSession} className={`rounded-full px-4 py-2 text-sm ${tab === "session" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>טיפול</button><button onClick={() => setTab("communication")} className={`rounded-full px-4 py-2 text-sm ${tab === "communication" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>שיחות וממשקים</button></div>

            {tab === "overview" && <div className="space-y-5"><div><h2 className="font-display text-2xl font-black">{patientTitle}</h2><p className="mt-1 text-sm text-muted-foreground">סקירת התיק, המטרות ורצף המפגשים.</p></div><div className="space-y-3"><div className="w-full rounded-3xl border p-4 md:p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage/10"><Target className="h-5 w-5 text-sage-foreground" /></div><div><div className="font-bold">מטרות</div><div className="text-sm text-muted-foreground">{selectedGoals.length} מטרות מוגדרות</div></div></div>{selectedGoals.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{selectedGoals.map((goal) => <span key={goal} className="rounded-full bg-sage/10 px-3 py-1 text-xs">{goal}</span>)}</div>}{editingGoalsDetails ? <div className="mt-4"><label className="mb-1.5 block text-sm font-bold">פירוט מטרות</label><Textarea value={patient.goalsDetails || ""} onChange={(event) => setPatient((current) => ({ ...current, goalsDetails: event.target.value }))} rows={2} className="rounded-2xl" placeholder="כתבי כאן פירוט של המטרות הטיפוליות..." /><div className="mt-3 flex justify-end"><Button onClick={saveGoalsDetails} size="sm" className="rounded-full bg-sage text-sage-foreground"><Save className="h-4 w-4" /> שמירת פירוט המטרות</Button></div></div> : patient.goalsDetails ? <div className="mt-4 border-t border-border/60 pt-3"><div className="mb-2 flex items-center justify-between gap-3"><div className="text-sm font-bold">פירוט מטרות</div><button type="button" onClick={() => setEditingGoalsDetails(true)} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-muted-foreground hover:bg-muted"><Pencil className="h-3.5 w-3.5" /> עריכה</button></div><p className="whitespace-pre-wrap text-sm leading-6">{patient.goalsDetails}</p></div> : <button type="button" onClick={() => setEditingGoalsDetails(true)} className="mt-4 inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-bold text-muted-foreground hover:bg-muted"><Plus className="h-4 w-4" /> הוספת פירוט מטרות</button>}</div><div className="flex w-full items-center gap-3 rounded-3xl border p-4 md:p-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage/10"><ClipboardList className="h-5 w-5 text-sage-foreground" /></div><div><div className="font-bold">מפגשים</div><div className="text-sm text-muted-foreground">{sessions.length} מפגשים בתיק</div></div></div><div className="flex w-full items-center gap-3 rounded-3xl border p-4 md:p-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage/10"><MessageCircle className="h-5 w-5 text-sage-foreground" /></div><div><div className="font-bold">מעקב</div><div className="text-sm text-muted-foreground">אפשר להוסיף שיחות הורים, צוות והערות מעקב</div></div></div></div></div>}

            {tab === "session" && activeSession && <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-sm font-bold text-sage-foreground">{activeSession.title}</div><h2 className="font-display text-2xl font-black">תכנון וסיכום הטיפול</h2><p className="text-sm text-muted-foreground">{activeSession.date} · {activeSession.time || "שעה לא נקבעה"}</p></div><div className="flex flex-wrap gap-2"><Button onClick={addActivity} variant="outline" className="rounded-full"><Sparkles className="h-4 w-4" /> {(activeSession.treatmentPlanItems?.length || activeSession.activities?.length) ? "עריכת תוכנית" : "תכנון טיפול"}</Button>{(activeSession.treatmentPlanItems?.length > 0 || activeSession.activities?.length > 0) && activeSession.status !== "completed" && <Button onClick={startTreatment} className="rounded-full bg-sage text-sage-foreground"><Play className="h-4 w-4" /> התחל טיפול</Button>}</div></div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-3xl border p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">פעילויות שתוכננו</h3><span className="text-xs text-muted-foreground">מהמאגר של בואו נשחק</span></div><div className="space-y-2">{(activeSession.activities || []).map((a, i) => <ActivityChip key={`${a}-${i}`} id={a} />)}{!activeSession.activities?.length && <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">עדיין לא נבחרו פעילויות. אפשר להוסיף אותן דרך בניית הטיפול.</div>}</div></div>
                <div className="rounded-3xl border p-4"><h3 className="mb-3 font-bold">מטרות למפגש</h3><div className="flex flex-wrap gap-2">{selectedGoals.map((g) => <span key={g} className="rounded-full bg-sage/10 px-3 py-1.5 text-sm">{g}</span>)}</div>{patient.goalsDetails && <div className="mt-4 border-t border-border/60 pt-3"><div className="mb-1 text-xs font-bold text-muted-foreground">פירוט המטרות</div><p className="whitespace-pre-wrap text-sm leading-6">{patient.goalsDetails}</p></div>}</div>
              </div>
              <div className="rounded-3xl border p-4"><h3 className="mb-3 font-bold">סיכום הטיפול</h3><Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={6} placeholder="בגרסת ההדגמה אפשר להתנסות כאן. לפני שימוש ברשומות אמיתיות נחבר שכבת אחסון ואבטחה מתאימה." /></div>
              <div className="rounded-3xl border p-4"><h3 className="mb-3 font-bold">להמשך</h3><Textarea value={next} onChange={(e) => setNext(e.target.value)} rows={3} placeholder="מה כדאי להמשיך או לשנות בטיפול הבא?" /></div>
              <div className="flex justify-end"><Button onClick={saveSessionData} className="rounded-full bg-foreground text-background"><Save className="h-4 w-4" /> שמירת סיכום</Button></div>
            </div>}

            {tab === "communication" && <div className="space-y-4"><div><h2 className="font-display text-2xl font-black">שיחות וממשקים</h2><p className="mt-1 text-muted-foreground">המקום העתידי לתיעוד שיחת הורים, גננת או מטפלת אחרת. כרגע זה חלק מהדמו בלבד.</p></div><div className="grid gap-3 sm:grid-cols-3">{["שיחת הורים", "שיחת גננת / מורה", "שיחה עם מטפלת אחרת"].map((x) => <button key={x} className="rounded-3xl border border-dashed p-5 text-right hover:bg-muted"><MessageCircle className="mb-3 h-5 w-5 text-sage-foreground" /><div className="font-bold">{x}</div><div className="mt-1 text-xs text-muted-foreground">להוסיף בהמשך</div></button>)}</div></div>}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
