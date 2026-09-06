import { useState } from "react";
import { Info } from "lucide-react";
import { TERM_GLOSSARY } from "@/lib/term-glossary";

const TONE_CLASSES = {
  sage: "bg-sage/20",
  sky: "bg-sky/40",
  default: "bg-muted",
};

export function TagList({ items, tone }) {
  const [open, setOpen] = useState(null);
  const cls = TONE_CLASSES[tone] ?? TONE_CLASSES.default;

  if (!items?.length) return null;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((t) => {
          const explanation = TERM_GLOSSARY[t];
          return (
            <button
              key={t}
              type="button"
              onClick={() => explanation && setOpen((prev) => (prev === t ? null : t))}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm transition ${cls} ${
                explanation ? "cursor-pointer hover:brightness-95" : "cursor-default"
              }`}
            >
              {t}
              {explanation ? <Info className="h-3 w-3 opacity-60" aria-hidden /> : null}
            </button>
          );
        })}
      </div>
      {open && TERM_GLOSSARY[open] ? (
        <div className="mt-2 rounded-2xl bg-muted/60 px-3.5 py-2.5 text-sm leading-relaxed text-foreground/80">
          <b className="font-bold">{open}: </b>
          {TERM_GLOSSARY[open]}
        </div>
      ) : null}
    </div>
  );
}
