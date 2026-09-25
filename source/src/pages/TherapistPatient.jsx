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
import { useTranslator } from "@/lib/language";
import { sessionTitle, translatedTerm } from "@/lib/content-translations";

const GOALS = ["מוטוריקה עדינה", "מוטוריקה גסה", "תכנון מוטורי", "ויסות כוח", "ויסות חושי", "תיאום עין-יד", "גרפו-מוטוריקה", "תפקודים ניהוליים", "משחק משותף"];
const WEEKDAYS = [{ value: 0, label: "א׳", labelEn: "Sun" }, { value: 1, label: "ב׳", labelEn: "Mon" }, { value: 2, label: "ג׳", labelEn: "Tue" }, { value: 3, label: "ד׳", labelEn: "Wed" }, { value: 4, label: "ה׳", labelEn: "Thu" }, { value: 5, label: "ו׳", labelEn: "Fri" }, { value: 6, label: "ש׳", labelEn: "Sat" }];
const LEGACY_SETTINGS = { kindergarten: "גן", school: "בית ספר", independent: "עצמאית", other: "אחר" };
const BASE_FRAMEWORKS = ["קליניקה", "גן", "בית ספר"];

function ActivityChip({ id }) {
  const { t } = useTranslator();
  const activity = getActivity(id);
  if (!activity) return null;
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background p-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-lg">{activity.emoji || "✨"}</div>
      <div className="min-w-0 flex-1"><div className="truncate text-sm font-bold">{activity.title}</div><div className="text-xs text-muted-foreground">{activity.duration_min}{" "}{t("דקות", "minutes")}</div></div>
    </div>
  );
}

export default function TherapistPatient() {
  const { t, language } = useTranslator();
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
  const goalText = useMemo(() => selectedGoals.length ? selectedGoals.map((goal) => translatedTerm(goal, language)).join(" · ") : t("עדיין לא הוגדרו מטרות", "No goals set yet"), [selectedGoals, language]);
  const patientTitle = `${patient.name || t("מטופל חדש", "New client")}${patient.age ? `, ${patient.age}` : ""}`;

  function toggleGoal(goal) {
    setPatient((p) => ({ ...p, goals: p.goals.includes(goal) ? p.goals.filter((g) => g !== goal) : [...p.goals, goal] }));
  }
  function savePatientData() {
    if (!patient.name?.trim()) {
      toast.error(t("יש להזין שם פרטי", "Enter a first name"));
      return;
    }
    const saved = savePatient({ ...patient, age: Number(patient.age) || patient.age });
    setPatient(saved);
    toast.success(t("פרטי המטופל נשמרו", "Client details saved."));
    if (isNew) navigate(`/therapist/patient/${saved.id}`, { replace: true });
  }
  function saveGoalsDetails() {
    savePatientData();
    setEditingGoalsDetails(false);
  }
  function movePatientToArchive() {
    if (isNew || !window.confirm(t(`להעביר את התיק של ${patient.name} לארכיון? כל המידע יישמר וניתן יהיה לשחזר אותו.`, `Move ${patient.name}'s file to the archive? All information will be kept and can be restored.`))) return;
    archivePatient(patient.id);
    toast.success(t("התיק הועבר לארכיון", "File moved to archive."));
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
    if (isNew) { toast.error(t("יש לשמור קודם את פרטי המטופל", "Save the client details first.")); return; }
    if (!schedule.weekdays?.length && schedule.frequency !== "daily") { toast.error(t("יש לבחור יום טיפול", "Choose a session day.")); return; }
    const saved = saveTreatmentSchedule(patient.id, schedule);
    setPatient(saved);
    setSessions(getSessions(patient.id));
    toast.success(t("סדרת הטיפולים נוספה ליומן", "The session series was added to the calendar."));
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
      toast.error(result.reason === "no-schedule" ? t("יש להגדיר קודם סדרת טיפולים", "Set up a series of sessions first") : t("לא ניתן להוסיף טיפול מעבר להקצאה", "You can't add sessions beyond the allocation"));
      return;
    }
    setSessions(getSessions(patient.id));
    chooseSession(result.session);
    toast.success(t("המפגש הבא נוסף", "Next session added."));
  }
  function removeSession(session) {
    const approved = window.confirm(t(`למחוק את ${session.title}? לא ניתן לבטל את המחיקה.`, `Delete ${sessionTitle(session.title, language)}? This can't be undone.`));
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
    toast.success(t("הטיפול נמחק", "Session deleted."));
  }
  function saveSessionData() {
    if (!activeSession) return;
    saveSession({ ...activeSession, summary, next, status: "completed" });
    setSessions(getSessions(patient.id));
    toast.success(t("הטיפול נשמר", "Session saved."));
  }
  function setPatientSessionStatus(session, status) {
    saveSession({ ...session, status, ...(status === "completed" ? { completedAt: new Date().toISOString() } : {}), ...(status === "cancelled" ? { cancelledAt: new Date().toISOString() } : {}) });
    setSessions(getSessions(patient.id));
    toast.success(status === "completed" ? t("הטיפול סומן כבוצע", "Session marked as done") : t("הטיפול סומן כמבוטל", "Session marked as canceled"));
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
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground"><Link to="/therapist/diary" className="inline-flex items-center gap-1 hover:text-foreground"><ArrowRight className="h-4 w-4" />{" "}{t("יומן", "Calendar")}</Link><ChevronLeft className="h-4 w-4" /><span>{patient.name || t("מטופל חדש", "New client")}</span></div>

        <section className="rounded-[2rem] border border-border/60 bg-card p-5 shadow-sm md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-sage/20 text-sage-foreground"><UserRound className="h-7 w-7" /></div>
              <div><div className="text-sm font-bold text-sage-foreground">{t("תיק מטופל", "Client file")}</div><h1 className="font-display text-3xl font-black">{patientTitle}</h1><p className="mt-1 text-sm text-muted-foreground">{patientDetailsOpen ? goalText : t(`${sessions.length} מפגשים${allocation.total > 0 ? ` · ${allocation.remaining} מתוך ${allocation.total} טיפולים נותרו` : ""}`, `${sessions.length} sessions${allocation.total > 0 ? ` · ${allocation.remaining} of ${allocation.total} sessions remaining` : ""}`)}</p></div>
            </div>
            <div className="flex flex-wrap gap-2 self-start">
              <Button type="button" variant="outline" onClick={movePatientToArchive} disabled={isNew} className="rounded-full text-muted-foreground hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"><Archive className="h-4 w-4" />{" "}{t("העברה לארכיון", "Move to archive")}</Button>
              <button type="button" onClick={() => setPatientDetailsOpen((open) => !open)} aria-expanded={patientDetailsOpen} aria-controls="patient-file-details" className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-bold transition hover:bg-muted">{patientDetailsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}{patientDetailsOpen ? t("סגירת פרטי התיק", "Close file details") : t("פתיחת פרטי התיק", "Open file details")}</button>
            </div>
          </div>

          {patientDetailsOpen && <div id="patient-file-details">
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div><label className="mb-1.5 block text-sm font-bold">{t("שם פרטי", "First name")}</label><Input value={patient.name || ""} onChange={(e) => setPatient((p) => ({ ...p, name: e.target.value }))} placeholder={t("שם פרטי בלבד", "First name only")} className="rounded-2xl" /><p className="mt-1 text-xs font-semibold text-amber-700">{t("אין להזין שם משפחה או פרט מזהה נוסף.", "Don't enter a last name or any other identifying detail.")}</p></div><div><label className="mb-1.5 block text-sm font-bold">{t("גיל", "Age")}</label><Input type="number" value={patient.age} onChange={(e) => setPatient((p) => ({ ...p, age: e.target.value }))} placeholder={t("למשל: 4", "For example: 4")} className="rounded-2xl" /></div><div><label className="mb-1.5 block text-sm font-bold">{t("מסגרת הטיפול", "Therapy setting")}</label>{addingFramework ? <Input autoFocus value={patient.settingName || ""} onChange={(e) => setPatient((p) => ({ ...p, settingName: e.target.value }))} placeholder={t("כתבי סוג מסגרת, ללא שם מזהה", "Enter the type of setting, without an identifying name")} className="rounded-2xl" /> : <select value={patient.settingName ?? LEGACY_SETTINGS[patient.setting] ?? t("קליניקה", "Clinic")} onChange={(e) => { if (e.target.value === "__add__") { setAddingFramework(true); setPatient((p) => ({ ...p, settingName: "" })); } else { setPatient((p) => ({ ...p, settingName: e.target.value })); } }} className="h-10 w-full rounded-2xl border border-input bg-background px-3">{frameworkChoices.map((name) => <option key={name} value={name}>{translatedTerm(name, language)}</option>)}<option value="__add__">{t("+ הוספת מסגרת", "+ Add setting")}</option></select>}</div><div><label className="mb-1.5 block text-sm font-bold">{t("צבע המסגרת", "Setting color")}</label><div className="flex h-10 items-center gap-2 rounded-2xl border border-input bg-background px-3"><input type="color" value={patient.settingColor || "#A9CFAA"} onChange={(e) => setPatient((p) => ({ ...p, settingColor: e.target.value }))} className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0" /><span className="text-sm text-muted-foreground">{t("בחירת צבע", "Choose color")}</span></div></div></div>
          <div className="mt-5 rounded-3xl bg-sage/10 p-4"><div className="mb-2 flex items-center gap-2"><Target className="h-5 w-5 text-sage-foreground" /><h2 className="font-display text-lg font-black">{t("מטרות טיפול תפקודיות", "Functional therapy goals")}</h2></div><p className="mb-3 text-sm text-muted-foreground">{t("המטרות נשארות בראש התיק כדי שיהיה קל לחבר כל טיפול למה שרוצים לקדם.", "Goals stay at the top of the file, making it easy to connect each session to what you want to support.")}</p><div className="flex flex-wrap gap-2">{GOALS.map((goal) => <button key={goal} onClick={() => toggleGoal(goal)} className={`rounded-full border px-3 py-1.5 text-sm transition ${selectedGoals.includes(goal) ? "border-sage bg-sage text-sage-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted"}`}>{selectedGoals.includes(goal) && <Check className="me-1 inline h-3.5 w-3.5" />}{translatedTerm(goal, language)}</button>)}</div><div className="mt-4"><label className="mb-1.5 block text-sm font-bold">{t("פירוט מטרות", "Goal details")}</label><Textarea value={patient.goalsDetails || ""} onChange={(event) => setPatient((current) => ({ ...current, goalsDetails: event.target.value }))} rows={2} className="rounded-2xl bg-card" placeholder={t("למשל: ישלים משימת גזירה לאורך קו ישר, תוך שמירה על אגודלים למעלה ובסיוע מילולי בלבד.", "For example: complete a straight-line cutting task with thumbs up and verbal prompts only.")} /></div></div>
          <div className="mt-4 flex justify-end"><Button onClick={savePatientData} className="rounded-full bg-foreground text-background"><Save className="h-4 w-4" />{" "}{t("שמירת פרטי התיק", "Save file details")}</Button></div>

          <div id="treatment-schedule" className="mt-6 scroll-mt-6 rounded-3xl border border-sage/30 bg-sage/5 p-4 md:p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-xl font-black">{t("סדרת הטיפולים", "Course of therapy")}</h2><p className="mt-1 text-sm text-muted-foreground">{t("הגדירי מתי הטיפול מתקיים וכמה טיפולים הוקצו. המפגשים יופיעו אוטומטית ביומן.", "Set when sessions take place and how many were allocated. Sessions will appear automatically in the calendar.")}</p></div>{allocation.total > 0 && <div className={`rounded-2xl px-4 py-2 text-sm font-bold ${allocation.remaining <= 3 ? "bg-amber-100 text-amber-800" : "bg-card"}`}>{allocation.remaining}{" "}{t("מתוך", "out of")}{" "}{allocation.total}{" "}{t("טיפולים נותרו", "sessions remaining")}</div>}</div>
            {allocation.total > 0 && allocation.remaining <= 3 && <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 p-3 text-sm font-bold text-amber-800">{t("שימי לב: סדרת הטיפולים עומדת להסתיים.", "Please note: the course of therapy is about to end.")}</div>}
            <div className="grid gap-4 md:grid-cols-4"><div><label className="mb-1.5 block text-sm font-bold">{t("תדירות", "Frequency")}</label><select value={schedule.frequency} onChange={(e) => setSchedule((current) => ({ ...current, frequency: e.target.value, weekdays: e.target.value === "daily" ? [0,1,2,3,4,5,6] : current.weekdays.slice(0, e.target.value === "weekly" ? 1 : 2) }))} className="h-10 w-full rounded-2xl border border-input bg-background px-3"><option value="weekly">{t("פעם בשבוע", "Once a week")}</option><option value="twice-weekly">{t("פעמיים בשבוע", "Twice a week")}</option><option value="daily">{t("יומי", "Daily")}</option></select></div><div><label className="mb-1.5 block text-sm font-bold">{t("תאריך התחלה", "Start date")}</label><Input type="date" value={schedule.startDate} onChange={(e) => setSchedule((current) => ({ ...current, startDate: e.target.value }))} className="rounded-2xl" /></div><div><label className="mb-1.5 block text-sm font-bold">{t("שעה קבועה", "Regular time")}</label><Input type="time" value={schedule.time} onChange={(e) => setSchedule((current) => ({ ...current, time: e.target.value }))} className="rounded-2xl" /></div><div><label className="mb-1.5 block text-sm font-bold">{t("הקצאת טיפולים", "Session allocation")}</label><Input type="number" min="1" value={schedule.totalAllocation} onChange={(e) => setSchedule((current) => ({ ...current, totalAllocation: e.target.value }))} className="rounded-2xl" /></div></div>
            {schedule.frequency !== "daily" && <div className="mt-4"><label className="mb-2 block text-sm font-bold">{t("ימי הטיפול", "Session days")}</label><div className="flex flex-wrap gap-2">{WEEKDAYS.map((day) => { const selected = schedule.weekdays.includes(day.value); const limitReached = schedule.frequency === "twice-weekly" && !selected && schedule.weekdays.length >= 2; return <button type="button" key={day.value} disabled={limitReached} onClick={() => toggleScheduleDay(day.value)} className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold ${selected ? "border-sage bg-sage text-sage-foreground" : "border-border bg-card disabled:opacity-30"}`}>{language === "en" ? day.labelEn : day.label}</button>; })}</div></div>}
            <div className="mt-4 flex justify-end"><Button onClick={saveSchedule} disabled={isNew} className="rounded-full bg-sage text-sage-foreground"><CalendarPlus className="h-4 w-4" />{" "}{t("שמירה והוספה ליומן", "Save and add to calendar")}</Button></div>
          </div>
          </div>}
        </section>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-border/60 bg-card p-4">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-display text-lg font-black">{t("רצף המפגשים", "Session sequence")}</h2><button type="button" onClick={addNextMeeting} aria-label={t("הוספת המפגש הבא", "Add next session")} title={t("הוספת המפגש הבא", "Add next session")} className="rounded-full p-2 hover:bg-muted"><Plus className="h-4 w-4" /></button></div>
            <div className="space-y-2">{sessions.map((s) => { const completed = s.status === "completed"; const cancelled = s.status === "cancelled"; return <div key={s.id} className={`overflow-hidden rounded-2xl border ${completed ? "border-emerald-300 bg-emerald-50" : cancelled ? "border-red-300 bg-red-50" : activeSessionId === s.id ? "border-sage bg-sage/10" : "border-border/60 hover:bg-muted"}`}><div className="flex items-stretch"><button type="button" onClick={() => removeSession(s)} aria-label={t(`מחיקת ${s.title}`, `Delete ${sessionTitle(s.title, language)}`)} title={t("מחיקת טיפול", "Delete session")} className="flex w-11 shrink-0 items-center justify-center border-l border-border/60 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button><button type="button" onClick={() => chooseSession(s)} className="min-w-0 flex-1 p-3 text-right"><div className="flex items-center justify-between gap-2"><span className="font-bold">{sessionTitle(s.title, language)}</span><span className="text-xs text-muted-foreground">{s.date}</span></div><div className={`mt-1 text-xs font-bold ${completed ? "text-emerald-700" : cancelled ? "text-red-700" : "text-muted-foreground"}`}>{completed ? t("בוצע", "Completed") : cancelled ? t("בוטל", "Cancelled") : s.status === "in-progress" ? t("בטיפול", "In session") : t("מתוכנן", "Planned")}{s.activities?.length ? t(` · ${s.activities.length} פעילויות`, ` · ${s.activities.length} activities`) : ""}</div></button></div><div className="grid grid-cols-2 border-t border-current/10 bg-white/40 text-xs font-bold"><button type="button" onClick={() => setPatientSessionStatus(s, "completed")} className="flex items-center justify-center gap-1 py-2 text-emerald-700 hover:bg-emerald-100"><Check className="h-3.5 w-3.5" />{" "}{t("בוצע", "Completed")}</button><button type="button" onClick={() => setPatientSessionStatus(s, "cancelled")} className="flex items-center justify-center gap-1 border-r border-current/10 py-2 text-red-700 hover:bg-red-100"><X className="h-3.5 w-3.5" />{" "}{t("בוטל", "Cancelled")}</button></div></div>; })}{sessions.length === 0 && <div className="rounded-2xl bg-muted p-4 text-center text-sm text-muted-foreground">{t("עדיין אין מפגשים", "No sessions yet")}</div>}</div>
          </aside>

          <section className="rounded-3xl border border-border/60 bg-card p-5 md:p-6">
            <div className="mb-5 flex flex-wrap gap-2 border-b border-border/60 pb-4"><button onClick={() => setTab("overview")} className={`rounded-full px-4 py-2 text-sm ${tab === "overview" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>{t("סקירה", "Overview")}</button><button onClick={() => setTab("session")} disabled={!activeSession} className={`rounded-full px-4 py-2 text-sm ${tab === "session" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>{t("טיפול", "Session")}</button><button onClick={() => setTab("communication")} className={`rounded-full px-4 py-2 text-sm ${tab === "communication" ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>{t("שיחות וממשקים", "Conversations and collaboration")}</button></div>

            {tab === "overview" && <div className="space-y-5"><div><h2 className="font-display text-2xl font-black">{patientTitle}</h2><p className="mt-1 text-sm text-muted-foreground">{t("סקירת התיק, המטרות ורצף המפגשים.", "Overview of the file, goals, and session sequence.")}</p></div><div className="space-y-3"><div className="w-full rounded-3xl border p-4 md:p-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage/10"><Target className="h-5 w-5 text-sage-foreground" /></div><div><div className="font-bold">{t("מטרות", "Goals")}</div><div className="text-sm text-muted-foreground">{selectedGoals.length}{" "}{t("מטרות מוגדרות", "Defined goals")}</div></div></div>{selectedGoals.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{selectedGoals.map((goal) => <span key={goal} className="rounded-full bg-sage/10 px-3 py-1 text-xs">{translatedTerm(goal, language)}</span>)}</div>}{editingGoalsDetails ? <div className="mt-4"><label className="mb-1.5 block text-sm font-bold">{t("פירוט מטרות", "Goal details")}</label><Textarea value={patient.goalsDetails || ""} onChange={(event) => setPatient((current) => ({ ...current, goalsDetails: event.target.value }))} rows={2} className="rounded-2xl" placeholder={t("כתבי כאן פירוט של המטרות הטיפוליות...", "Enter therapy-goal details here...")} /><div className="mt-3 flex justify-end"><Button onClick={saveGoalsDetails} size="sm" className="rounded-full bg-sage text-sage-foreground"><Save className="h-4 w-4" />{" "}{t("שמירת פירוט המטרות", "Save goal details")}</Button></div></div> : patient.goalsDetails ? <div className="mt-4 border-t border-border/60 pt-3"><div className="mb-2 flex items-center justify-between gap-3"><div className="text-sm font-bold">{t("פירוט מטרות", "Goal details")}</div><button type="button" onClick={() => setEditingGoalsDetails(true)} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-muted-foreground hover:bg-muted"><Pencil className="h-3.5 w-3.5" />{" "}{t("עריכה", "Edit")}</button></div><p className="whitespace-pre-wrap text-sm leading-6">{patient.goalsDetails}</p></div> : <button type="button" onClick={() => setEditingGoalsDetails(true)} className="mt-4 inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-bold text-muted-foreground hover:bg-muted"><Plus className="h-4 w-4" />{" "}{t("הוספת פירוט מטרות", "Add goal details")}</button>}</div><div className="flex w-full items-center gap-3 rounded-3xl border p-4 md:p-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage/10"><ClipboardList className="h-5 w-5 text-sage-foreground" /></div><div><div className="font-bold">{t("מפגשים", "Sessions")}</div><div className="text-sm text-muted-foreground">{sessions.length}{" "}{t("מפגשים בתיק", "Sessions in file")}</div></div></div><div className="flex w-full items-center gap-3 rounded-3xl border p-4 md:p-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sage/10"><MessageCircle className="h-5 w-5 text-sage-foreground" /></div><div><div className="font-bold">{t("מעקב", "Follow-up")}</div><div className="text-sm text-muted-foreground">{t("אפשר להוסיף שיחות הורים, צוות והערות מעקב", "Add parent or team conversations and follow-up notes")}</div></div></div></div></div>}

            {tab === "session" && activeSession && <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-sm font-bold text-sage-foreground">{sessionTitle(activeSession.title, language)}</div><h2 className="font-display text-2xl font-black">{t("תכנון וסיכום הטיפול", "Session planning and summary")}</h2><p className="text-sm text-muted-foreground">{activeSession.date} · {activeSession.time || t("שעה לא נקבעה", "Time not set")}</p></div><div className="flex flex-wrap gap-2"><Button onClick={addActivity} variant="outline" className="rounded-full"><Sparkles className="h-4 w-4" /> {(activeSession.treatmentPlanItems?.length || activeSession.activities?.length) ? t("עריכת תוכנית", "Edit plan") : t("תכנון טיפול", "Plan session")}</Button>{(activeSession.treatmentPlanItems?.length > 0 || activeSession.activities?.length > 0) && activeSession.status !== "completed" && <Button onClick={startTreatment} className="rounded-full bg-sage text-sage-foreground"><Play className="h-4 w-4" />{" "}{t("התחל טיפול", "Start Session")}</Button>}</div></div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="rounded-3xl border p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">{t("פעילויות שתוכננו", "Planned activities")}</h3><span className="text-xs text-muted-foreground">{t("מהמאגר של בואו נשחק", "From the Let's Play library")}</span></div><div className="space-y-2">{(activeSession.activities || []).map((a, i) => <ActivityChip key={`${a}-${i}`} id={a} />)}{!activeSession.activities?.length && <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">{t("עדיין לא נבחרו פעילויות. אפשר להוסיף אותן דרך בניית הטיפול.", "No activities yet. Add activities from the Session Planner.")}</div>}</div></div>
                <div className="rounded-3xl border p-4"><h3 className="mb-3 font-bold">{t("מטרות למפגש", "Session goals")}</h3><div className="flex flex-wrap gap-2">{selectedGoals.map((g) => <span key={g} className="rounded-full bg-sage/10 px-3 py-1.5 text-sm">{translatedTerm(g, language)}</span>)}</div>{patient.goalsDetails && <div className="mt-4 border-t border-border/60 pt-3"><div className="mb-1 text-xs font-bold text-muted-foreground">{t("פירוט המטרות", "Goal details")}</div><p className="whitespace-pre-wrap text-sm leading-6">{patient.goalsDetails}</p></div>}</div>
              </div>
              <div className="rounded-3xl border p-4"><h3 className="mb-3 font-bold">{t("סיכום הטיפול", "Session summary")}</h3><Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={6} placeholder={t("בגרסת ההדגמה אפשר להתנסות כאן. לפני שימוש ברשומות אמיתיות נחבר שכבת אחסון ואבטחה מתאימה.", "Feel free to explore using the sample data. Secure storage must be set up before you enter real client information.")} /></div>
              <div className="rounded-3xl border p-4"><h3 className="mb-3 font-bold">{t("להמשך", "Continue")}</h3><Textarea value={next} onChange={(e) => setNext(e.target.value)} rows={3} placeholder={t("מה כדאי להמשיך או לשנות בטיפול הבא?", "What should be continued or changed in the next session?")} /></div>
              <div className="flex justify-end"><Button onClick={saveSessionData} className="rounded-full bg-foreground text-background"><Save className="h-4 w-4" />{" "}{t("שמירת סיכום", "Save summary")}</Button></div>
            </div>}

            {tab === "communication" && <div className="space-y-4"><div><h2 className="font-display text-2xl font-black">{t("שיחות וממשקים", "Conversations and collaboration")}</h2><p className="mt-1 text-muted-foreground">{t("המקום העתידי לתיעוד שיחת הורים, גננת או מטפלת אחרת. כרגע זה חלק מהדמו בלבד.", "A future space for documenting conversations with parents, teachers, or other providers. This feature is currently available for demonstration only.")}</p></div><div className="grid gap-3 sm:grid-cols-3">{[t("שיחת הורים", "Parent meeting"), t("שיחת גננת / מורה", "Preschool teacher / teacher meeting"), t("שיחה עם מטפלת אחרת", "Meeting with another therapist")].map((x) => <button key={x} className="rounded-3xl border border-dashed p-5 text-right hover:bg-muted"><MessageCircle className="mb-3 h-5 w-5 text-sage-foreground" /><div className="font-bold">{x}</div><div className="mt-1 text-xs text-muted-foreground">{t("להוסיף בהמשך", "Add later")}</div></button>)}</div></div>}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
