import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CalendarDays,
  ListTree,
  Plus,
  Minus,
  X,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Printer,
  RotateCcw,
  Image as ImageIcon,
  Share2,
  Copy,
  Check,
  Clock,
  Repeat,
  Pencil,
  Trash2,
  Files,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TherapistQuickTips } from "@/components/TherapistQuickTips";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  dateKeyFor,
  getWeekDates,
  getWeeklyBoardSettings,
  getWeeklyBoardDayCards,
  setWeeklyBoardCardAt,
  removeWeeklyBoardCardAt,
  getWeeklyBoardRecurringDayCards,
  setWeeklyBoardRecurringCardAt,
  removeWeeklyBoardRecurringCardAt,
  addWeeklyBoardRow,
  removeWeeklyBoardRow,
  setWeeklyBoardShowTimes,
  setWeeklyBoardRowTime,
  setWeeklyBoardStyle,
  resetWeeklyBoardWeek,
  buildWeeklyBoardShareUrl,
  parseWeeklyBoardShareParams,
  importWeeklyBoardWeek,
  compressPhotoForShare,
  getWeeklyBoards,
  getActiveWeeklyBoardId,
  setActiveWeeklyBoardId,
  createWeeklyBoard,
  renameWeeklyBoard,
  duplicateWeeklyBoard,
  deleteWeeklyBoard,
} from "@/lib/storage";
import { WEEKLY_BOARD_CATEGORIES, KIDS_WEEKLY_BOARD_CATEGORIES, weeklyBoardTaskById, weeklyBoardCategoryLabel, weeklyBoardTaskTitle } from "@/lib/weekly-board-tasks";
import { weeklyBoardLimit } from "@/lib/subscription";
import { useTranslator } from "@/lib/language";
import { useNavigate } from "react-router-dom";

const DAY_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const DAY_LABELS_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function emptyDraft() {
  return { title: "", taskId: null, image: null, categoryId: null, categoryColor: null, photo: null, recurring: false };
}

function isSameDate(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function formatDayDate(d) {
  return `${d.getDate()}.${d.getMonth() + 1}`;
}
function formatWeekRangeLabel(weekDates, language) {
  const first = weekDates[0];
  const last = weekDates[6];
  const locale = language === "en" ? "en-GB" : "he-IL";
  const month = (date) => new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
  if (first.getMonth() === last.getMonth()) return `${month(first)} ${first.getFullYear()}`;
  return `${month(first)}–${month(last)} ${last.getFullYear()}`;
}

// כל תא מצייר רק את הגבול העליון והימני שלו (בהתאמה ל-RTL) - כך שבטבלה עם border-separate
// אין הכפלה של קווים בגבולות פנימיים. תאים בשורה/עמודה האחרונה מוסיפים גם את הגבול התחתון/שמאלי,
// ולתאי הפינות מתווסף עיגול פינה תואם - כך שהמסגרת החיצונית כולה יוצאת עגולה ובעובי אחיד.
function edgeCell({ isFirstRow, isLastRow, isFirstCol, isLastCol }) {
  const classes = ["border-t-2", "border-s-2", "border-black/70"];
  if (isLastRow) classes.push("border-b-2");
  if (isLastCol) classes.push("border-e-2");
  if (isFirstRow && isFirstCol) classes.push("rounded-ss-2xl");
  if (isFirstRow && isLastCol) classes.push("rounded-se-2xl");
  if (isLastRow && isFirstCol) classes.push("rounded-es-2xl");
  if (isLastRow && isLastCol) classes.push("rounded-ee-2xl");
  return classes.join(" ");
}

// משבצת בודדת בטבלה - ריקה (כפתור הוספה) או עם כרטיס. עיצוב טבלה נקי - בלי צבעים לפי יום.
function Cell({ card, onAdd, onRemove, compact = false, kidsStyle = false, language = "he" }) {
  const heightClass = compact ? "h-14 sm:h-20" : "h-32 sm:h-20";
  if (!card) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className={`flex ${heightClass} w-full items-center justify-center text-muted-foreground/50 transition-colors hover:bg-muted/50 hover:text-muted-foreground`}
      >
        <Plus className={compact ? "h-3 w-3 sm:h-4 sm:w-4" : "h-4 w-4"} />
      </button>
    );
  }
  const categoryColor = card.categoryColor || weeklyBoardTaskById(card.taskId)?.categoryColor;
  return (
    <div
      className={`group relative flex ${heightClass} w-full flex-col items-center justify-center overflow-hidden bg-white p-0 text-center`}
    >
      {categoryColor ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[15] border"
          style={{ borderColor: categoryColor }}
        />
      ) : null}
      {card._recurring ? (
        <span
          className={`absolute right-0.5 top-0.5 z-20 flex items-center justify-center rounded-full bg-sage/70 text-sage-foreground print:hidden ${
            compact ? "h-3 w-3 sm:h-4 sm:w-4" : "h-4 w-4"
          }`}
          title="פעילות קבועה - חוזרת כל שבוע"
          aria-label="פעילות קבועה"
        >
          <Repeat className={compact ? "h-2 w-2 sm:h-2.5 sm:w-2.5" : "h-2.5 w-2.5"} />
        </span>
      ) : null}
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRemove();
        }}
        aria-label={`מחיקת ${card.title || "הפעילות"}`}
        title="מחיקת הפעילות"
        className={`absolute left-0.5 top-0.5 z-20 flex items-center justify-center rounded-full border border-coral/30 bg-white text-coral shadow-sm transition-colors hover:bg-coral/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral print:hidden ${
          compact ? "h-4 w-4 sm:left-1 sm:top-1 sm:h-7 sm:w-7" : "left-1 top-1 h-7 w-7"
        }`}
      >
        <X className={compact ? "h-2.5 w-2.5 sm:h-4 sm:w-4" : "h-4 w-4"} strokeWidth={2.5} />
      </button>
      <div className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden bg-white">
        {card.photo ? (
          <img src={card.photo} alt="" className="h-full w-full object-cover" />
        ) : card.image ? (
          <img src={card.image} alt="" className={`h-full w-full object-contain mix-blend-multiply transition-transform ${kidsStyle ? "scale-110" : ""}`} />
        ) : (
          <span className="text-base" aria-hidden>{card.emoji}</span>
        )}
      </div>
      {card.title ? (
        <span
          className={compact ? "absolute inset-x-0 bottom-0 z-10 w-full truncate bg-transparent px-1 py-0.5 text-[7px] font-extrabold leading-tight text-foreground sm:text-[11px]" : "absolute inset-x-0 bottom-0 z-10 w-full bg-transparent px-1 py-0.5 text-[11px] font-extrabold leading-tight text-foreground"}
          style={{ textShadow: "0 1px 2px rgba(255,255,255,.95), 0 0 4px rgba(255,255,255,.9)" }}
        >
          {card.taskId ? weeklyBoardTaskTitle(weeklyBoardTaskById(card.taskId) || card, language) : card.title}
        </span>
      ) : null}
    </div>
  );
}

export default function WeeklyBoard({ mode }) {
  const navigate = useNavigate();
  const { language, t } = useTranslator();
  const dayLabels = language === "en" ? DAY_LABELS_EN : DAY_LABELS;
  const displayBoardName = (name) => name === "הלוח שלי" ? t("הלוח שלי", "My board") : name;
  const [boards, setBoards] = useState(getWeeklyBoards);
  const [activeBoardId, setActiveBoardState] = useState(getActiveWeeklyBoardId);
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const weekDates = useMemo(() => getWeekDates(weekAnchor), [weekAnchor]);
  const weekKeys = useMemo(() => weekDates.map(dateKeyFor), [weekDates]);
  const today = useMemo(() => new Date(), []);

  const [refreshTick, setRefreshTick] = useState(0);
  const [viewMode, setViewMode] = useState("week"); // "week" | "day"
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const day = new Date().getDay(); // 0=ראשון...6=שבת, תואם לסדר של weekDates
    return day;
  });
  const [addTarget, setAddTarget] = useState(null); // { dayIndex, rowIndex }
  const [removeTarget, setRemoveTarget] = useState(null); // { dayIndex, rowIndex } - for recurring-card delete confirmation
  const [draft, setDraft] = useState(emptyDraft());
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const activeBoard = boards.find((board) => board.id === activeBoardId) || boards[0];
  function reloadBoards() {
    setBoards(getWeeklyBoards()); setActiveBoardState(getActiveWeeklyBoardId()); setRefreshTick((x) => x + 1);
  }
  function switchBoard(id) { setActiveWeeklyBoardId(id); setActiveBoardState(id); setRefreshTick((x) => x + 1); }
  function addBoard() {
    if (boards.length >= weeklyBoardLimit()) { toast.info("במנוי החינמי אפשר לשמור לוח אחד. במנוי המלא אפשר ליצור לוחות ללא הגבלה."); navigate("/pricing"); return; }
    const name = window.prompt("איך לקרוא ללוח החדש?", `לוח ${boards.length + 1}`); if (!name) return;
    createWeeklyBoard(name); reloadBoards();
  }
  function renameBoard() { const name = window.prompt("שם חדש ללוח", activeBoard?.name || ""); if (!name) return; renameWeeklyBoard(activeBoardId, name); reloadBoards(); }
  function copyBoard() {
    if (boards.length >= weeklyBoardLimit()) { toast.info("הגעת למספר הלוחות הכלול במנוי שלך."); navigate("/pricing"); return; }
    duplicateWeeklyBoard(activeBoardId); reloadBoards(); toast.success("הלוח שוכפל");
  }
  function removeBoard() { if (!window.confirm(`למחוק את „${activeBoard?.name}”?`)) return; if (!deleteWeeklyBoard(activeBoardId)) return; reloadBoards(); }

  const settings = useMemo(() => getWeeklyBoardSettings(), [refreshTick]);
  const boardCategories = settings.boardStyle === "kids" ? KIDS_WEEKLY_BOARD_CATEGORIES : WEEKLY_BOARD_CATEGORIES;
  function changeBoardStyle(boardStyle) {
    setWeeklyBoardStyle(boardStyle);
    setOpenCategoryId(null);
    setDraft(emptyDraft());
    setRefreshTick((x) => x + 1);
  }
  const cardsByDay = useMemo(
    () =>
      weekKeys.map((k, dayIndex) => {
        // weekDates תמיד מתחיל ביום ראשון, אז dayIndex עצמו הוא מספר היום בשבוע (0=ראשון...6=שבת)
        const recurring = getWeeklyBoardRecurringDayCards(dayIndex);
        const specific = getWeeklyBoardDayCards(k);
        const merged = {};
        for (const [rowIndex, card] of Object.entries(recurring)) {
          merged[rowIndex] = { ...card, _recurring: true };
        }
        for (const [rowIndex, card] of Object.entries(specific)) {
          if (card.suppressed) {
            delete merged[rowIndex];
          } else {
            merged[rowIndex] = card;
          }
        }
        return merged;
      }),
    [weekKeys, refreshTick],
  );
  const totalCards = useMemo(
    () => cardsByDay.reduce((sum, day) => sum + Object.keys(day).length, 0),
    [cardsByDay],
  );

  // אם נפתח קישור משותף (מהמכשיר של מישהו אחר) - מייבאים את השבוע שבו לתוך האחסון של המכשיר הזה,
  // עוברים לשבוע הזה, ומנקים את הפרמטרים מהכתובת כדי שלא ייובאו שוב בכל רענון.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed = parseWeeklyBoardShareParams(params);
    if (!parsed) return;
    importWeeklyBoardWeek(parsed);
    setWeekAnchor(parsed.days[0].date);
    setViewMode("week");
    window.history.replaceState({}, "", window.location.pathname);
    toast.success("הלוח השבועי שקיבלת נשמר במכשיר הזה 📅");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ההדפסה של הלוח השבועי רחבה מדף A4 לאורך - עוברים לנוף (landscape) ולרוחב מלא כל עוד הדף הזה פתוח.
  useEffect(() => {
    document.body.classList.add("print-landscape");
    const style = document.createElement("style");
    style.id = "weekly-board-print-style";
    style.textContent = "@media print { @page { size: A4 landscape; margin: 10mm; } }";
    document.head.appendChild(style);
    return () => {
      document.body.classList.remove("print-landscape");
      style.remove();
    };
  }, []);

  function refresh() {
    setRefreshTick((t) => t + 1);
  }

  function goToWeek(offsetDays) {
    setWeekAnchor((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + offsetDays);
      return next;
    });
  }
  function goToToday() {
    setWeekAnchor(new Date());
  }

  function openDay(index) {
    setSelectedDayIndex(index);
    setViewMode("day");
  }

  function openAdd(dayIndex, rowIndex) {
    setDraft(emptyDraft());
    setOpenCategoryId(null);
    setAddTarget({ dayIndex, rowIndex });
  }

  function saveDraft() {
    if (!addTarget) return;
    const title = draft.title.trim();
    if (!title) return;
    const payload = {
      title,
      taskId: draft.photo ? null : draft.taskId,
      image: draft.photo ? null : draft.image,
      categoryId: draft.photo ? null : draft.categoryId,
      categoryColor: draft.photo ? null : draft.categoryColor,
      emoji: null,
      photo: draft.photo,
    };
    if (draft.recurring) {
      setWeeklyBoardRecurringCardAt(addTarget.dayIndex, addTarget.rowIndex, payload);
    } else {
      setWeeklyBoardCardAt(weekKeys[addTarget.dayIndex], addTarget.rowIndex, payload);
    }
    setAddTarget(null);
    refresh();
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, photo: reader.result }));
    reader.readAsDataURL(file);
  }

  function requestRemove(dayIndex, rowIndex) {
    const card = cardsByDay[dayIndex]?.[rowIndex];
    if (card?._recurring) {
      setRemoveTarget({ dayIndex, rowIndex });
    } else {
      removeWeeklyBoardCardAt(weekKeys[dayIndex], rowIndex);
      refresh();
    }
  }
  function removeRecurringEverywhere() {
    if (!removeTarget) return;
    removeWeeklyBoardRecurringCardAt(removeTarget.dayIndex, removeTarget.rowIndex);
    setRemoveTarget(null);
    refresh();
  }
  function removeRecurringForThisWeekOnly() {
    if (!removeTarget) return;
    setWeeklyBoardCardAt(weekKeys[removeTarget.dayIndex], removeTarget.rowIndex, { suppressed: true });
    setRemoveTarget(null);
    refresh();
  }
  function resetWeek() {
    resetWeeklyBoardWeek(weekKeys);
    refresh();
  }
  function addRow() {
    addWeeklyBoardRow();
    refresh();
  }
  function removeRow() {
    removeWeeklyBoardRow();
    refresh();
  }
  function toggleShowTimes() {
    setWeeklyBoardShowTimes(!settings.showTimes);
    refresh();
  }
  function updateRowTime(rowIndex, value) {
    setWeeklyBoardRowTime(rowIndex, value);
    refresh();
  }

  // ---------- share ----------
  const shareUrl = useMemo(
    () => buildWeeklyBoardShareUrl(weekDates, cardsByDay, settings),
    [weekDates, cardsByDay, settings],
  );
  const [shareLoadingUrl, setShareLoadingUrl] = useState(null);
  const [shareDowngraded, setShareDowngraded] = useState(false);
  const [shareCompressing, setShareCompressing] = useState(false);

  useEffect(() => {
    if (!shareOpen) return;
    let cancelled = false;
    const photoCards = cardsByDay.flatMap((d) => Object.values(d)).filter((c) => c.photo);
    setShareLoadingUrl(shareUrl);
    setShareDowngraded(false);
    setShareCompressing(photoCards.length > 0);

    (async () => {
      let thumbnails = {};
      for (const card of photoCards) {
        const thumb = await compressPhotoForShare(card.photo, 56, 0.5);
        if (thumb) thumbnails[card.id] = thumb;
      }
      let url = buildWeeklyBoardShareUrl(weekDates, cardsByDay, settings, thumbnails);

      if (url.length > 6000) {
        thumbnails = {};
        for (const card of photoCards) {
          const thumb = await compressPhotoForShare(card.photo, 32, 0.35);
          if (thumb) thumbnails[card.id] = thumb;
        }
        url = buildWeeklyBoardShareUrl(weekDates, cardsByDay, settings, thumbnails);
      }

      if (url.length > 6500) {
        url = buildWeeklyBoardShareUrl(weekDates, cardsByDay, settings, {});
        if (!cancelled) setShareDowngraded(true);
      }

      if (!cancelled) {
        setShareLoadingUrl(url);
        setShareCompressing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareOpen, weekDates, cardsByDay, settings]);

  const shareUrlToShow = shareLoadingUrl ?? shareUrl;

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrlToShow);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — link is still shown and selectable manually
    }
  }

  const rows = Array.from({ length: settings.rowCount }, (_, i) => i);
  const printRowHeightMm = Math.max(14, Math.min(29, 158 / Math.max(1, settings.rowCount)));

  return (
    <AppShell mode={mode}>
      <div className="mb-6 print:hidden">
        <div className="mb-1">
          <TherapistQuickTips />
        </div>
        <h1 className="font-display text-3xl font-black md:text-4xl">{t("לוח התארגנות שבועי", "Weekly Visual Planner")}</h1>
        <section className="mt-4 rounded-2xl border bg-card p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold">הלוחות שלי</span>
            <select value={activeBoardId} onChange={(e) => switchBoard(e.target.value)} className="min-w-44 rounded-full border bg-background px-3 py-2 text-sm font-bold">
              {boards.map((board) => <option key={board.id} value={board.id}>{displayBoardName(board.name)}</option>)}
            </select>
            <span className="text-xs text-muted-foreground">{Number.isFinite(weeklyBoardLimit()) ? `${boards.length}/${weeklyBoardLimit()}` : t(`${boards.length} לוחות`, `${boards.length} boards`)}</span>
            <Button size="sm" variant="outline" className="rounded-full" onClick={addBoard}><Plus className="h-4 w-4"/> לוח חדש</Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={renameBoard}><Pencil className="h-4 w-4"/> שינוי שם</Button>
            <Button size="sm" variant="ghost" className="rounded-full" onClick={copyBoard}><Files className="h-4 w-4"/> שכפול</Button>
            {boards.length > 1 && <Button size="sm" variant="ghost" className="rounded-full text-coral" onClick={removeBoard}><Trash2 className="h-4 w-4"/> מחיקה</Button>}
          </div>
        </section>
      </div>

      <div className="weekly-board-print-header hidden items-center justify-between print:flex">
        <img src="/boo-nesahek-logo.png" alt="בואו נשחק" className="weekly-board-print-logo object-contain" />
        <div className="text-center">
          <h1 className="font-display text-xl font-black">{displayBoardName(activeBoard?.name)}</h1>
          <p className="text-sm font-bold">{t("לוח התארגנות שבועי", "Weekly Visual Planner")} · {formatWeekRangeLabel(weekDates, language)}</p>
        </div>
        <div className="weekly-board-print-logo" aria-hidden />
      </div>

      {/* Week navigation */}
      <div className="print:hidden mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToWeek(-7)}
            aria-label="שבוע קודם"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="text-center">
            <div className="font-display text-lg font-black">{formatWeekRangeLabel(weekDates, language)}</div>
            <button type="button" onClick={goToToday} className="text-xs font-bold text-sage underline underline-offset-2">
              חזרה להיום
            </button>
          </div>
          <button
            type="button"
            onClick={() => goToWeek(7)}
            aria-label="שבוע הבא"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="inline-flex rounded-full bg-muted p-1">
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              viewMode === "week" ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            <CalendarDays className="h-3.5 w-3.5" /> תצוגה שבועית
          </button>
          <button
            type="button"
            onClick={() => setViewMode("day")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              viewMode === "day" ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            <ListTree className="h-3.5 w-3.5" /> יום בודד
          </button>
        </div>

        {totalCards > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={resetWeek} className="rounded-full text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5" /> איפוס השבוע הזה
            </Button>
            <Button variant="outline" onClick={() => setShareOpen(true)} className="rounded-full">
              <Share2 className="h-4 w-4" /> שיתוף למכשיר אחר
            </Button>
            <Button onClick={() => window.print()} className="rounded-full">
              <Printer className="h-4 w-4" /> הדפסה
            </Button>
          </div>
        )}
      </div>

      {/* Day tabs — quick navigation, with real dates */}
      <div className="print:hidden mb-3 flex gap-2 overflow-x-auto pb-1">
        {weekDates.map((date, i) => {
          const count = Object.keys(cardsByDay[i] ?? {}).length;
          const active = selectedDayIndex === i && viewMode === "day";
          const isToday = isSameDate(date, today);
          return (
            <button
              key={weekKeys[i]}
              type="button"
              onClick={() => openDay(i)}
              className={`flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
                active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground"
              } ${isToday ? "ring-2 ring-sage" : ""}`}
            >
              <span>
                {dayLabels[i]} {isToday ? t("· היום", "· Today") : ""}
              </span>
              <span className="text-[11px] font-semibold opacity-80">{formatDayDate(date)}</span>
              <span className="text-[10px] font-semibold opacity-60">{count > 0 ? t(`${count} כרטיסים`, `${count} cards`) : t("ריק", "Empty")}</span>
            </button>
          );
        })}
      </div>

      {/* show-times toggle — above the board, right side */}
      <div className="print:hidden mb-3 flex justify-start">
        <Button variant="outline" size="sm" onClick={toggleShowTimes} className="rounded-full">
          <Clock className="h-3.5 w-3.5" /> {settings.showTimes ? t("הסתרת שעות", "Hide times") : t("הצגת שעות", "Show times")}
        </Button>
      </div>

      {/* ---------- Clean table board ---------- */}
      <div className="weekly-board-print-table overflow-x-auto bg-white print:overflow-visible" style={{ "--weekly-row-height": `${printRowHeightMm}mm` }}>

        {viewMode === "week" ? (
          <div className="overflow-x-auto print:!overflow-visible">
            <table className="w-full table-fixed border-separate border-spacing-0 bg-white text-[9px] sm:min-w-[600px] sm:text-sm print:min-w-0 print:w-full">
              <thead>
                <tr>
                  {settings.showTimes && (
                    <th
                      className={`w-6 bg-sky/40 p-0.5 text-[8px] font-bold sm:w-12 sm:p-1 sm:text-sm ${edgeCell({
                        isFirstRow: true,
                        isLastRow: false,
                        isFirstCol: true,
                        isLastCol: false,
                      })}`}
                    >
                      {t("שעה", "Time")}
                    </th>
                  )}
                  {weekDates.map((date, i) => {
                    const isToday = isSameDate(date, today);
                    return (
                      <th
                        key={weekKeys[i]}
                        className={`cursor-pointer p-0.5 text-[8px] font-bold hover:bg-sky/60 sm:p-1.5 sm:text-sm ${
                          isToday ? "bg-sage/30" : "bg-sky/40"
                        } ${edgeCell({
                          isFirstRow: true,
                          isLastRow: false,
                          isFirstCol: i === 0 && !settings.showTimes,
                          isLastCol: i === 6,
                        })}`}
                        onClick={() => openDay(i)}
                      >
                        <div>
                          <span className="sm:hidden">{dayLabels[i][0]}</span>
                          <span className="hidden sm:inline">{dayLabels[i]}</span>
                        </div>
                        <div className="text-[7px] font-normal opacity-70 sm:text-xs">
                          <span className="sm:hidden">{date.getDate()}</span>
                          <span className="hidden sm:inline">{formatDayDate(date)}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((rowIndex) => {
                  const isLastRow = rowIndex === rows.length - 1;
                  return (
                    <tr key={rowIndex}>
                      {settings.showTimes && (
                        <td className={`bg-white p-0 ${edgeCell({ isFirstRow: false, isLastRow, isFirstCol: true, isLastCol: false })}`}>
                          <input
                            value={settings.rowTimes[rowIndex] ?? ""}
                            onChange={(e) => updateRowTime(rowIndex, e.target.value)}
                            placeholder={t("שעה", "Time")}
                            className="h-14 w-full bg-transparent px-0.5 text-center text-[8px] font-bold focus:outline-none focus:ring-2 focus:ring-primary sm:h-20 sm:px-1 sm:text-xs print:border-none"
                          />
                        </td>
                      )}
                      {weekDates.map((_, dayIndex) => (
                        <td
                          key={dayIndex}
                          className={`bg-white p-0 ${edgeCell({
                            isFirstRow: false,
                            isLastRow,
                            isFirstCol: dayIndex === 0 && !settings.showTimes,
                            isLastCol: dayIndex === 6,
                          })}`}
                        >
                          <Cell
                            language={language}
                            compact
                            kidsStyle={settings.boardStyle === "kids"}
                            card={cardsByDay[dayIndex]?.[rowIndex] ?? null}
                            onAdd={() => openAdd(dayIndex, rowIndex)}
                            onRemove={() => requestRemove(dayIndex, rowIndex)}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <table className="w-full border-separate border-spacing-0 bg-white text-sm">
            <thead>
              <tr>
                {settings.showTimes && (
                  <th
                    className={`w-16 bg-sky/40 p-2 text-sm font-bold ${edgeCell({ isFirstRow: true, isLastRow: false, isFirstCol: true, isLastCol: false })}`}
                  >
                    {t("שעה", "Time")}
                  </th>
                )}
                <th
                  className={`bg-sky/40 p-2 text-base font-bold ${edgeCell({
                    isFirstRow: true,
                    isLastRow: false,
                    isFirstCol: !settings.showTimes,
                    isLastCol: true,
                  })}`}
                >
                  {t(`יום ${dayLabels[selectedDayIndex]}`, dayLabels[selectedDayIndex])}, {formatDayDate(weekDates[selectedDayIndex])}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((rowIndex) => {
                const isLastRow = rowIndex === rows.length - 1;
                return (
                  <tr key={rowIndex}>
                    {settings.showTimes && (
                      <td className={`bg-white p-0 ${edgeCell({ isFirstRow: false, isLastRow, isFirstCol: true, isLastCol: false })}`}>
                        <input
                          value={settings.rowTimes[rowIndex] ?? ""}
                          onChange={(e) => updateRowTime(rowIndex, e.target.value)}
                          placeholder={t("שעה", "Time")}
                          className="h-32 w-full bg-transparent px-1 text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary sm:h-16"
                        />
                      </td>
                    )}
                    <td
                      className={`bg-white p-0 ${edgeCell({
                        isFirstRow: false,
                        isLastRow,
                        isFirstCol: !settings.showTimes,
                        isLastCol: true,
                      })}`}
                    >
                      <Cell
                        language={language}
                        kidsStyle={settings.boardStyle === "kids"}
                        card={cardsByDay[selectedDayIndex]?.[rowIndex] ?? null}
                        onAdd={() => openAdd(selectedDayIndex, rowIndex)}
                        onRemove={() => requestRemove(selectedDayIndex, rowIndex)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={addRow} className="rounded-full">
          <Plus className="h-3.5 w-3.5" /> הוספת משבצת
        </Button>
        {settings.rowCount > 1 && (
          <Button variant="ghost" size="sm" onClick={removeRow} className="rounded-full text-muted-foreground">
            <Minus className="h-3.5 w-3.5" /> הסרת משבצת
          </Button>
        )}
      </div>


      {/* ---------- Remove-recurring-card confirmation dialog ---------- */}
      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent className="max-h-[96vh] max-w-5xl p-5 md:p-6">
          <DialogHeader>
            <DialogTitle>מחיקת פעילות קבועה</DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-sm text-muted-foreground">
            הפעילות הזו קבועה וחוזרת כל שבוע. איך למחוק אותה?
          </p>
          <div className="space-y-2">
            <Button onClick={removeRecurringForThisWeekOnly} variant="outline" className="w-full rounded-full">
              מחיקה רק לשבוע הזה
            </Button>
            <Button onClick={removeRecurringEverywhere} variant="destructive" className="w-full rounded-full">
              מחיקת הפעילות (מכל השבועות)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------- Add card dialog ---------- */}
      <Dialog
        open={!!addTarget}
        onOpenChange={(open) => {
          if (!open) {
            setAddTarget(null);
            setOpenCategoryId(null);
          }
        }}
      >
        <DialogContent className="max-w-lg p-3 sm:p-4">
          <DialogHeader>
            <DialogTitle>
              {addTarget ? t(
                `הוספת כרטיס - יום ${dayLabels[addTarget.dayIndex]}, ${formatDayDate(weekDates[addTarget.dayIndex])}`,
                `Add card — ${dayLabels[addTarget.dayIndex]}, ${formatDayDate(weekDates[addTarget.dayIndex])}`
              ) : t("הוספת כרטיס", "Add card")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <div>
              <label className="mb-1 block text-sm font-bold">{t("בחרו סגנון", "Choose a style")}</label>
              <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-muted p-1">
                <button type="button" onClick={() => changeBoardStyle("general")} aria-pressed={settings.boardStyle === "general"} className={`flex items-center justify-center gap-2 rounded-xl px-2 py-1.5 text-sm font-bold transition ${settings.boardStyle === "general" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:bg-white/60"}`}>
                  <img src="/icon-bank/weekly-board/reading.webp" alt="" className="h-8 w-8 rounded-lg bg-white object-contain" />
                  {t("סגנון 1", "Style 1")}
                </button>
                <button type="button" onClick={() => changeBoardStyle("kids")} aria-pressed={settings.boardStyle === "kids"} className={`flex items-center justify-center gap-2 rounded-xl px-2 py-1.5 text-sm font-bold transition ${settings.boardStyle === "kids" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:bg-white/60"}`}>
                  <img src="/icon-bank/weekly-board-kids/reading.webp" alt="" className="h-8 w-8 rounded-lg bg-white object-cover" />
                  {t("סגנון 2", "Style 2")}
                </button>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold">{t("בחרו משימה", "Choose a task")}</label>
              <div className="space-y-1.5">
                {boardCategories.map((category) => (
                  <div key={category.id} className="overflow-hidden rounded-xl border border-border/50">
                    <button
                      type="button"
                      aria-expanded={openCategoryId === category.id}
                      onClick={() => setOpenCategoryId((current) => (current === category.id ? null : category.id))}
                      className="flex w-full items-center justify-between gap-3 px-3 py-1.5 text-sm font-bold text-foreground transition-colors hover:brightness-[0.98]"
                      style={{ backgroundColor: category.color }}
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full border border-black/10 bg-white/70" />
                        {weeklyBoardCategoryLabel(category, language)}
                        <span className="text-[11px] font-semibold text-foreground/60">({category.tasks.length})</span>
                      </span>
                      {openCategoryId === category.id ? (
                        <ChevronUp className="h-4 w-4 shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0" />
                      )}
                    </button>
                    {openCategoryId === category.id ? (
                      <div className="grid max-h-[38vh] grid-cols-3 gap-2 overflow-y-auto bg-white p-2 sm:grid-cols-4">
                        {category.tasks.map((task) => {
                          const selected = draft.taskId === task.id && !draft.photo;
                          return (
                            <button
                              key={task.id}
                              type="button"
                              onClick={() =>
                                setDraft((d) => ({
                                  ...d,
                                  title: weeklyBoardTaskTitle(task, language),
                                  taskId: task.id,
                                  image: task.image,
                                  categoryId: category.id,
                                  categoryColor: category.color,
                                  photo: null,
                                }))
                              }
                              className={`flex h-28 flex-col overflow-hidden rounded-xl border-2 text-center transition-colors ${
                                selected ? "border-sage shadow-sm" : "border-transparent hover:border-sage/40"
                              }`}
                              style={{ backgroundColor: category.color }}
                            >
                              <span className="flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
                                <img src={task.image} alt="" className={`h-full w-full object-contain mix-blend-multiply ${settings.boardStyle === "kids" ? "scale-110" : ""}`} />
                              </span>
                              <span className="w-full bg-transparent px-1.5 pb-1.5 text-xs font-extrabold leading-tight text-foreground">
                                {weeklyBoardTaskTitle(task, language)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold">{t("כותרת המשימה", "Task title")}</label>
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                placeholder={t("בחרו משימה למעלה או כתבו כותרת משלכם", "Choose a task above or enter your own title")}
                className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 items-stretch gap-2">
              <div className="rounded-xl border border-border/60 bg-background p-2.5">
                <label className="mb-1.5 block text-sm font-bold">{t("תמונה אישית (לא חובה)", "Personal photo (optional)")}</label>
                {draft.photo ? (
                  <div className="flex items-center gap-2">
                    <img src={draft.photo} alt="" className="h-10 w-10 rounded-lg border border-border/60 object-cover" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setDraft((d) => ({ ...d, photo: null }))} className="h-8 rounded-full px-3">
                      {t("הסרת תמונה", "Remove photo")}
                    </Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 rounded-full px-3">
                    <ImageIcon className="h-4 w-4" /> {t("העלאת תמונה", "Upload photo")}
                  </Button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </div>

              <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-border/60 bg-background p-2.5">
                <input
                  type="checkbox"
                  checked={draft.recurring}
                  onChange={(e) => setDraft((d) => ({ ...d, recurring: e.target.checked }))}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-sage"
                />
                <span className="text-sm">
                  <span className="flex items-center gap-1 font-bold"><Repeat className="h-3.5 w-3.5" /> {t("פעילות קבועה", "Recurring activity")}</span>
                  <span className="text-[11px] leading-tight text-muted-foreground">
                    {addTarget ? t(`תחזור כל שבוע ביום ${dayLabels[addTarget.dayIndex]}, באותה משבצת`, `Repeats every ${dayLabels[addTarget.dayIndex]} in the same slot`) : ""}
                  </span>
                </span>
              </label>
            </div>

            <Button onClick={saveDraft} disabled={!draft.title.trim()} className="w-full rounded-full">
              {t("הוספה ללוח", "Add to board")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------- Share dialog ---------- */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("שיתוף הלוח", "Share board")} - {formatWeekRangeLabel(weekDates, language)}</DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-sm text-muted-foreground">
            שלחו את הקישור הזה למכשיר אחר, או תנו למישהו לסרוק את קוד ה-QR - הוא יפתח את הלוח השבועי הזה, בדיוק כמו שקבעתם,
            כולל התמונות שהעליתם.
          </p>

          {shareCompressing ? (
            <p className="mb-4 text-center text-sm text-muted-foreground">מכינות את התמונות לקישור...</p>
          ) : shareDowngraded ? (
            <p className="mb-4 rounded-xl border border-butter/60 bg-butter/20 p-2 text-center text-xs text-foreground/80">
              יש הרבה תמונות בשבוע הזה, אז הקישור יצא ארוך מדי - הן יוצגו שם כאייקון 📷 במקום התמונה עצמה, כדי שהקישור עדיין יעבוד.
            </p>
          ) : null}

          <div className="mb-4 flex justify-center">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrlToShow)}`}
              alt="קוד QR לשיתוף הלוח השבועי"
              width={180}
              height={180}
              className="rounded-2xl border border-border/60 bg-white p-2"
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/50 p-2">
            <input
              readOnly
              value={shareUrlToShow}
              className="flex-1 bg-transparent px-2 text-sm text-muted-foreground sm:text-xs"
              onFocus={(e) => e.target.select()}
            />
            <Button type="button" size="sm" variant="ghost" onClick={copyShareLink} className="shrink-0 rounded-full" disabled={shareCompressing}>
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "הועתק" : "העתקה"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
