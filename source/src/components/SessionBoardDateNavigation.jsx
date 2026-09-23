import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { addBoardDays, localTodayIso } from "@/lib/session-board-storage";

export function SessionBoardDateNavigation({ date, language = "he", savedDates = [], onNavigate, onCopy }) {
  const [copying, setCopying] = useState(false);
  const isEnglish = language === "en";
  const text = (hebrew, english) => isEnglish ? english : hebrew;
  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(isEnglish ? "en-US" : "he-IL", { day: "numeric", month: "numeric", year: "numeric" }).format(new Date(`${date}T12:00:00`));
    } catch {
      return date;
    }
  }, [date, isEnglish]);
  const orderedDates = useMemo(() => [...new Set([...savedDates, date])].sort(), [savedDates, date]);

  function neighboringDate(direction) {
    const candidates = direction < 0 ? orderedDates.filter((value) => value < date) : orderedDates.filter((value) => value > date);
    if (candidates.length) return direction < 0 ? candidates[candidates.length - 1] : candidates[0];
    return addBoardDays(date, direction * 7);
  }

  async function copyNextWeek() {
    if (copying) return;
    setCopying(true);
    try { await onCopy(addBoardDays(date, 7)); }
    finally { setCopying(false); }
  }

  const previousIcon = isEnglish ? ChevronLeft : ChevronRight;
  const nextIcon = isEnglish ? ChevronRight : ChevronLeft;
  const PreviousIcon = previousIcon;
  const NextIcon = nextIcon;

  return (
    <section className="mb-5 rounded-3xl border border-border/70 bg-card p-3 shadow-sm" aria-label={text("מעבר בין לוחות טיפול", "Navigate session boards")}>
      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={() => onNavigate(neighboringDate(-1))} className="flex min-h-24 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-2 text-center font-bold hover:bg-muted">
          <PreviousIcon className="h-5 w-5 shrink-0" />
          <span>{text("הטיפול הקודם", "Previous session")}</span>
        </button>
        <label className="relative flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-2xl border border-sage bg-sage/10 px-2 text-center">
          <strong>{date === localTodayIso() ? text("היום", "Today") : text("תאריך הטיפול", "Session date")}</strong>
          <span className="mt-1 text-sm font-semibold tabular-nums">{formattedDate}</span>
          <input type="date" value={date} onChange={(event) => event.target.value && onNavigate(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={text("בחירת תאריך טיפול", "Choose a session date")} />
        </label>
        <button type="button" onClick={() => onNavigate(neighboringDate(1))} className="flex min-h-24 items-center justify-center gap-2 rounded-2xl border border-border bg-white px-2 text-center font-bold hover:bg-muted">
          <span>{text("הטיפול הבא", "Next session")}</span>
          <NextIcon className="h-5 w-5 shrink-0" />
        </button>
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
        <label className="relative flex min-h-11 items-center gap-2 rounded-2xl border border-border bg-white px-3">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">{text("מעבר ללוח שמור", "Open a saved board")}</span>
          <select value={date} onChange={(event) => onNavigate(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none">
            {orderedDates.map((value) => <option key={value} value={value}>{new Intl.DateTimeFormat(isEnglish ? "en-US" : "he-IL").format(new Date(`${value}T12:00:00`))}</option>)}
          </select>
        </label>
        <button type="button" onClick={copyNextWeek} disabled={copying} className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-sage bg-sage/10 px-4 text-sm font-bold text-sage-foreground hover:bg-sage/20 disabled:opacity-60">
          <Copy className="h-4 w-4" /> {copying ? text("משכפלת…", "Copying…") : text("שכפול לשבוע הבא", "Copy to next week")}
        </button>
      </div>
    </section>
  );
}
