import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Printer, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { parseWeeklyBoardShareParams } from "@/lib/storage";

const DAY_LABELS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const MONTH_LABELS = [
  "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
  "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר",
];

function formatDayDate(d) {
  return `${d.getDate()}.${d.getMonth() + 1}`;
}
function formatWeekRangeLabel(days) {
  const first = days[0].date;
  const last = days[6].date;
  if (first.getMonth() === last.getMonth()) return `${MONTH_LABELS[first.getMonth()]} ${first.getFullYear()}`;
  return `${MONTH_LABELS[first.getMonth()]}–${MONTH_LABELS[last.getMonth()]} ${last.getFullYear()}`;
}

// כל תא מצייר רק את הגבול העליון והימני שלו (בהתאמה ל-RTL) - כך שבטבלה עם border-separate
// אין הכפלה של קווים בגבולות פנימיים, ולתאי הפינות מתווסף עיגול פינה תואם לעובי אחיד לכל האורך.
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

export default function SharedWeeklyBoard() {
  const [searchParams] = useSearchParams();
  const parsed = useMemo(() => parseWeeklyBoardShareParams(searchParams), [searchParams]);

  // ההדפסה של הלוח השבועי רחבה מדף A4 לאורך - עוברים לנוף (landscape) ולרוחב מלא כל עוד הדף הזה פתוח.
  useEffect(() => {
    document.body.classList.add("print-landscape");
    const style = document.createElement("style");
    style.id = "shared-weekly-board-print-style";
    style.textContent = "@media print { @page { size: A4 landscape; margin: 6mm; } }";
    document.head.appendChild(style);
    return () => {
      document.body.classList.remove("print-landscape");
      style.remove();
    };
  }, []);

  if (!parsed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-6 text-center" dir="rtl">
        <p className="text-lg text-muted-foreground">הקישור הזה לא תקין. בקשו קישור חדש ללוח השבועי.</p>
      </div>
    );
  }

  const { days, rowCount, showTimes, rowTimes, boardStyle } = parsed;
  const rows = Array.from({ length: rowCount }, (_, i) => i);
  const printRowHeightMm = Math.max(14, Math.min(29, 158 / Math.max(1, rowCount)));
  const today = new Date();
  const isToday = (d) => d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="shared-weekly-board-page mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-sage-foreground" />
            <div>
              <h1 className="font-display text-2xl font-black md:text-3xl">הלוח השבועי שלנו</h1>
              <p className="text-sm text-muted-foreground">{formatWeekRangeLabel(days)}</p>
            </div>
          </div>
          <Button onClick={() => window.print()} className="rounded-full">
            <Printer className="h-4 w-4" /> הדפסה
          </Button>
        </div>

        <h1 className="shared-weekly-board-title mb-4 hidden text-center font-display text-xl font-bold print:block">
          הלוח השבועי שלנו - {formatWeekRangeLabel(days)}
        </h1>

        <div className="shared-weekly-board-table overflow-x-auto bg-white print:overflow-visible" style={{ "--weekly-row-height": `${printRowHeightMm}mm` }}>
          <table className="w-full table-fixed border-separate border-spacing-0 bg-white text-[9px] sm:min-w-[600px] sm:text-sm print:min-w-0 print:w-full">
            <thead>
              <tr>
                {showTimes && (
                  <th
                    className={`w-6 bg-sky/40 p-0.5 text-[8px] font-bold sm:w-12 sm:p-1 sm:text-sm ${edgeCell({
                      isFirstRow: true,
                      isLastRow: false,
                      isFirstCol: true,
                      isLastCol: false,
                    })}`}
                  >
                    שעה
                  </th>
                )}
                {days.map((day, i) => (
                  <th
                    key={day.key}
                    className={`p-0.5 text-[8px] font-bold sm:p-1.5 sm:text-sm ${isToday(day.date) ? "bg-sage/30" : "bg-sky/40"} ${edgeCell({
                      isFirstRow: true,
                      isLastRow: false,
                      isFirstCol: i === 0 && !showTimes,
                      isLastCol: i === 6,
                    })}`}
                  >
                    <div>
                      <span className="sm:hidden">{DAY_LABELS[i][0]}</span>
                      <span className="hidden sm:inline">{DAY_LABELS[i]}</span>
                    </div>
                    <div className="text-[7px] font-normal opacity-70 sm:text-xs">
                      <span className="sm:hidden">{day.date.getDate()}</span>
                      <span className="hidden sm:inline">{formatDayDate(day.date)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((rowIndex) => {
                const isLastRow = rowIndex === rows.length - 1;
                return (
                  <tr key={rowIndex}>
                    {showTimes && (
                      <td
                        className={`bg-white p-0.5 text-center text-[8px] font-bold sm:p-1 sm:text-xs ${edgeCell({
                          isFirstRow: false,
                          isLastRow,
                          isFirstCol: true,
                          isLastCol: false,
                        })}`}
                      >
                        {rowTimes[rowIndex] || ""}
                      </td>
                    )}
                    {days.map((day, dayIndex) => {
                      const card = day.cards[rowIndex];
                      return (
                        <td
                          key={dayIndex}
                          className={`bg-white p-0 ${edgeCell({
                            isFirstRow: false,
                            isLastRow,
                            isFirstCol: dayIndex === 0 && !showTimes,
                            isLastCol: dayIndex === 6,
                          })}`}
                        >
                          {card ? (
                            <div
                              className="weekly-board-card relative flex h-14 w-full flex-col items-center justify-center overflow-hidden bg-white p-0 text-center sm:h-20"
                            >
                              {card.categoryColor ? (
                                <span
                                  aria-hidden
                                  className="pointer-events-none absolute inset-0 z-[15] border"
                                  style={{ borderColor: card.categoryColor }}
                                />
                              ) : null}
                              <div className="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden bg-white">
                                {card.photo ? (
                                  <img src={card.photo} alt="" className="h-full w-full object-cover" />
                                ) : card.image ? (
                                  <img src={card.image} alt="" className={`h-full w-full object-contain mix-blend-multiply ${boardStyle === "kids" ? "scale-110" : ""}`} />
                                ) : (
                                  <span className="text-base" aria-hidden>{card.emoji}</span>
                                )}
                              </div>
                              {card.title ? (
                                <span className="absolute inset-x-0 bottom-0 z-10 w-full truncate bg-transparent px-1 py-0.5 text-[7px] font-extrabold leading-tight text-foreground sm:text-[11px]" style={{ textShadow: "0 1px 2px rgba(255,255,255,.95), 0 0 4px rgba(255,255,255,.9)" }}>
                                  {card.title}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <div className="weekly-board-empty h-14 w-full sm:h-20" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="shared-weekly-board-logo hidden items-center justify-start print:flex">
          <img src="/boo-nesahek-logo.png" alt="בואו נשחק" className="h-11 w-auto object-contain" />
        </div>
      </div>
    </div>
  );
}
