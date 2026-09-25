import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Download, ImagePlus, Link2, Plus, Printer, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { HebrewCalendarPages, initialPhotoBox, MAX_CALENDAR_PHOTOS } from "@/components/HebrewCalendarPages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildGregorianCalendarYear, currentCalendarStartYear, encodeCalendarPayload, eventLabel, eventsForDay, monthName } from "@/lib/hebrew-calendar";
import { useTranslator } from "@/lib/language";

const DEFAULT_SETTINGS = { jewish: true, muslim: false, christian: false, education: true, photoMode: "shared" };
const IMAGE_TYPES = "image/png,image/jpeg,image/webp,image/gif";
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`);

function readImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return resolve(null);
      const image = new Image();
      image.onload = () => resolve({ src: reader.result, naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight });
      image.onerror = () => resolve(null);
      image.src = reader.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

function clearPrintState() {
  document.body.classList.remove("calendar-mobile-print", "calendar-printing");
}

export default function HebrewCalendarGenerator() {
  const location = useLocation();
  const { language, t } = useTranslator();
  const english = language === "en";
  const mode = location.pathname.startsWith("/therapist") ? "therapist" : "parent";
  const [year, setYear] = useState(currentCalendarStartYear());
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [title, setTitle] = useState(() => t("לוח השנה המשפחתי שלנו", "Our family calendar"));
  const [activeIndex, setActiveIndex] = useState(0);
  // Photos: one set for every month ("shared") or a set per month ("monthly"), up to 5 each.
  const [sharedPhotos, setSharedPhotos] = useState([]);
  const [monthlyPhotos, setMonthlyPhotos] = useState({});
  const [selectedPhotoId, setSelectedPhotoId] = useState("");
  const [customEvents, setCustomEvents] = useState([]);
  const [eventDate, setEventDate] = useState("");
  const [eventLabelText, setEventLabelText] = useState("");
  const [printReady, setPrintReady] = useState(false);
  const months = useMemo(() => buildGregorianCalendarYear(year), [year]);
  const activeMonth = months[activeIndex] || months[0];
  const monthly = settings.photoMode === "monthly";
  const activePhotos = (monthly ? monthlyPhotos[activeMonth.key] : sharedPhotos) || [];

  useEffect(() => {
    const afterPrint = () => { setPrintReady(false); clearPrintState(); };
    window.addEventListener("afterprint", afterPrint);
    return () => { clearPrintState(); window.removeEventListener("afterprint", afterPrint); };
  }, []);

  useEffect(() => { setSelectedPhotoId(""); }, [activeMonth.key, settings.photoMode]);

  function printCalendar() {
    // Page size and margins (A4, 12mm) come from the print CSS; the sheets are sized to fit them.
    document.body.classList.add("calendar-printing");
    document.body.classList.toggle("calendar-mobile-print", window.matchMedia("(max-width: 767px)").matches);
    setPrintReady(true);
    // Give React one paint to create the 12 printable pages only when they are needed.
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }

  function toggle(key) { setSettings((current) => ({ ...current, [key]: !current[key] })); }
  function changeYear(delta) { setYear((value) => value + delta); setActiveIndex(0); }
  function addEvent() {
    if (!eventDate || !eventLabelText.trim()) return toast.error(t("בחרו תאריך וכתבו אירוע", "Choose a date and type an event"));
    setCustomEvents((events) => [...events, { id: newId(), date: eventDate, label: eventLabelText.trim() }]);
    setEventLabelText("");
  }
  function dayClicked(day) { setEventDate(day.date); document.getElementById("calendar-custom-event")?.focus(); }

  function updatePhotos(update) {
    if (monthly) setMonthlyPhotos((all) => ({ ...all, [activeMonth.key]: update(all[activeMonth.key] || []) }));
    else setSharedPhotos(update);
  }
  async function addPhotos(event) {
    const input = event.target;
    const files = [...(input.files || [])];
    input.value = "";
    if (!files.length) return;
    const images = files.filter((file) => file.type.startsWith("image/"));
    if (images.length !== files.length) toast.error(t("אפשר לבחור קובצי תמונה בלבד.", "Please choose image files only."));
    const room = MAX_CALENDAR_PHOTOS - activePhotos.length;
    if (room <= 0 || images.length > room) toast.error(t("ניתן להוסיף עד 5 תמונות לכל חודש.", "You can add up to 5 photos per month."));
    if (room <= 0) return;
    const loaded = (await Promise.all(images.slice(0, room).map(readImage))).filter(Boolean);
    if (!loaded.length) return;
    const added = loaded.map((photo) => ({ id: newId(), ...photo }));
    updatePhotos((list) => [...list, ...added.map((photo, index) => ({ ...photo, ...initialPhotoBox(photo, list.length + index) }))]);
    setSelectedPhotoId(added.at(-1).id);
  }
  function moveOrResizePhoto(id, box) { updatePhotos((list) => list.map((photo) => (photo.id === id ? { ...photo, ...box } : photo))); }
  function removeSelectedPhoto() {
    if (!selectedPhotoId) return;
    updatePhotos((list) => list.filter((photo) => photo.id !== selectedPhotoId));
    setSelectedPhotoId("");
  }
  function resetPhotoLayout() { updatePhotos((list) => list.map((photo, index) => ({ ...photo, ...initialPhotoBox(photo, index) }))); }

  function downloadCalendarFile() {
    const lines = [];
    const seen = new Set();
    months.forEach((month) => month.days.forEach((day) => {
      if (!day?.date) return;
      eventsForDay(day, settings, customEvents).forEach((event) => {
        const label = eventLabel(event, language);
        const key = `${day.date}|${label}`;
        if (seen.has(key)) return;
        seen.add(key);
        const start = day.date.replaceAll("-", "");
        const next = new Date(`${day.date}T12:00:00`);
        next.setDate(next.getDate() + 1);
        const end = `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, "0")}${String(next.getDate()).padStart(2, "0")}`;
        const summary = String(label).replaceAll("\\", "\\\\").replaceAll(",", "\\,").replaceAll(";", "\\;").replaceAll("\n", "\\n");
        lines.push("BEGIN:VEVENT", `UID:${start}-${lines.length}@letsplayot.com`, `DTSTART;VALUE=DATE:${start}`, `DTEND;VALUE=DATE:${end}`, `SUMMARY:${summary}`, "END:VEVENT");
      });
    }));
    if (!lines.length) return toast.error(t("בחרו לפחות סוג אחד של מועדים או הוסיפו אירוע אישי", "Choose at least one type of holiday or add a personal event"));
    const text = ["BEGIN:VCALENDAR", "VERSION:2.0", `PRODID:-//LetsPlayOT//Family Calendar//${english ? "EN" : "HE"}`, "CALSCALE:GREGORIAN", "METHOD:PUBLISH", ...lines, "END:VCALENDAR"].join("\r\n");
    const link = document.createElement("a");
    const url = URL.createObjectURL(new Blob([text], { type: "text/calendar;charset=utf-8" }));
    link.href = url;
    link.download = `letsplayot-calendar-${year}-${year + 1}.ics`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(t("קובץ היומן נשמר. פתחו אותו כדי להוסיף את המועדים ליומן Google או ליומן בטלפון", "The calendar file was saved. Open it to add the dates to Google Calendar or your phone’s calendar."));
  }

  function shareUrl() {
    const data = encodeCalendarPayload({ year, settings: { ...settings, photoMode: settings.photoMode === "decorate" ? "decorate" : "none" }, title, customEvents });
    return `${window.location.origin}${english ? "/en" : ""}/shared/hebrew-calendar?data=${encodeURIComponent(data)}`;
  }
  async function shareCalendar() {
    const url = shareUrl();
    try {
      if (navigator.share) await navigator.share({ title, text: t("לוח השנה שלנו", "Our calendar"), url });
      else { await navigator.clipboard.writeText(url); toast.success(t("הקישור הועתק", "Link copied")); }
    } catch (error) { if (error?.name !== "AbortError") toast.error(t("לא הצלחנו לשתף את הקישור", "We couldn't share the link")); }
  }
  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl());
    toast.success(t("הקישור הועתק לטלפון או להודעה", "Link copied — paste it into a message or open it on your phone"));
  }

  const PrevIcon = english ? ChevronLeft : ChevronRight;
  const NextIcon = english ? ChevronRight : ChevronLeft;
  const pageProps = { months, year, settings, title, customEvents, sharedPhotos, monthlyPhotos, language };

  return (
    <AppShell mode={mode} pageClassName="calendar-print-root bg-sky/20">
      <div className="calendar-builder print:hidden" dir={english ? "ltr" : "rtl"}>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-black"><CalendarDays className="h-8 w-8 text-primary" /> {t("יצירת לוח שנה", "Create a Family Calendar")}</h1>
            <p className="mt-2 text-muted-foreground">{t("לוח לועזי מספטמבר עד אוגוסט, עם תאריכים עבריים, מועדים ותמונות.", "A September-to-August calendar with holidays, school breaks, and photos.")}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={copyLink}><Link2 className="h-4 w-4" /> {t("העתקת קישור", "Copy link")}</Button>
            <Button variant="outline" onClick={shareCalendar}><Share2 className="h-4 w-4" /> {t("שיתוף", "Share")}</Button>
            <Button variant="outline" onClick={downloadCalendarFile}><Download className="h-4 w-4" /> {t("שמירה בגוגל", "Save to Google Calendar")}</Button>
            <Button onClick={printCalendar}><Printer className="h-4 w-4" /> {t("הדפסה", "Print")}</Button>
            {/* לוח החופשות של משרד החינוך קיים בעברית בלבד */}
            {!english && <a href="/parent/school-holidays/" className="school-holidays-shortcut">{t("לוח חופשות משרד החינוך", "Ministry of Education vacation calendar")}</a>}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4 rounded-[2rem] border bg-white p-5 shadow-sm">
            <label className="block text-sm font-bold">{t("כותרת ללוח", "Calendar title")}<Input className="mt-2" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
            <div>
              <p className="mb-2 text-sm font-bold">{t("שנת הלוח", "Calendar year")}</p>
              <div className="flex items-center justify-between rounded-xl border p-2">
                <Button size="icon" variant="ghost" onClick={() => changeYear(-1)} aria-label={t("השנה הקודמת", "Previous year")}><PrevIcon /></Button>
                <strong className="text-xl">{year}–{year + 1}</strong>
                <Button size="icon" variant="ghost" onClick={() => changeYear(1)} aria-label={t("השנה הבאה", "Next year")}><NextIcon /></Button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t("מספטמבר עד אוגוסט", "September to August")}</p>
            </div>
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-bold">{t("מה להציג?", "What should be shown?")}</legend>
              <Toggle checked={settings.jewish} onChange={() => toggle("jewish")} label={t("חגים ומועדים יהודיים", "Jewish holidays and observances")} color="bg-amber-300" />
              <Toggle checked={settings.muslim} onChange={() => toggle("muslim")} label={t("חגים ומועדים מוסלמיים", "Muslim holidays and observances")} color="bg-emerald-300" />
              <Toggle checked={settings.christian} onChange={() => toggle("christian")} label={t("חגים ומועדים נוצריים", "Christian holidays and observances")} color="bg-[#9b8bd1]" />
              <Toggle checked={settings.education} onChange={() => toggle("education")} label={t("חופשות מערכת החינוך", "School breaks")} color="bg-rose-300" />
            </fieldset>
            <div>
              <p className="mb-2 text-sm font-bold">{t("עיצוב האזור העליון", "Top-area design")}</p>
              <div className="grid grid-cols-3 gap-2">
                <Choice active={settings.photoMode === "shared"} onClick={() => setSettings((s) => ({ ...s, photoMode: "shared" }))}>{t("תמונה אחת", "One photo")}</Choice>
                <Choice active={monthly} onClick={() => setSettings((s) => ({ ...s, photoMode: "monthly" }))}>{t("לכל חודש", "One for each month")}</Choice>
                <Choice active={settings.photoMode === "decorate"} onClick={() => setSettings((s) => ({ ...s, photoMode: "decorate" }))}>{t("קישוט עצמי", "Decorate yourself")}</Choice>
              </div>
              {settings.photoMode !== "decorate" && (
                <>
                  <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-sm font-bold hover:bg-muted">
                    <ImagePlus className="h-4 w-4" /> {t("העלאת תמונות", "Upload photos")}
                    <input className="hidden" type="file" accept={IMAGE_TYPES} multiple onChange={addPhotos} />
                  </label>
                  <div className="calendar-multi-photo-controls">
                    <span className="calendar-multi-photo-count">{t(`${activePhotos.length}/${MAX_CALENDAR_PHOTOS} תמונות`, `${activePhotos.length}/${MAX_CALENDAR_PHOTOS} photos`)}</span>
                    <button type="button" disabled={!selectedPhotoId} onClick={removeSelectedPhoto}>{t("מחיקת תמונה נבחרת", "Delete selected")}</button>
                    <button type="button" onClick={resetPhotoLayout}>{t("איפוס סידור", "Reset layout")}</button>
                  </div>
                  {activePhotos.length > 0 && (
                    <div className="mt-3 space-y-2 rounded-xl bg-sky/20 p-3 text-xs leading-5">
                      <p className="font-bold">{t("עריכת התמונות נעשית ישירות בתצוגת הלוח:", "Edit the photos right on the calendar preview:")}</p>
                      <p>{t("לחצו על תמונה כדי לבחור אותה, גררו אותה כדי להזיז, וגררו את העיגול שבפינה כדי לשנות את הגודל.", "Tap a photo to select it, drag it to move it, and drag the circle in the corner to resize it.")}</p>
                    </div>
                  )}
                </>
              )}
              {settings.photoMode === "decorate" && <p className="mt-2 rounded-xl bg-sky/30 p-3 text-xs leading-5">{t("בהדפסה יופיע כאן שטח לבן עם מסגרת שחורה, מוכן לציור ולצביעה.", "The printout will show a white area with a black frame here, ready for drawing and coloring.")}</p>}
            </div>
            <div className="border-t pt-4">
              <p className="mb-2 text-sm font-bold">{t("אירוע אישי", "Personal event")}</p>
              <Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
              <div className="mt-2 flex gap-2">
                <Input id="calendar-custom-event" placeholder={t("למשל: יום הולדת לסבתא", "For example: Grandma's birthday")} value={eventLabelText} onChange={(e) => setEventLabelText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEvent()} />
                <Button size="icon" onClick={addEvent} aria-label={t("הוספת אירוע", "Add event")}><Plus /></Button>
              </div>
              {customEvents.length > 0 && (
                <div className="mt-3 max-h-32 space-y-1 overflow-auto">
                  {customEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between rounded-lg bg-violet-50 px-2 py-1 text-xs">
                      <span>{event.date} · {event.label}</span>
                      <button onClick={() => setCustomEvents((all) => all.filter((item) => item.id !== event.id))} aria-label={t("מחיקת האירוע", "Delete event")}><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-950">{t("חופשות ומועדים המסומנים בכוכבית הם בסיס נוח לעריכה. מומלץ לוודא מול לוח המסגרת ומשרד החינוך.", "Starred holidays and dates are provided as an editable starting point. Please check with the child's school or program and the Ministry of Education.")}</p>
          </aside>

          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-white p-2 shadow-sm">
              <Button size="icon" variant="ghost" disabled={activeIndex === 0} onClick={() => setActiveIndex((i) => i - 1)} aria-label={t("החודש הקודם", "Previous month")}><PrevIcon /></Button>
              <div className="flex max-w-[75%] gap-1 overflow-x-auto py-1">
                {months.map((month, index) => (
                  <button key={month.key} onClick={() => setActiveIndex(index)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ${index === activeIndex ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{monthName(month, language)}</button>
                ))}
              </div>
              <Button size="icon" variant="ghost" disabled={activeIndex === months.length - 1} onClick={() => setActiveIndex((i) => i + 1)} aria-label={t("החודש הבא", "Next month")}><NextIcon /></Button>
            </div>
            <div className="calendar-preview-frame">
              <HebrewCalendarPages
                {...pageProps}
                activeIndex={activeIndex}
                interactive
                onDayClick={dayClicked}
                photoEditable
                selectedPhotoId={selectedPhotoId}
                onSelectPhoto={setSelectedPhotoId}
                onPhotoChange={moveOrResizePhoto}
              />
            </div>
          </section>
        </div>
      </div>
      {printReady && <div className="calendar-print-pages hidden print:block"><HebrewCalendarPages {...pageProps} showAll /></div>}
    </AppShell>
  );
}

function Toggle({ checked, onChange, label, color }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2">
      <span className="flex items-center gap-2 text-sm"><span className={`h-3 w-3 rounded-full ${color}`} />{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5 accent-primary" />
    </label>
  );
}

function Choice({ active, onClick, children }) {
  return <button type="button" onClick={onClick} className={`rounded-xl border px-2 py-2 text-sm font-bold ${active ? "border-primary bg-sage/30" : "bg-white"}`}>{children}</button>;
}
