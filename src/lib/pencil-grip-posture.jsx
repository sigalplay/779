import { useState } from "react";

const POSTURE_POINTS = [
  {
    title: "כפות רגליים מונחות על משטח יציב",
    explanation: "רגליים באוויר גורמות לחוסר שקט מוטורי ולחוסר יציבות של האגן.",
    image: "/icon-bank/guidance/posture/1-feet.webp",
  },
  {
    title: "אגן צמוד למשענת הכיסא",
    explanation: "הברכיים והאגן בכיפוף של כ-90 מעלות בברכיים.",
    image: "/icon-bank/guidance/posture/2-pelvis.webp",
  },
  {
    title: "גב ישר ונתמך",
    explanation: "כדי למנוע עייפות של שרירי הליבה.",
    image: "/icon-bank/guidance/posture/3-back.webp",
  },
  {
    title: "אמות ומרפקים נחים על השולחן",
    explanation: "תמיכה זו מאפשרת לשרירים העדינים של כף היד והאצבעות לפעול בדיוק מרבי.",
    image: "/icon-bank/guidance/posture/4-elbows.webp",
  },
  {
    title: "יד עזר פעילה מייצבת את הדף",
    explanation: "מנח זה מייצר סנכרון דו-צדדי ומאזן את היציבה של כל פלג הגוף העליון.",
    image: "/icon-bank/guidance/posture/5-helper-hand.webp",
  },
];

export function PencilGripPostureGuide() {
  const [open, setOpen] = useState(() => new Set());

  function toggle(i) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground md:text-base">ישיבה נכונה לפני שכותבים או מציירים</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {POSTURE_POINTS.map((p, i) => {
          const isOpen = open.has(i);
          const isChair = p.title.includes("כיסא");
          return (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-cream"
            >
              <div className="relative flex h-40 w-full items-center justify-center overflow-hidden bg-white">
                <img src={p.image} alt="" className="h-full w-full object-contain" />
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-label="הצג הסבר"
                  className={`absolute left-1.5 top-1.5 flex items-center justify-center rounded-full shadow-sm transition-colors ${
                    isChair ? "h-9 w-9 text-lg" : "h-7 w-7 text-sm"
                  } ${isOpen ? "bg-sage/70" : "bg-background/90 hover:bg-sage/30"}`}
                >
                  💬
                </button>
              </div>
              <span className="flex min-h-14 w-full items-center justify-center bg-background/90 px-2 py-2 text-center text-sm font-semibold leading-tight text-blue-600">
                {p.title}
              </span>
              {isOpen ? (
                <p className="border-t border-border/60 bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  {p.explanation}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
