import { useRef } from "react";
import { useTranslator } from "@/lib/language";

// חיפוש מהיר לפי שם הפעילות, מעל רשת הכרטיסים (עיצוב: styles/v92-board-and-search.css).
export function normalizeName(value) {
  return String(value || "").trim().toLocaleLowerCase("he").replace(/\s+/g, " ");
}

export function matchesName(title, query) {
  const q = normalizeName(query);
  return !q || normalizeName(title).includes(q);
}

export function ActivityNameSearch({ value, onChange, shown }) {
  const { t } = useTranslator();
  const input = useRef(null);
  const hasQuery = Boolean(normalizeName(value));
  const status = hasQuery && !shown
    ? t("לא נמצאה פעילות בשם הזה", "No activity with that name was found")
    : hasQuery ? t(`${shown} פעילויות נמצאו`, `${shown} activities found`) : "";
  return (
    <div className={`activity-name-search${hasQuery ? " has-query" : ""}`} data-activity-name-search="true">
      <span aria-hidden="true">⌕</span>
      <input
        ref={input}
        type="search"
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("חיפוש לפי שם הפעילות…", "Search by activity name…")}
        aria-label={t("חיפוש לפי שם הפעילות", "Search by activity name")}
      />
      <button
        type="button"
        aria-label={t("ניקוי החיפוש", "Clear search")}
        title={t("ניקוי החיפוש", "Clear search")}
        onClick={() => { onChange(""); input.current?.focus(); }}
      >
        ×
      </button>
      <small role="status">{status}</small>
    </div>
  );
}
