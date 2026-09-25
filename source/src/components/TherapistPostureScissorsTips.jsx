import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useTranslator } from "@/lib/language";
import { PencilGripPostureGuide } from "@/lib/pencil-grip-posture";
import { SCISSOR_TIP_CARDS } from "@/lib/scissors-tips";
import { WritingGuidelinesGuide } from "@/components/WritingGuidelinesGuide";
import { COLORING_TIP_CARDS } from "@/lib/coloring-tips";

function TipPanel({ label, open, onClose, children }) {
  const { t } = useTranslator();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-foreground/45 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="mobile-guidance-dialog fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-border/60 bg-card p-4 shadow-2xl md:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("סגירה", "Close")}
          className="absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="mb-4 mt-1 pr-1 font-display text-2xl font-black">{label}</h2>
        <div>{children}</div>
      </div>
    </>
  );
}

// The four guidance windows (sitting, cutting, writing, coloring). They are opened from the toolbox
// (components/toolbox), which passes the open window in `openPanel`.
export function TherapistPostureScissorsTips({ language: languageProp, openPanel, onOpenPanelChange }) {
  const { language: currentLanguage, t } = useTranslator();
  const language = languageProp || currentLanguage;
  const text = (hebrew, english) => language === "en" ? english : hebrew;
  const setOpenPanel = (next) => onOpenPanelChange?.(next);

  return (
    <div className="print:hidden">
      <TipPanel label={text(t("דגשים לגזירה נכונה", "Tips for cutting correctly"), "Tips for cutting correctly")} open={openPanel === "scissors"} onClose={() => setOpenPanel(null)}>
        <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3 lg:grid-cols-5">
          {SCISSOR_TIP_CARDS.map((tip, i) => (
            <div key={i} className="flex min-h-48 flex-col items-center justify-start gap-3 rounded-3xl border border-sage/30 bg-sage/10 p-4 text-center">
              <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-white p-1">
                {tip.image ? <img src={tip.image} alt="" className="h-full w-full object-contain" /> : <tip.icon />}
              </div>
              <span className="text-sm font-semibold leading-snug text-foreground md:text-base">{language === "en" ? tip.textEn : tip.text}</span>
            </div>
          ))}
        </div>
      </TipPanel>

      <TipPanel label={text(t("דגשים לכתיבה", "Handwriting tips"), "Handwriting tips")} open={openPanel === "writing"} onClose={() => setOpenPanel(null)}>
        <WritingGuidelinesGuide language={language} />
      </TipPanel>

      <TipPanel label={text(t("דגשים לצביעה", "Coloring tips"), "Coloring tips")} open={openPanel === "coloring"} onClose={() => setOpenPanel(null)}>
          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3 lg:grid-cols-5">
            {COLORING_TIP_CARDS.map((tip, i) => (
              <div key={i} className="flex flex-col items-center justify-start gap-3 rounded-3xl border border-sage/30 bg-sage/10 p-4 text-center">
                <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-white p-1">
                  <img src={tip.image} alt="" className="h-full w-full object-contain" />
                </div>
                <span className="text-sm font-semibold leading-snug text-foreground md:text-base">{language === "en" ? tip.titleEn : tip.title}</span>
                <p className="text-xs leading-snug text-muted-foreground md:text-sm">{language === "en" ? tip.textEn : tip.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-sage/10 px-4 py-3 text-center text-sm font-semibold">
            {text(t("לא חייבים לצבוע בדיוק בתוך הקווים — העיקר לתרגל וליהנות.", "No need to stay exactly inside the lines — the point is to practice and have fun."), "No need to stay exactly inside the lines — the point is to practice and have fun.")}
          </p>
      </TipPanel>

      <TipPanel label={text(t("דגשים לישיבה נכונה", "Tips for good sitting posture"), "Tips for good sitting posture")} open={openPanel === "posture"} onClose={() => setOpenPanel(null)}>
        <PencilGripPostureGuide language={language} />
      </TipPanel>
    </div>
  );
}
