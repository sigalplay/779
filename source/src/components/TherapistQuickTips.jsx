const WEEKLY_BOARD_BENEFITS = [
  "משמש כתומך זיכרון חיצוני, כך שנשארים יותר משאבים קוגניטיביים פנויים.",
  "מפחית חרדה ומעניק תחושת ביטחון - היכולת לראות מראש מה צפוי במהלך השבוע יוצרת סדר, ניבוי וודאות.",
  "מעודד עצמאות - הלוח מעביר את השליטה לידי המשתמש, שלומד לבדוק את הלוח בעצמו ולנהל את היום.",
];

export function TherapistQuickTips() {
  return (
    <details className="group relative inline-block print:hidden">
      <summary
        aria-label="יתרונות בלוח התארגנות שבועי"
        className="flex list-none items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1.5 text-sm font-bold shadow-sm transition-colors marker:content-none group-open:border-sage group-open:bg-sage/20 hover:bg-muted"
      >
        <span className="text-lg" aria-hidden>💡</span>
        יתרונות בלוח התארגנות שבועי
      </summary>
      <div
        role="dialog"
        aria-label="יתרונות בלוח התארגנות שבועי"
        className="absolute top-full z-40 mt-2 w-72 rounded-2xl border border-border/60 bg-card p-4 shadow-lg sm:right-0"
      >
        <p className="mb-2 text-xs leading-relaxed text-foreground/90">
          לוח התארגנות שבועי מסייע בתכנון מראש, תיעדוף משימות, ניהול זמן יעיל ופתרון בעיות שעלולות לצוץ במהלך השבוע.
        </p>
        <ul className="space-y-1.5">
          {WEEKLY_BOARD_BENEFITS.map((point, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs leading-relaxed text-foreground/90">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sage-foreground/70" aria-hidden />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
