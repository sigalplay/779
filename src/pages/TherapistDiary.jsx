import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Archive, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, Download, GripVertical, Plus, RotateCcw, Search, ShieldCheck, Sparkles, Trash2, Upload, UsersRound, ClipboardCheck, MessageCircle, PackageCheck, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TherapistDemoNotice } from "@/components/TherapistDemoNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addSession, archivePatient, createEncryptedClinicBackup, deletePatientPermanently, deleteSession, getAllocationStatus, getArchivedPatients, getPatients, getSessions, rescheduleSession, restoreEncryptedClinicBackup, restorePatient, savePatient, saveSession } from "@/lib/therapist-clinic";
import { toast } from "sonner";

const DAY_LABELS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
function dateKey(date) { return date.toISOString().slice(0, 10); }
function currentWeekDays(offset = 0) {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay() + offset * 7);
  return DAY_LABELS.map((label, index) => { const date = new Date(sunday); date.setDate(sunday.getDate() + index); return { key: dateKey(date), label, date: String(date.getDate()) }; });
}
function frameworkName(patient) {
  if (patient.settingName) return patient.settingName;
  return patient.setting === "kindergarten" ? "גן" : patient.setting === "school" ? "בית ספר" : patient.setting === "other" ? "אחר" : "עצמאית";
}

function PatientPill({ patient }) {
  if (!patient) return <span className="text-[11px] leading-tight">מטופל</span>;
  return <span className="block break-words text-[11px] font-bold leading-tight text-foreground md:text-xs">{patient.name}</span>;
}

export default function TherapistDiary() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState(() => getPatients());
  const [archivedPatients, setArchivedPatients] = useState(() => getArchivedPatients());
  const [showArchive, setShowArchive] = useState(false);
  const [archiveDropActive, setArchiveDropActive] = useState(false);
  const [draggingPatientId, setDraggingPatientId] = useState(null);
  const draggingPatientIdRef = useRef(null);
  const backupInputRef = useRef(null);
  const suppressPatientClickRef = useRef(false);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [settingFilter, setSettingFilter] = useState("all");
  const [activeStat, setActiveStat] = useState(null);
  const [sessions, setSessions] = useState(() => getSessions());
  const [moveRequest, setMoveRequest] = useState(null);
  const [addRequest, setAddRequest] = useState(null);
  const [patientDropRequest, setPatientDropRequest] = useState(null);
  const [dropTime, setDropTime] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [weekOffset, setWeekOffset] = useState(0);
  const weekDays = useMemo(() => currentWeekDays(weekOffset), [weekOffset]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("week");
  const [backupBusy, setBackupBusy] = useState(false);
  const todayKey = dateKey(new Date());
  const displayedDays = view === "day" && weekOffset === 0 ? weekDays.filter((day) => day.key === todayKey) : weekDays;
  const visibleSessions = useMemo(() => sessions.filter((session) => !session.archivedFromDiary), [sessions]);
  const todaySessions = useMemo(() => visibleSessions.filter((s) => s.date === todayKey), [visibleSessions, todayKey]);
  const activePatientList = showArchive ? archivedPatients : patients;
  const frameworkOptions = useMemo(() => [...new Map(activePatientList.map((patient) => { const name = frameworkName(patient); return [name, { name, color: patient.settingColor || "#A9CFAA" }]; })).values()], [activePatientList]);
  const filteredPatients = activePatientList.filter((p) => p.name.includes(search.trim()) && (settingFilter === "all" || frameworkName(p) === settingFilter));
  const completed = visibleSessions.filter((s) => s.status === "completed").length;
  const pending = visibleSessions.filter((s) => !["completed", "cancelled"].includes(s.status) && s.summary === "").length;
  const completedSessions = visibleSessions.filter((session) => session.status === "completed");
  const pendingSessions = visibleSessions.filter((session) => !["completed", "cancelled"].includes(session.status) && session.summary === "");
  const statCards = [
    { key: "today", label: "טיפולי היום", value: todaySessions.length, icon: Clock3 },
    { key: "patients", label: "מטופלים פעילים", value: patients.length, icon: UsersRound },
    { key: "completed", label: "סיכומים שהושלמו", value: completed, icon: ClipboardCheck },
    { key: "pending", label: "להשלמה", value: pending, icon: MessageCircle },
  ];
  const statItems = activeStat === "today" ? todaySessions : activeStat === "patients" ? patients : activeStat === "completed" ? completedSessions : activeStat === "pending" ? pendingSessions : [];
  function requestMove(event, targetDate) {
    event.preventDefault();
    const sessionId = event.dataTransfer.getData("text/session-id");
    const session = sessions.find((item) => item.id === sessionId);
    if (!session || session.date === targetDate) return;
    setMoveRequest({ session, targetDate });
  }
  function handleCalendarDrop(event, targetDate) {
    event.preventDefault();
    setDragOverDate(null);
    const patientId = event.dataTransfer.getData("application/x-patient-id") || event.dataTransfer.getData("text/patient-id") || event.dataTransfer.getData("text/plain") || draggingPatientIdRef.current || draggingPatientId;
    if (!patientId) { requestMove(event, targetDate); return; }
    const patient = patients.find((item) => item.id === patientId);
    if (!patient) return;
    setPatientDropRequest({ patient, targetDate });
    setDropTime(patient.treatmentSchedule?.time || "");
    setDraggingPatientId(null);
  }
  function confirmPatientDrop(permanent) {
    if (!patientDropRequest) return;
    const { patient, targetDate } = patientDropRequest;
    if (getSessions(patient.id).some((session) => session.date === targetDate && !session.hiddenFromDiary)) { toast.error("כבר קיים למטופל טיפול בתאריך הזה"); return; }
    const count = getSessions(patient.id).filter((session) => session.status !== "cancelled").length;
    addSession(patient.id, { date: targetDate, time: dropTime, title: `טיפול ${count + 1}`, status: "planned", generatedFromSchedule: false });
    if (permanent) {
      const day = new Date(`${targetDate}T12:00:00Z`).getUTCDay();
      const current = patient.treatmentSchedule || {};
      savePatient({ ...patient, treatmentSchedule: { ...current, frequency: "weekly", weekdays: [day], time: dropTime, startDate: targetDate, totalAllocation: current.totalAllocation || 12 } });
      setPatients(getPatients());
    }
    setSessions(getSessions());
    setPatientDropRequest(null);
    toast.success(permanent ? "הטיפול והיום הקבוע נשמרו" : "הטיפול נוסף ליומן");
  }
  function confirmMove(changeType) {
    if (!moveRequest) return;
    rescheduleSession(moveRequest.session.id, moveRequest.targetDate, changeType);
    setSessions(getSessions());
    setMoveRequest(null);
  }
  function beginAdd(date) {
    setAddRequest({ date });
    setSelectedPatientId("");
  }
  function assignKnownPatient() {
    const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);
    if (!selectedPatient || !addRequest) return;
    const count = getSessions(selectedPatient.id).length;
    const session = addSession(selectedPatient.id, { date: addRequest.date, title: `טיפול ${count + 1}`, generatedFromSchedule: false });
    setSessions(getSessions());
    setAddRequest(null);
    navigate(`/therapist/patient/${selectedPatient.id}?session=${session.id}`);
  }
  function restoreArchivedPatient(patientId) {
    restorePatient(patientId);
    setArchivedPatients(getArchivedPatients());
    setPatients(getPatients());
    toast.success("התיק שוחזר מהארכיון");
  }
  function removeArchivedPatient(patientId) {
    const patient = archivedPatients.find((item) => item.id === patientId);
    if (!patient) return;
    const approved = window.confirm(`למחוק לצמיתות את התיק של ${patient.name}? כל המפגשים, התוכניות והמידע בתיק יימחקו מהמחשב ולא יהיה אפשר לבטל את הפעולה. אם יש גיבוי מוצפן קודם, ניתן יהיה לשחזר ממנו.`);
    if (!approved) return;
    deletePatientPermanently(patientId);
    setArchivedPatients(getArchivedPatients());
    setSessions(getSessions());
    toast.success("תיק המטופל נמחק לצמיתות");
  }
  function archiveActivePatient(patientId) {
    const patient = patients.find((item) => item.id === patientId);
    if (!patient || !window.confirm(`להעביר את התיק של ${patient.name} לארכיון?`)) return;
    archivePatient(patientId);
    setPatients(getPatients());
    setArchivedPatients(getArchivedPatients());
    setSessions(getSessions());
    toast.success("תיק המטופל הועבר לארכיון");
  }
  function setSessionStatus(session, status) {
    saveSession({
      ...session,
      status,
      ...(status === "completed" ? { completedAt: new Date().toISOString() } : {}),
      ...(status === "cancelled" ? { cancelledAt: new Date().toISOString() } : {}),
    });
    setSessions(getSessions());
    toast.success(status === "completed" ? "הטיפול סומן כבוצע" : "הטיפול סומן כמבוטל");
  }
  function removeSessionFromDiary(session) {
    if (!window.confirm(`למחוק את ${session.title} מהיומן?`)) return;
    deleteSession(session.id);
    setSessions(getSessions());
    toast.success("הטיפול נמחק מהיומן");
  }
  function dropPatientInArchive(event) {
    event.preventDefault();
    setArchiveDropActive(false);
    const patientId = event.dataTransfer.getData("application/x-patient-id") || event.dataTransfer.getData("text/patient-id") || draggingPatientIdRef.current || draggingPatientId;
    if (!patientId || showArchive) return;
    archivePatient(patientId);
    setPatients(getPatients());
    setArchivedPatients(getArchivedPatients());
    setSessions(getSessions());
    toast.success("תיק המטופל הועבר לארכיון");
    setDraggingPatientId(null);
  }
  async function downloadEncryptedBackup() {
    const password = window.prompt("בחרי סיסמה לגיבוי (לפחות 8 תווים). חשוב לשמור אותה במקום בטוח:");
    if (password === null) return;
    if (password.length < 8) { toast.error("הסיסמה צריכה לכלול לפחות 8 תווים"); return; }
    const confirmation = window.prompt("הקלידי שוב את הסיסמה לאישור:");
    if (confirmation !== password) { toast.error("הסיסמאות אינן תואמות"); return; }
    setBackupBusy(true);
    try {
      const backup = await createEncryptedClinicBackup(password);
      const blob = new Blob([JSON.stringify(backup)], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `boo-nesahek-diary-backup-${new Date().toISOString().slice(0, 10)}.boo-backup`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("הגיבוי המוצפן הורד למחשב");
    } catch {
      toast.error("לא הצלחנו ליצור את הגיבוי. נסי שוב.");
    } finally {
      setBackupBusy(false);
    }
  }
  async function restoreFromEncryptedBackup(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const password = window.prompt("הקלידי את הסיסמה של קובץ הגיבוי:");
    if (password === null) return;
    setBackupBusy(true);
    try {
      const backup = JSON.parse(await file.text());
      if (!window.confirm("השחזור יחליף את כל נתוני היומן ותיקי המטופלים השמורים כעת במחשב זה. להמשיך?")) return;
      await restoreEncryptedClinicBackup(backup, password);
      setPatients(getPatients());
      setArchivedPatients(getArchivedPatients());
      setSessions(getSessions());
      setShowArchive(false);
      toast.success("היומן שוחזר מהגיבוי המוצפן");
    } catch (error) {
      toast.error(error?.message === "wrong-password" ? "הסיסמה שגויה או שהקובץ נפגם" : "זה אינו קובץ גיבוי תקין");
    } finally {
      setBackupBusy(false);
    }
  }

  return (
    <AppShell mode="therapist">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-card to-sage/10 p-5 shadow-sm md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sage-foreground"><CalendarDays className="h-5 w-5" /><span className="text-sm font-bold">המרחב שלי למטפלת</span></div>
              <h1 className="font-display text-3xl font-black md:text-4xl">היום שלי</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">יומן, מטופלים ותכנון טיפול — מחוברים ישירות לפעילויות של בואו נשחק.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input ref={backupInputRef} type="file" accept=".boo-backup,application/octet-stream" onChange={restoreFromEncryptedBackup} className="hidden" />
              <Button type="button" variant="outline" disabled={backupBusy} onClick={downloadEncryptedBackup} className="rounded-full"><Download className="h-4 w-4" /> הורדת גיבוי מוצפן</Button>
              <Button type="button" variant="outline" disabled={backupBusy} onClick={() => backupInputRef.current?.click()} className="rounded-full"><Upload className="h-4 w-4" /> שחזור מגיבוי</Button>
              <Button onClick={() => navigate("/therapist/build?tab=search")} className="rounded-full bg-sage text-sage-foreground"><Sparkles className="h-4 w-4" /> בנה לוח למפגש טיפולי</Button>
              <Button variant="outline" onClick={() => navigate("/therapist/patient/new")} className="rounded-full"><Plus className="h-4 w-4" /> מטופל חדש</Button>
            </div>
          </div>
        </section>

        <TherapistDemoNotice />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map(({ key, label, value, icon: Icon }) => (
            <button type="button" key={key} onClick={() => setActiveStat((current) => current === key ? null : key)} aria-expanded={activeStat === key} className={`rounded-3xl border bg-card p-4 text-right transition hover:-translate-y-0.5 hover:shadow-md ${activeStat === key ? "border-sage ring-2 ring-sage/15" : "border-border/60"}`}>
              <div className="mb-2 flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-sage-foreground" /><ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${activeStat === key ? "rotate-180" : ""}`} /></div></div>
              <div className="font-display text-2xl font-black">{value}</div>
            </button>
          ))}
        </div>
        {activeStat && <section className="rounded-3xl border border-sage/30 bg-card p-4 md:p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="font-display text-lg font-black">{statCards.find((card) => card.key === activeStat)?.label}</h2><p className="text-sm text-muted-foreground">פירוט מלא</p></div><button type="button" onClick={() => setActiveStat(null)} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted">סגירה</button></div>{statItems.length > 0 ? <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{statItems.map((item) => { const isPatient = activeStat === "patients"; const patient = isPatient ? item : patients.find((candidate) => candidate.id === item.patientId); return <button type="button" key={item.id} onClick={() => navigate(`/therapist/patient/${isPatient ? item.id : item.patientId}${isPatient ? "" : `?session=${item.id}`}`)} className="flex items-center gap-3 rounded-2xl border border-border/60 p-3 text-right transition hover:bg-muted"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black" style={{ backgroundColor: patient?.color || "#E8F3EC" }}>{patient?.name?.trim()?.charAt(0) || "?"}</div><div className="min-w-0 flex-1"><div className="font-bold">{patient?.name || "מטופל"}</div>{isPatient ? <div className="truncate text-xs text-muted-foreground">{frameworkName(item)} · {item.goals?.slice(0, 2).join(" · ")}</div> : <div className="text-xs text-muted-foreground">{item.date}{item.time ? ` · ${item.time}` : ""} · {item.title}</div>}</div><ChevronLeft className="h-4 w-4 text-muted-foreground" /></button>; })}</div> : <div className="rounded-2xl bg-muted/50 p-6 text-center text-sm text-muted-foreground">אין פריטים להצגה</div>}</section>}

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-3xl border border-border/60 bg-card p-4 md:p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div><h2 className="font-display text-xl font-black">השבוע שלי</h2><p className="text-sm text-muted-foreground">גררי מטופל מהרשימה שבצד שמאל אל היום הרצוי</p></div>
              <div className="flex flex-wrap items-center gap-2"><div className="flex items-center gap-1 rounded-full border bg-background p-1"><button type="button" onClick={() => { setWeekOffset((value) => value - 1); setView("week"); }} aria-label="השבוע הקודם" className="rounded-full p-1.5 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button><button type="button" onClick={() => { setWeekOffset(0); setView("week"); }} className="rounded-full px-2 py-1 text-xs font-bold hover:bg-muted">השבוע הנוכחי</button><button type="button" onClick={() => { setWeekOffset((value) => value + 1); setView("week"); }} aria-label="השבוע הבא" className="rounded-full p-1.5 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button></div><div className="flex items-center gap-1 rounded-full border bg-background p-1">
                <button onClick={() => setView("week")} className={`rounded-full px-3 py-1.5 text-sm ${view === "week" ? "bg-foreground text-background" : "text-muted-foreground"}`}>שבוע</button>
                <button onClick={() => setView("day")} className={`rounded-full px-3 py-1.5 text-sm ${view === "day" ? "bg-foreground text-background" : "text-muted-foreground"}`}>היום</button>
              </div></div>
            </div>
            <div className={view === "day" ? "grid gap-2" : "grid gap-2 md:grid-cols-4 xl:grid-cols-7"}>
              {displayedDays.map((day) => {
                const daySessions = visibleSessions.filter((s) => s.date === day.key);
                return (
                  <div key={day.key} onDragEnter={(event) => { event.preventDefault(); if (draggingPatientIdRef.current || draggingPatientId || event.dataTransfer.types.includes("application/x-patient-id")) setDragOverDate(day.key); }} onDragOver={(event) => { event.preventDefault(); const isPatientDrag = Boolean(draggingPatientIdRef.current || draggingPatientId) || event.dataTransfer.types.includes("application/x-patient-id"); event.dataTransfer.dropEffect = isPatientDrag ? "copy" : "move"; if (isPatientDrag) setDragOverDate(day.key); }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragOverDate((current) => current === day.key ? null : current); }} onDrop={(event) => handleCalendarDrop(event, day.key)} className={`min-h-[260px] rounded-2xl border p-2 transition-all ${view === "day" ? "mx-auto w-full max-w-2xl" : ""} ${dragOverDate === day.key ? "scale-[1.015] border-2 border-sage bg-sage/15 shadow-lg ring-4 ring-sage/15" : day.key === todayKey ? "border-sage/50 bg-sage/5" : "border-border/60 bg-background"}`}>
                    <div className="mb-3 flex items-center justify-between border-b border-border/60 pb-2"><div className="flex items-center gap-1"><span className="text-xs font-bold text-muted-foreground">{day.label}</span><button type="button" onClick={() => beginAdd(day.key)} aria-label={`הוספת טיפול בתאריך ${day.key}`} title="הוספת טיפול" className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-sage/15 hover:text-sage-foreground"><Plus className="h-4 w-4" /></button></div><span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-black ${day.key === todayKey ? "bg-sage text-sage-foreground" : "bg-muted"}`}>{day.date}</span></div>
                    <div className="space-y-2">
                      {daySessions.map((s) => {
                        const patient = patients.find((p) => p.id === s.patientId);
                        const completed = s.status === "completed";
                        const cancelled = s.status === "cancelled";
                        return <div key={s.id} draggable onDragStart={(event) => { event.dataTransfer.setData("text/session-id", s.id); event.dataTransfer.effectAllowed = "move"; }} className={`w-full cursor-grab overflow-hidden rounded-2xl border text-right shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing ${completed ? "border-emerald-300 bg-emerald-50" : cancelled ? "border-red-300 bg-red-50" : "border-border/60 bg-card"}`}>
                          <button type="button" onClick={() => navigate(`/therapist/patient/${s.patientId}?session=${s.id}`)} className="w-full p-2.5 text-right">
                            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground"><span>{s.time}</span><span className={completed ? "font-bold text-emerald-700" : cancelled ? "font-bold text-red-700" : "text-amber-700"}>{completed ? "בוצע" : cancelled ? "בוטל" : "מתוכנן"}</span></div>
                            <div className="mt-1"><PatientPill patient={patient} /></div>
                            <div className="mt-1 truncate text-[11px] text-muted-foreground">{s.title}</div>
                          </button>
                          <div className="grid grid-cols-3 border-t border-current/10 bg-white/45 text-[10px] font-bold">
                            <button type="button" onClick={() => setSessionStatus(s, "completed")} className={`flex items-center justify-center gap-1 px-1 py-2 transition hover:bg-emerald-100 ${completed ? "text-emerald-700" : "text-muted-foreground"}`} title="סימון כבוצע"><Check className="h-3.5 w-3.5" /> בוצע</button>
                            <button type="button" onClick={() => setSessionStatus(s, "cancelled")} className={`flex items-center justify-center gap-1 border-x border-current/10 px-1 py-2 transition hover:bg-red-100 ${cancelled ? "text-red-700" : "text-muted-foreground"}`} title="סימון כמבוטל"><X className="h-3.5 w-3.5" /> בוטל</button>
                            <button type="button" onClick={() => removeSessionFromDiary(s)} className="flex items-center justify-center gap-1 px-1 py-2 text-muted-foreground transition hover:bg-red-100 hover:text-red-700" title="מחיקה מהיומן"><Trash2 className="h-3.5 w-3.5" /> מחיקה</button>
                          </div>
                        </div>;
                      })}
                      {dragOverDate === day.key && draggingPatientId ? <div className="my-3 rounded-xl border-2 border-dashed border-sage bg-card/80 px-2 py-5 text-center text-xs font-bold text-sage-foreground">שחררי כאן כדי לשבץ ביום זה</div> : daySessions.length === 0 && <div className="py-10 text-center text-xs text-muted-foreground">אין טיפולים</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-3xl border border-border/60 bg-card p-5">
              <div className="mb-3 flex items-center justify-between gap-2"><div className="flex items-center gap-2">{showArchive ? <Archive className="h-5 w-5 text-sage-foreground" /> : <UsersRound className="h-5 w-5 text-sage-foreground" />}<div><h2 className="font-display text-lg font-black">{showArchive ? "ארכיון" : "המטופלים שלי"}</h2>{!showArchive && <p className="text-[11px] text-muted-foreground">אחזי בידית וגררי ליום ביומן</p>}</div></div><button type="button" onDragEnter={() => !showArchive && setArchiveDropActive(true)} onDragLeave={() => setArchiveDropActive(false)} onDragOver={(event) => { if (!showArchive) event.preventDefault(); }} onDrop={dropPatientInArchive} onClick={() => { setShowArchive((value) => !value); setSettingFilter("all"); setArchiveDropActive(false); }} className={`rounded-full border px-2.5 py-1 text-xs font-bold transition ${archiveDropActive ? "scale-110 border-amber-500 bg-amber-100 text-amber-900 ring-4 ring-amber-200/60" : "text-muted-foreground hover:bg-muted"}`}>{showArchive ? "חזרה לפעילים" : archiveDropActive ? "שחררי כאן" : "ארכיון"}</button></div>
              {!showArchive && draggingPatientId && <div onDragOver={(event) => { event.preventDefault(); setArchiveDropActive(true); }} onDragLeave={() => setArchiveDropActive(false)} onDrop={dropPatientInArchive} className={`mb-3 flex min-h-20 items-center justify-center rounded-2xl border-2 border-dashed p-3 text-center text-sm font-bold transition ${archiveDropActive ? "border-amber-500 bg-amber-100 text-amber-900" : "border-amber-300 bg-amber-50 text-amber-800"}`}><Archive className="ml-2 h-5 w-5" /> שחררי כאן להעברה לארכיון</div>}
              <div className="relative mb-3"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-2xl pr-9" placeholder="חיפוש מטופל" /></div>
              <div className="mb-3 flex flex-wrap gap-1.5"><button type="button" onClick={() => setSettingFilter("all")} className={`rounded-full border px-2.5 py-1 text-xs ${settingFilter === "all" ? "border-sage bg-sage/15 font-bold" : "border-border text-muted-foreground"}`}>הכל</button>{frameworkOptions.map((framework) => <button type="button" key={framework.name} onClick={() => setSettingFilter(framework.name)} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${settingFilter === framework.name ? "font-bold" : "text-muted-foreground"}`} style={{ borderColor: framework.color, backgroundColor: settingFilter === framework.name ? `${framework.color}33` : undefined }}><span className="h-2 w-2 rounded-full" style={{ backgroundColor: framework.color }} />{framework.name}</button>)}</div>
              <div className="space-y-2">{filteredPatients.map((p) => (showArchive ?
                <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border/60 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black" style={{ backgroundColor: p.color }}>{p.name?.trim()?.charAt(0) || "?"}</div>
                  <div className="min-w-0 flex-1"><div className="font-bold">{p.name}</div><div className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: `${p.settingColor || "#A9CFAA"}33` }}><span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.settingColor || "#A9CFAA" }} />{frameworkName(p)}</div></div><button type="button" onClick={() => restoreArchivedPatient(p.id)} aria-label={`שחזור התיק של ${p.name}`} title="שחזור מהארכיון" className="rounded-full p-2 text-sage-foreground hover:bg-sage/10"><RotateCcw className="h-4 w-4" /></button><button type="button" onClick={() => removeArchivedPatient(p.id)} aria-label={`מחיקה לצמיתות של התיק של ${p.name}`} title="מחיקה לצמיתות" className="rounded-full p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div> : <div key={p.id} draggable onClick={(event) => { if (suppressPatientClickRef.current) { event.preventDefault(); suppressPatientClickRef.current = false; return; } navigate(`/therapist/patient/${p.id}`); }} onKeyDown={(event) => { if (event.key === "Enter") navigate(`/therapist/patient/${p.id}`); }} role="link" tabIndex={0} onDragStart={(event) => { draggingPatientIdRef.current = p.id; suppressPatientClickRef.current = true; event.dataTransfer.setData("application/x-patient-id", p.id); event.dataTransfer.setData("text/patient-id", p.id); event.dataTransfer.setData("text/plain", p.id); event.dataTransfer.effectAllowed = "copy"; window.requestAnimationFrame(() => setDraggingPatientId(p.id)); }} onDragEnd={() => { setArchiveDropActive(false); setDragOverDate(null); setDraggingPatientId(null); draggingPatientIdRef.current = null; window.setTimeout(() => { suppressPatientClickRef.current = false; }, 250); }} className={`flex cursor-grab select-none items-center gap-3 rounded-2xl border p-3 transition active:cursor-grabbing ${draggingPatientId === p.id ? "border-sage bg-sage/10 opacity-60 shadow-md" : "border-border/60 hover:bg-muted"}`}>
                  <GripVertical className="h-5 w-5 shrink-0 text-sage-foreground" aria-hidden="true" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-black" style={{ backgroundColor: p.color }}>{p.name?.trim()?.charAt(0) || "?"}</div>
                  <div className="min-w-0 flex-1"><div className="font-bold">{p.name}</div><div className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs" style={{ backgroundColor: `${p.settingColor || "#A9CFAA"}33` }}><span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.settingColor || "#A9CFAA" }} />{frameworkName(p)}</div><div className="truncate text-xs text-muted-foreground">{p.goals.slice(0, 2).join(" · ")}</div>{(() => { const allocation = getAllocationStatus(p.id); return allocation.total > 0 && allocation.remaining <= 3 ? <div className="mt-1 text-[11px] font-bold text-amber-700">נותרו {allocation.remaining} טיפולים</div> : null; })()}</div><span role="button" tabIndex={0} onClick={(event) => { event.preventDefault(); event.stopPropagation(); archiveActivePatient(p.id); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); event.stopPropagation(); archiveActivePatient(p.id); } }} aria-label={`העברת התיק של ${p.name} לארכיון`} title="העברה לארכיון" className="rounded-full p-2 text-amber-700 transition hover:bg-amber-100"><Archive className="h-4 w-4" /></span><ChevronLeft className="h-4 w-4 text-muted-foreground" />
                </div>))}{filteredPatients.length === 0 && <div className="rounded-2xl bg-muted/50 p-4 text-center text-sm text-muted-foreground">{showArchive ? "הארכיון ריק" : "לא נמצאו מטופלים"}</div>}</div>
            </section>
            <section className="rounded-3xl border border-sage/30 bg-sage/10 p-5">
              <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sage-foreground" /><div><h3 className="font-bold">מרחב מקצועי אישי</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">השתמשי בשם פרטי בלבד, ללא שם משפחה או פרט מזהה נוסף. המידע נשמר בדפדפן במכשיר זה בלבד.</p></div></div>
            </section>
            <section className="rounded-3xl border border-border/60 bg-card p-5"><div className="flex items-center gap-2"><PackageCheck className="h-5 w-5 text-sage-foreground" /><h3 className="font-bold">ציוד למחר</h3></div><p className="mt-2 text-sm text-muted-foreground">בגרסה הבאה הרשימה תיאסף אוטומטית מהטיפולים שתכננת.</p></section>
          </aside>
        </div>
        {moveRequest && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl"><h2 className="font-display text-xl font-black">שינוי מועד טיפול</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">העברת את {moveRequest.session.title} לתאריך {moveRequest.targetDate}. האם השינוי חד־פעמי או קבוע לכל סדרת הטיפולים?</p><div className="mt-5 grid gap-2"><Button onClick={() => confirmMove("once")} variant="outline" className="rounded-full">שינוי חד־פעמי</Button><Button onClick={() => confirmMove("permanent")} className="rounded-full bg-sage text-sage-foreground">שינוי קבוע בסדרה</Button><Button onClick={() => setMoveRequest(null)} variant="ghost" className="rounded-full">ביטול</Button></div></div></div>}
        {patientDropRequest && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl"><h2 className="font-display text-xl font-black">שיבוץ {patientDropRequest.patient.name}</h2><p className="mt-2 text-sm text-muted-foreground">בחרי שעה לתאריך {patientDropRequest.targetDate}. האם זה היום הקבוע?</p><label className="mb-1 mt-4 block text-sm font-bold">שעת הטיפול</label><Input type="time" value={dropTime} onChange={(event) => setDropTime(event.target.value)} className="rounded-2xl" /><div className="mt-5 grid gap-2"><Button onClick={() => confirmPatientDrop(true)} className="rounded-full bg-sage text-sage-foreground">כן, זה היום הקבוע</Button><Button onClick={() => confirmPatientDrop(false)} variant="outline" className="rounded-full">לא, שיבוץ חד פעמי</Button><Button onClick={() => setPatientDropRequest(null)} variant="ghost" className="rounded-full">ביטול</Button></div></div></div>}
        {addRequest && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl"><h2 className="font-display text-xl font-black">הוספת טיפול ליום {addRequest.date}</h2><p className="mt-2 text-sm text-muted-foreground">בחרי מטופל לפי שמו הפרטי.</p><select autoFocus value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)} className="mt-4 h-11 w-full rounded-2xl border border-input bg-background px-3"><option value="">בחירת מטופל</option>{patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}</select><Button onClick={assignKnownPatient} disabled={!selectedPatientId} className="mt-3 w-full rounded-full bg-sage text-sage-foreground">שיבוץ ביומן</Button><div className="mt-4 rounded-2xl border border-dashed p-4"><p className="text-sm font-semibold text-amber-700">יש להזין שם פרטי בלבד — ללא שם משפחה או פרט מזהה נוסף.</p><Button onClick={() => navigate(`/therapist/patient/new?date=${addRequest.date}`)} variant="outline" className="mt-3 w-full rounded-full"><Plus className="h-4 w-4" /> פתיחת תיק מטופל חדש</Button></div><Button onClick={() => setAddRequest(null)} variant="ghost" className="mt-2 w-full rounded-full">ביטול</Button></div></div>}
      </div>
    </AppShell>
  );
}
