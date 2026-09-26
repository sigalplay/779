import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, GripVertical, Plus, Repeat, X } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslator } from "@/lib/language";
import { addPatient, hasCloudSession, listPatients } from "@/lib/session-board-cloud";
import { addAppointment, deleteAppointment, listAppointments, localDateKey, occursOn, previousDay, updateAppointment } from "@/lib/diary-cloud";

const DAY_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const DAY_LABELS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function weekDays(offset) {
  const sunday = new Date();
  sunday.setHours(12, 0, 0, 0);
  sunday.setDate(sunday.getDate() - sunday.getDay() + offset * 7);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + index);
    return { key: localDateKey(date), index, day: date.getDate(), month: date.getMonth() + 1 };
  });
}

const boardHref = (patientId, date) => `/therapist/build?view=session&patientBoard=${encodeURIComponent(patientId)}&boardDate=${date}`;

// The therapist's calendar: which client comes on which day. A click on an appointment opens that
// client's session board for the same date. Only names, dates and times are kept (no notes).
export default function TherapistDiary() {
  const { t, language } = useTranslator();
  const navigate = useNavigate();
  const signedIn = hasCloudSession();
  const [state, setState] = useState(signedIn ? "loading" : "signed-out");
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [form, setForm] = useState(null); // { date, patientId, time, weekly }
  const [removing, setRemoving] = useState(null); // { appointment, date }
  const [dropDay, setDropDay] = useState(null);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!signedIn) return undefined;
    let cancelled = false;
    Promise.all([listPatients(), listAppointments()])
      .then(([patientRows, appointmentRows]) => {
        if (cancelled) return;
        setPatients(Array.isArray(patientRows) ? patientRows : []);
        setAppointments(Array.isArray(appointmentRows) ? appointmentRows : []);
        setState("ready");
      })
      .catch(() => { if (!cancelled) setState("error"); });
    return () => { cancelled = true; };
  }, [signedIn]);

  const days = useMemo(() => weekDays(weekOffset), [weekOffset]);
  const todayKey = localDateKey(new Date());
  const patientName = (id) => patients.find((patient) => patient.id === id)?.display_name || t("מטופל", "Client");
  const dayLabel = (index) => (language === "en" ? DAY_LABELS_EN[index] : DAY_LABELS[index]);

  function appointmentsOn(dayKey) {
    return appointments
      .filter((appointment) => occursOn(appointment, dayKey))
      .sort((a, b) => (a.start_time || "99").localeCompare(b.start_time || "99"));
  }

  function openForm(date, patientId = "") {
    setRemoving(null);
    setForm({ date, patientId: patientId || patients[0]?.id || "", time: "", weekly: false });
  }

  async function submitForm(event) {
    event.preventDefault();
    if (!form?.patientId) return;
    setBusy(true);
    try {
      const row = await addAppointment({ patientId: form.patientId, date: form.date, time: form.time, weekly: form.weekly });
      if (row) setAppointments((all) => [...all, row]);
      setForm(null);
      toast.success(form.weekly ? t("השיבוץ השבועי נוסף ליומן", "Weekly appointment added") : t("השיבוץ נוסף ליומן", "Appointment added"));
    } catch {
      toast.error(t("לא הצלחנו לשמור את השיבוץ. נסי שוב.", "We could not save the appointment. Please try again."));
    }
    setBusy(false);
  }

  async function remove(mode) {
    const { appointment, date } = removing;
    setBusy(true);
    try {
      if (mode === "all" || !appointment.weekly || (mode === "from" && date <= appointment.start_date)) {
        await deleteAppointment(appointment.id);
        setAppointments((all) => all.filter((item) => item.id !== appointment.id));
      } else {
        const patch = mode === "once"
          ? { skipped_dates: [...(appointment.skipped_dates || []), date] }
          : { end_date: previousDay(date) };
        const row = await updateAppointment(appointment.id, patch);
        setAppointments((all) => all.map((item) => (item.id === appointment.id ? row || { ...item, ...patch } : item)));
      }
      setRemoving(null);
      toast.success(t("השיבוץ הוסר", "Appointment removed"));
    } catch {
      toast.error(t("לא הצלחנו להסיר את השיבוץ. נסי שוב.", "We could not remove the appointment. Please try again."));
    }
    setBusy(false);
  }

  async function createPatient(event) {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    try {
      const id = await addPatient(name);
      setPatients((all) => [{ id, display_name: name }, ...all]);
      setNewName("");
    } catch {
      toast.error(t("לא הצלחנו להוסיף את המטופל כרגע.", "We could not add the client right now."));
    }
    setBusy(false);
  }

  const first = days[0];
  const last = days[6];
  const rangeLabel = `${first.day}.${first.month} – ${last.day}.${last.month}`;

  return (
    <AppShell mode="therapist">
      <div className="mb-5">
        <h1 className="flex items-center gap-2 font-display text-3xl font-black"><CalendarDays className="h-7 w-7 text-sage-foreground" />{t("יומן", "Calendar")}</h1>
        <p className="mt-1 text-muted-foreground">{t("שבצי מטופלים לימים. לחיצה על שיבוץ פותחת את לוח המפגש של אותו מטופל באותו תאריך.", "Schedule clients on days. Select an appointment to open that client's session board for the date.")}</p>
      </div>

      {state === "signed-out" && (
        <div className="rounded-3xl border border-border/60 bg-card p-6">
          <h2 className="font-display text-xl font-bold">{t("היומן שמור בחשבון שלך", "Your calendar is saved to your account")}</h2>
          <p className="mt-2 text-muted-foreground">{t("התחברי כדי לשבץ מטופלים ולראות את היומן מכל מכשיר.", "Sign in to schedule clients and see your calendar on any device.")}</p>
          <Link to={`/auth?mode=login&redirect=${encodeURIComponent("/therapist/diary")}`} className="mt-4 inline-flex min-h-10 items-center rounded-full bg-foreground px-5 text-sm font-bold text-background">{t("התחברות", "Sign in")}</Link>
        </div>
      )}
      {state === "loading" && <p className="text-muted-foreground">{t("טוענת את היומן…", "Loading your calendar…")}</p>}
      {state === "error" && (
        <div className="rounded-3xl border border-border/60 bg-card p-6">
          <h2 className="font-display text-xl font-bold">{t("לא הצלחנו לטעון את היומן", "We could not load your calendar")}</h2>
          <p className="mt-2 text-muted-foreground">{t("ייתכן שצריך להתחבר מחדש. אם זה חוזר, נסי שוב מאוחר יותר.", "You may need to sign in again. If this keeps happening, try again later.")}</p>
          <Link to={`/auth?mode=login&redirect=${encodeURIComponent("/therapist/diary")}`} className="mt-4 inline-flex min-h-10 items-center rounded-full border border-border px-5 text-sm font-bold">{t("התחברות מחדש", "Sign in again")}</Link>
        </div>
      )}

      {state === "ready" && (
        <div className="grid gap-5 lg:grid-cols-[250px_1fr]">
          <aside className="h-fit rounded-3xl border border-border/60 bg-card p-4">
            <h2 className="font-display text-lg font-bold">{t("המטופלים שלי", "My clients")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{t("אפשר לגרור מטופל אל יום ביומן.", "Drag a client onto a day.")}</p>
            <ul className="mt-3 grid gap-2">
              {patients.map((patient) => (
                <li key={patient.id}>
                  <div
                    draggable
                    onDragStart={(event) => event.dataTransfer.setData("text/plain", patient.id)}
                    className="flex cursor-grab items-center gap-2 rounded-2xl border border-border/60 bg-background px-3 py-2 text-sm font-bold"
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate">{patient.display_name}</span>
                  </div>
                </li>
              ))}
              {!patients.length && <li className="text-sm text-muted-foreground">{t("עדיין לא הוספת מטופלים.", "You have not added any clients yet.")}</li>}
            </ul>
            <form onSubmit={createPatient} className="mt-4 grid gap-2">
              <label htmlFor="diaryNewPatient" className="text-sm font-bold">{t("הוספת מטופל", "Add a client")}</label>
              <div className="flex gap-2">
                <Input id="diaryNewPatient" value={newName} maxLength={80} onChange={(e) => setNewName(e.target.value)} placeholder={t("שם פרטי או כינוי", "First name or nickname")} />
                <Button type="submit" disabled={busy || !newName.trim()} className="rounded-full">{t("הוספה", "Add")}</Button>
              </div>
              <small className="text-xs text-muted-foreground">{t("מומלץ לא להזין שם מלא או מידע רפואי.", "We recommend not entering a full name or medical information.")}</small>
            </form>
          </aside>

          <section className="rounded-3xl border border-border/60 bg-card p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold tabular-nums">{rangeLabel}</h2>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="rounded-full" onClick={() => setWeekOffset((w) => w - 1)} aria-label={t("השבוע הקודם", "Previous week")}>{language === "en" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</Button>
                <Button variant="outline" className="rounded-full" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>{t("השבוע", "This week")}</Button>
                <Button variant="outline" size="icon" className="rounded-full" onClick={() => setWeekOffset((w) => w + 1)} aria-label={t("השבוע הבא", "Next week")}>{language === "en" ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-7 md:gap-2">
              {days.map((day) => {
                const items = appointmentsOn(day.key);
                const isToday = day.key === todayKey;
                const formHere = form?.date === day.key;
                return (
                  <div
                    key={day.key}
                    onDragOver={(event) => { event.preventDefault(); setDropDay(day.key); }}
                    onDragLeave={() => setDropDay((current) => (current === day.key ? null : current))}
                    onDrop={(event) => { event.preventDefault(); setDropDay(null); openForm(day.key, event.dataTransfer.getData("text/plain")); }}
                    className={cn("flex min-h-24 flex-col gap-2 rounded-2xl border p-2 md:min-h-64", isToday ? "border-sage bg-sage/10" : "border-border/60 bg-background", dropDay === day.key && "ring-2 ring-sage")}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={cn("text-sm font-bold", isToday && "text-sage-foreground")}>{dayLabel(day.index)} <span className="tabular-nums text-muted-foreground">{day.day}.{day.month}</span></span>
                      <button type="button" onClick={() => openForm(day.key)} className="grid h-7 w-7 place-items-center rounded-full border border-border/60 bg-card text-muted-foreground hover:bg-muted" aria-label={t("שיבוץ מטופל ביום הזה", "Schedule a client on this day")}><Plus className="h-4 w-4" /></button>
                    </div>

                    {items.map((appointment) => (
                      <div key={appointment.id} className="group relative rounded-xl border border-sage/40 bg-card">
                        <button type="button" onClick={() => navigate(boardHref(appointment.patient_id, day.key))} className="flex w-full flex-col items-start gap-0.5 px-2.5 py-2 pe-8 text-start" title={t("פתיחת לוח המפגש", "Open the session board")}>
                          <span className="text-sm font-bold leading-tight">{patientName(appointment.patient_id)}</span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            {appointment.start_time && <><Clock3 className="h-3 w-3" /><span className="tabular-nums">{appointment.start_time}</span></>}
                            {appointment.weekly && <Repeat className="h-3 w-3" aria-label={t("כל שבוע", "Every week")} />}
                          </span>
                        </button>
                        <button type="button" onClick={() => { setForm(null); setRemoving({ appointment, date: day.key }); }} className="absolute end-1 top-1 grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-muted" aria-label={t("הסרת השיבוץ", "Remove the appointment")}><X className="h-3.5 w-3.5" /></button>
                        {removing?.appointment.id === appointment.id && removing.date === day.key && (
                          <div className="grid gap-1.5 border-t border-border/60 p-2 text-xs">
                            <strong>{t("להסיר את השיבוץ?", "Remove this appointment?")}</strong>
                            {appointment.weekly ? (
                              <>
                                <button type="button" disabled={busy} onClick={() => remove("once")} className="rounded-lg border border-border/60 px-2 py-1 hover:bg-muted">{t("רק ביום הזה", "Only this day")}</button>
                                <button type="button" disabled={busy} onClick={() => remove("from")} className="rounded-lg border border-border/60 px-2 py-1 hover:bg-muted">{t("מהיום והלאה", "This day and after")}</button>
                              </>
                            ) : (
                              <button type="button" disabled={busy} onClick={() => remove("all")} className="rounded-lg border border-border/60 px-2 py-1 hover:bg-muted">{t("הסרה", "Remove")}</button>
                            )}
                            <button type="button" onClick={() => setRemoving(null)} className="px-2 py-1 text-muted-foreground">{t("ביטול", "Cancel")}</button>
                          </div>
                        )}
                      </div>
                    ))}

                    {formHere && (
                      <form onSubmit={submitForm} className="grid gap-2 rounded-xl border border-border/60 bg-card p-2 text-sm">
                        <label className="grid gap-1"><span className="text-xs font-bold">{t("מטופל", "Client")}</span>
                          <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} required className="rounded-lg border border-border/60 bg-background px-2 py-1.5">
                            {!patients.length && <option value="">{t("הוסיפי קודם מטופל", "Add a client first")}</option>}
                            {patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.display_name}</option>)}
                          </select>
                        </label>
                        <label className="grid gap-1"><span className="text-xs font-bold">{t("שעה (לא חובה)", "Time (optional)")}</span>
                          <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="rounded-lg border border-border/60 bg-background px-2 py-1.5" />
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={form.weekly} onChange={(e) => setForm({ ...form, weekly: e.target.checked })} className="h-4 w-4 accent-[#5f9f7c]" />{t(`כל יום ${DAY_LABELS[day.index]}`, `Every ${DAY_LABELS_EN[day.index]}`)}</label>
                        <div className="flex gap-1.5">
                          <Button type="submit" size="sm" disabled={busy || !form.patientId} className="rounded-full">{t("שיבוץ", "Schedule")}</Button>
                          <Button type="button" size="sm" variant="ghost" onClick={() => setForm(null)} className="rounded-full">{t("ביטול", "Cancel")}</Button>
                        </div>
                      </form>
                    )}

                    {!items.length && !formHere && <span className="hidden text-center text-xs text-muted-foreground md:block">{t("אין שיבוצים", "No appointments")}</span>}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </AppShell>
  );
}
