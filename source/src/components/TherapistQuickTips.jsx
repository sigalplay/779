import { useTranslator } from "@/lib/language";

const WEEKLY_BOARD_BENEFITS = [
  ["משמש כתומך זיכרון חיצוני, כך שנשארים יותר משאבים קוגניטיביים פנויים.", "Acts as an external memory aid, so more cognitive resources stay free."],
  ["מפחית חרדה ומעניק תחושת ביטחון - היכולת לראות מראש מה צפוי במהלך השבוע יוצרת סדר, ניבוי וודאות.", "Reduces anxiety and builds a sense of security – seeing the week ahead creates order, predictability, and certainty."],
  ["מעודד עצמאות - הלוח מעביר את השליטה לידי המשתמש, שלומד לבדוק את הלוח בעצמו ולנהל את היום.", "Encourages independence – the board hands control to the child, who learns to check it independently and manage the day."],
];

export function TherapistQuickTips() {
  const { t } = useTranslator();
  return (
    <details className="group relative inline-block print:hidden">
      <summary
        aria-label={t("יתרונות בלוח התארגנות שבועי", "Benefits of a weekly visual schedule")}
        className="flex list-none items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-sm font-bold shadow-sm transition-colors marker:content-none group-open:border-sage group-open:bg-sage/20 hover:bg-muted"
      >
        <span className="text-lg" aria-hidden>💡</span>
        {t("יתרונות בלוח התארגנות שבועי", "Benefits of a weekly visual schedule")}
      </summary>
      <div
        role="dialog"
        aria-label={t("יתרונות בלוח התארגנות שבועי", "Benefits of a weekly visual schedule")}
        className="absolute top-full z-40 mt-2 w-72 rounded-2xl border border-border/60 bg-card p-4 shadow-lg sm:right-0"
      >
        <p className="mb-2 text-xs leading-relaxed text-foreground/90">
          {t("לוח התארגנות שבועי מסייע בתכנון מראש, תיעדוף משימות, ניהול זמן יעיל ופתרון בעיות שעלולות לצוץ במהלך השבוע.", "A weekly visual planner supports advance planning, prioritising tasks, managing time, and solving problems that may arise during the week.")}
        </p>
        <ul className="space-y-1.5">
          {WEEKLY_BOARD_BENEFITS.map(([hebrew, english], i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs leading-relaxed text-foreground/90">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sage-foreground/70" aria-hidden />
              <span>{t(hebrew, english)}</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
