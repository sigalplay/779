import { useState } from "react";
import { addBoardDays, localTodayIso } from "@/lib/session-board-storage";

function formatDate(value, language) {
  try {
    return new Intl.DateTimeFormat(language === "en" ? "en-US" : "he-IL", { day: "numeric", month: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));
  } catch {
    return value;
  }
}

// Previous / current / next treatment board, a list of saved boards, and "copy to next week".
// "Previous" and "next" jump to the nearest saved board; with none, they move a week.
export function BoardDateNavigation({ date, savedDates, language, onNavigate, onCopyToNextWeek }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [copyState, setCopyState] = useState("idle");
  const dates = [...new Set([...(savedDates || []), date])].sort();

  function neighbor(direction) {
    const candidates = direction < 0 ? dates.filter((d) => d < date) : dates.filter((d) => d > date);
    if (candidates.length) return direction < 0 ? candidates[candidates.length - 1] : candidates[0];
    return addBoardDays(date, direction * 7);
  }

  async function copy() {
    setCopyState("copying");
    try {
      await onCopyToNextWeek(addBoardDays(date, 7));
      setCopyState("idle");
    } catch {
      setCopyState("error");
    }
  }

  return (
    <section className="meeting-board-date-navigation" data-board-date-navigation="true" aria-label={t("מעבר בין לוחות טיפול", "Navigate treatment boards")}>
      <button type="button" className="meeting-board-date-card" data-previous-board="" onClick={() => onNavigate(neighbor(-1))}>
        <span className="meeting-date-arrow" aria-hidden="true">‹</span>
        <strong>{t("הטיפול הקודם", "Previous session")}</strong>
      </button>
      <label className="meeting-board-date-card meeting-current-date">
        <strong>{date === localTodayIso() ? t("היום", "Today") : t("תאריך הטיפול", "Session date")}</strong>
        <span>{formatDate(date, language)}</span>
        <input type="date" value={date} data-board-date-input="" aria-label={t("בחירת תאריך טיפול", "Choose a session date")} onChange={(e) => e.target.value && onNavigate(e.target.value)} />
      </label>
      <button type="button" className="meeting-board-date-card" data-next-board="" onClick={() => onNavigate(neighbor(1))}>
        <strong>{t("הטיפול הבא", "Next session")}</strong>
        <span className="meeting-date-arrow" aria-hidden="true">›</span>
      </button>
      <select data-saved-board-select="" aria-label={t("מעבר ללוח טיפול שמור", "Open a saved treatment board")} value={date} onChange={(e) => e.target.value && onNavigate(e.target.value)}>
        <option value="">{t("מעבר ללוח שמור…", "Open a saved board…")}</option>
        {dates.map((value) => <option key={value} value={value}>{formatDate(value, language)}</option>)}
      </select>
      <button type="button" className="meeting-copy-board" data-copy-next-board="" disabled={copyState === "copying"} onClick={copy}>
        {copyState === "copying" ? t("משכפלת…", "Copying…") : copyState === "error" ? t("נסי שוב", "Try again") : t("שכפול לשבוע הבא", "Copy to next week")}
      </button>
    </section>
  );
}
