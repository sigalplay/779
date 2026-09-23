import { useState } from "react";
import { X } from "lucide-react";
import { WRITING_GUIDELINE_POINTS } from "@/lib/writing-guidelines";

const GUIDE_IMAGE = "/icon-bank/guidance/writing/writing-guidelines-notebook.png";

const hotspots = [
  { right: "6.1%", top: "23.5%" },
  { right: "6.1%", top: "49.9%" },
  { right: "6.1%", top: "74.8%" },
  { left: "42.4%", top: "32.3%" },
  { left: "42.4%", top: "57.4%" },
];

export function WritingGuidelinesGuide() {
  const [openExplanation, setOpenExplanation] = useState(null);
  const activePoint = openExplanation === null ? null : WRITING_GUIDELINE_POINTS[openExplanation];

  return (
    <div className="w-full pb-1">
      <div className="relative mx-auto aspect-[1230/783] w-full max-w-[820px] overflow-hidden rounded-2xl bg-white shadow-sm">
        <img
          src={GUIDE_IMAGE}
          alt="מחברת פתוחה ובה חמשת הדגשים לכתיבה נכונה, עם המחשות של רכבת וקרונות"
          className="absolute inset-0 h-full w-full object-contain"
        />

        {hotspots.map((position, index) => (
          <button
            key={index}
            type="button"
            aria-label={`הסבר מלא: ${WRITING_GUIDELINE_POINTS[index].title}`}
            aria-expanded={openExplanation === index}
            onClick={() => setOpenExplanation((current) => (current === index ? null : index))}
            className="absolute z-10 h-[6.2%] min-h-8 aspect-square rounded-full bg-white/5 ring-2 ring-transparent transition hover:bg-coral/10 hover:ring-coral/45 focus-visible:bg-coral/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            style={position}
          />
        ))}

        {activePoint && (
          <div className="absolute bottom-[7%] left-1/2 z-20 w-[62%] -translate-x-1/2 rounded-2xl border border-coral/25 bg-white/95 px-5 py-4 text-center shadow-xl backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setOpenExplanation(null)}
              aria-label="סגירת ההסבר"
              className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="font-bold text-foreground">{activePoint.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{activePoint.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
