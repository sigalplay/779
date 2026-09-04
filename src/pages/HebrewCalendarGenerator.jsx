import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, ImagePlus, Link2, Plus, Printer, Share2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { HebrewCalendarPages } from "@/components/HebrewCalendarPages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildGregorianCalendarYear, currentCalendarStartYear, encodeCalendarPayload } from "@/lib/hebrew-calendar";

const DEFAULT_SETTINGS = { jewish: true, muslim: false, christian: false, education: true, photoMode: "shared" };
const DEFAULT_PHOTO_TRANSFORM = { scale: 1, x: 0, y: 0 };

function readImage(file, onDone) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => onDone(reader.result);
  reader.readAsDataURL(file);
}

export default function HebrewCalendarGenerator() {
  const location = useLocation();
  const mode = location.pathname.startsWith("/therapist") ? "therapist" : "parent";
  const [year, setYear] = useState(currentCalendarStartYear());
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [title, setTitle] = useState("לוח השנה המשפחתי שלנו");
  const [activeIndex, setActiveIndex] = useState(0);
  const [sharedPhoto, setSharedPhoto] = useState("");
  const [monthlyPhotos, setMonthlyPhotos] = useState({});
  const [sharedPhotoTransform, setSharedPhotoTransform] = useState(DEFAULT_PHOTO_TRANSFORM);
  const [monthlyPhotoTransforms, setMonthlyPhotoTransforms] = useState({});
  const [customEvents, setCustomEvents] = useState([]);
  const [eventDate, setEventDate] = useState("");
  const [eventLabel, setEventLabel] = useState("");
  const [printReady, setPrintReady] = useState(false);
  const shareRef = useRef(null);
  const months = useMemo(() => buildGregorianCalendarYear(year), [year]);
  const activeMonth = months[activeIndex] || months[0];
  const activePhoto = settings.photoMode === "monthly" ? monthlyPhotos[activeMonth.key] : sharedPhoto;
  const activePhotoTransform = settings.photoMode === "monthly"
    ? monthlyPhotoTransforms[activeMonth.key] || DEFAULT_PHOTO_TRANSFORM
    : sharedPhotoTransform;

  useEffect(() => {
    const clearPrintPages = () => setPrintReady(false);
    window.addEventListener("afterprint", clearPrintPages);
    return () => window.removeEventListener("afterprint", clearPrintPages);
  }, []);

  function printCalendar() {
    setPrintReady(true);
    // Give React one paint to create the 12 printable pages only when they are needed.
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }

  function toggle(key) { setSettings((current) => ({ ...current, [key]: !current[key] })); }
  function changeYear(delta) { setYear((value) => value + delta); setActiveIndex(0); }
  function addEvent() {
    if (!eventDate || !eventLabel.trim()) return toast.error("בחרו תאריך וכתבו אירוע");
    setCustomEvents((events) => [...events, { id: crypto.randomUUID(), date: eventDate, label: eventLabel.trim() }]);
    setEventLabel("");
  }
  function dayClicked(day) { setEventDate(day.date); document.getElementById("calendar-custom-event")?.focus(); }
  function replacePhotoTransform(nextTransform) {
    if (settings.photoMode === "monthly") {
      setMonthlyPhotoTransforms((all) => ({ ...all, [activeMonth.key]: nextTransform }));
    } else {
      setSharedPhotoTransform(nextTransform);
    }
  }
  function resetPhotoTransform() {
    if (settings.photoMode === "monthly") setMonthlyPhotoTransforms((all) => ({ ...all, [activeMonth.key]: DEFAULT_PHOTO_TRANSFORM }));
    else setSharedPhotoTransform(DEFAULT_PHOTO_TRANSFORM);
  }
  function uploadPhoto(value) {
    if (settings.photoMode === "monthly") {
      setMonthlyPhotos((all) => ({ ...all, [activeMonth.key]: value }));
      setMonthlyPhotoTransforms((all) => ({ ...all, [activeMonth.key]: DEFAULT_PHOTO_TRANSFORM }));
    } else {
      setSharedPhoto(value);
      setSharedPhotoTransform(DEFAULT_PHOTO_TRANSFORM);
    }
  }

  function shareUrl() {
    const data = encodeCalendarPayload({ year, settings: { ...settings, photoMode: settings.photoMode === "decorate" ? "decorate" : "none" }, title, customEvents });
    return `${window.location.origin}/shared/hebrew-calendar?data=${encodeURIComponent(data)}`;
  }
  async function shareCalendar() {
    const url = shareUrl();
    try {
      if (navigator.share) await navigator.share({ title, text: "לוח השנה שלנו", url });
      else { await navigator.clipboard.writeText(url); toast.success("הקישור הועתק"); }
    } catch (error) { if (error?.name !== "AbortError") toast.error("לא הצלחנו לשתף את הקישור"); }
  }
  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl());
    toast.success("הקישור הועתק לטלפון או להודעה");
  }

  return (
    <AppShell mode={mode} pageClassName="calendar-print-root bg-sky/20">
      <div className="calendar-builder print:hidden" dir="rtl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="flex items-center gap-2 text-3xl font-black"><CalendarDays className="h-8 w-8 text-primary" /> יצירת לוח שנה</h1><p className="mt-2 text-muted-foreground">לוח לועזי מספטמבר עד אוגוסט, עם תאריכים עבריים, מועדים ותמונות.</p></div>
          <div className="flex gap-2"><Button variant="outline" onClick={copyLink}><Link2 className="h-4 w-4" /> העתקת קישור</Button><Button variant="outline" onClick={shareCalendar}><Share2 className="h-4 w-4" /> שיתוף</Button><Button onClick={printCalendar}><Printer className="h-4 w-4" /> הדפסה</Button></div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-4 rounded-[2rem] border bg-white p-5 shadow-sm">
            <label className="block text-sm font-bold">כותרת ללוח<Input className="mt-2" value={title} onChange={(e) => setTitle(e.target.value)} /></label>
            <div><p className="mb-2 text-sm font-bold">שנת הלוח</p><div className="flex items-center justify-between rounded-xl border p-2"><Button size="icon" variant="ghost" onClick={() => changeYear(-1)}><ChevronRight /></Button><strong className="text-xl">{year}–{year + 1}</strong><Button size="icon" variant="ghost" onClick={() => changeYear(1)}><ChevronLeft /></Button></div><p className="mt-1 text-xs text-muted-foreground">מספטמבר עד אוגוסט</p></div>
            <fieldset className="space-y-2"><legend className="mb-2 text-sm font-bold">מה להציג?</legend><Toggle checked={settings.jewish} onChange={() => toggle("jewish")} label="חגים ומועדים יהודיים" color="bg-amber-300" /><Toggle checked={settings.muslim} onChange={() => toggle("muslim")} label="חגים ומועדים מוסלמיים" color="bg-emerald-300" /><Toggle checked={settings.christian} onChange={() => toggle("christian")} label="חגים ומועדים נוצריים" color="bg-[#9b8bd1]" /><Toggle checked={settings.education} onChange={() => toggle("education")} label="חופשות מערכת החינוך" color="bg-rose-300" /></fieldset>
            <div>
              <p className="mb-2 text-sm font-bold">עיצוב האזור העליון</p>
              <div className="grid grid-cols-3 gap-2"><Choice active={settings.photoMode === "shared"} onClick={() => setSettings((s) => ({ ...s, photoMode: "shared" }))}>תמונה אחת</Choice><Choice active={settings.photoMode === "monthly"} onClick={() => setSettings((s) => ({ ...s, photoMode: "monthly" }))}>לכל חודש</Choice><Choice active={settings.photoMode === "decorate"} onClick={() => setSettings((s) => ({ ...s, photoMode: "decorate" }))}>קישוט עצמי</Choice></div>
              {settings.photoMode !== "decorate" && <label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-sm font-bold hover:bg-muted"><ImagePlus className="h-4 w-4" /> העלאת תמונה<input className="hidden" type="file" accept="image/*" onChange={(e) => readImage(e.target.files?.[0], uploadPhoto)} /></label>}
              {settings.photoMode !== "decorate" && activePhoto && (
                <div className="mt-3 space-y-2 rounded-xl bg-sky/20 p-3 text-xs leading-5">
                  <p className="font-bold">עריכת התמונה נעשית ישירות בתצוגת הלוח:</p>
                  <p>גררו את התמונה כדי להזיז אותה. גררו את הידית שבפינה כדי להגדיל או להקטין.</p>
                  <button type="button" onClick={resetPhotoTransform} className="font-bold text-primary-foreground underline">איפוס מיקום וגודל</button>
                </div>
              )}
              {settings.photoMode === "decorate" && <p className="mt-2 rounded-xl bg-sky/30 p-3 text-xs leading-5">בהדפסה יופיע כאן שטח לבן עם מסגרת שחורה, מוכן לציור ולצביעה.</p>}
            </div>
            <div className="border-t pt-4"><p className="mb-2 text-sm font-bold">אירוע אישי</p><Input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} /><div className="mt-2 flex gap-2"><Input id="calendar-custom-event" placeholder="למשל: יום הולדת לסבתא" value={eventLabel} onChange={(e) => setEventLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEvent()} /><Button size="icon" onClick={addEvent}><Plus /></Button></div>{customEvents.length > 0 && <div className="mt-3 max-h-32 space-y-1 overflow-auto">{customEvents.map((event) => <div key={event.id} className="flex items-center justify-between rounded-lg bg-violet-50 px-2 py-1 text-xs"><span>{event.date} · {event.label}</span><button onClick={() => setCustomEvents((all) => all.filter((item) => item.id !== event.id))}><Trash2 className="h-3.5 w-3.5" /></button></div>)}</div>}</div>
            <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-950">חופשות ומועדים המסומנים בכוכבית הם בסיס נוח לעריכה. מומלץ לוודא מול לוח המסגרת ומשרד החינוך.</p>
          </aside>

          <section className="min-w-0">
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-white p-2 shadow-sm"><Button size="icon" variant="ghost" disabled={activeIndex === 0} onClick={() => setActiveIndex((i) => i - 1)}><ChevronRight /></Button><div className="flex max-w-[75%] gap-1 overflow-x-auto py-1">{months.map((month, index) => <button key={month.key} onClick={() => setActiveIndex(index)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-bold ${index === activeIndex ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{month.name}</button>)}</div><Button size="icon" variant="ghost" disabled={activeIndex === months.length - 1} onClick={() => setActiveIndex((i) => i + 1)}><ChevronLeft /></Button></div>
            <div className="calendar-preview-frame"><HebrewCalendarPages months={months} year={year} settings={settings} title={title} customEvents={customEvents} sharedPhoto={sharedPhoto} monthlyPhotos={monthlyPhotos} sharedPhotoTransform={sharedPhotoTransform} monthlyPhotoTransforms={monthlyPhotoTransforms} activeIndex={activeIndex} interactive onDayClick={dayClicked} photoEditable={Boolean(activePhoto)} onPhotoTransformChange={replacePhotoTransform} /></div>
          </section>
        </div>
        <div ref={shareRef} />
      </div>
      {printReady && <div className="calendar-print-pages hidden print:block"><HebrewCalendarPages months={months} year={year} settings={settings} title={title} customEvents={customEvents} sharedPhoto={sharedPhoto} monthlyPhotos={monthlyPhotos} sharedPhotoTransform={sharedPhotoTransform} monthlyPhotoTransforms={monthlyPhotoTransforms} showAll /></div>}
    </AppShell>
  );
}

function Toggle({ checked, onChange, label, color }) { return <label className="flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2"><span className="flex items-center gap-2 text-sm"><span className={`h-3 w-3 rounded-full ${color}`} />{label}</span><input type="checkbox" checked={checked} onChange={onChange} className="h-5 w-5 accent-primary" /></label>; }
function Choice({ active, onClick, children }) { return <button type="button" onClick={onClick} className={`rounded-xl border px-2 py-2 text-sm font-bold ${active ? "border-primary bg-sage/30" : "bg-white"}`}>{children}</button>; }
