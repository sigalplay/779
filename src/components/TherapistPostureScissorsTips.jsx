import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { PencilGripPostureGuide } from "@/lib/pencil-grip-posture";
import { SCISSOR_TIP_CARDS } from "@/lib/scissors-tips";
import { WritingGuidelinesGuide } from "@/components/WritingGuidelinesGuide";
import { COLORING_TIP_CARDS } from "@/lib/coloring-tips";

function TipButton({ icon, emoji, label, open, onToggle }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={open}
      onClick={onToggle}
      className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-white p-1 shadow-md transition-colors ${
        open ? "border-sage bg-sage/20" : "hover:bg-muted"
      }`}
    >
      {icon ? (
        <img src={icon} alt="" aria-hidden="true" className="h-full w-full object-contain" />
      ) : (
        <span aria-hidden="true" className="text-3xl leading-none">
          {emoji}
        </span>
      )}
    </button>
  );
}

function TipPanel({ label, open, onClose, children }) {
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
        className="fixed left-1/2 top-1/2 z-50 max-h-[88vh] w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-border/60 bg-card p-4 shadow-2xl md:p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="סגירה"
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

export function TherapistPostureScissorsTips({ children = null, showScissors = true }) {
  const [openPanel, setOpenPanel] = useState(null); // "posture" | "scissors" | "writing" | "coloring" | null

  function toggle(panel) {
    setOpenPanel((cur) => (cur === panel ? null : panel));
  }

  return (
    <div className="fixed left-4 top-[calc(50%-4rem)] z-40 flex flex-col gap-3 print:hidden">
      <div className="relative">
        <TipButton
          icon="/icon-bank/ui/posture-chair.webp"
          label="דגשים לישיבה נכונה"
          open={openPanel === "posture"}
          onToggle={() => toggle("posture")}
        />
        <TipPanel label="דגשים לישיבה נכונה" open={openPanel === "posture"} onClose={() => setOpenPanel(null)}>
          <PencilGripPostureGuide />
        </TipPanel>
      </div>

      {showScissors ? <div className="relative">
        <TipButton
          icon="/icon-bank/ui/cutting-scissors.webp"
          label="דגשים לגזירה נכונה"
          open={openPanel === "scissors"}
          onToggle={() => toggle("scissors")}
        />
        <TipPanel label="דגשים לגזירה נכונה" open={openPanel === "scissors"} onClose={() => setOpenPanel(null)}>
          <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3 lg:grid-cols-5">
            {SCISSOR_TIP_CARDS.map((tip, i) => (
              <div
                key={i}
                className="flex min-h-48 flex-col items-center justify-start gap-3 rounded-3xl border border-sage/30 bg-sage/10 p-4 text-center"
              >
                <div className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-white p-1">
                  {tip.image ? (
                    <img src={tip.image} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <tip.icon />
                  )}
                </div>
                <span className="text-sm font-semibold leading-snug text-foreground md:text-base">{tip.text}</span>
              </div>
            ))}
          </div>
        </TipPanel>
      </div> : null}

      <div className="relative">
        <TipButton
          icon="/icon-bank/guidance/writing/notebook-pencil.png"
          label="דגשים לכתיבה"
          open={openPanel === "writing"}
          onToggle={() => toggle("writing")}
        />
        <TipPanel label="דגשים לכתיבה" open={openPanel === "writing"} onClose={() => setOpenPanel(null)}>
          <WritingGuidelinesGuide />
        </TipPanel>
      </div>

      <div className="relative">
        <TipButton
          icon="/icon-bank/guidance/coloring/1-relaxed-grip.webp"
          label="דגשים לצביעה"
          open={openPanel === "coloring"}
          onToggle={() => toggle("coloring")}
        />
        <TipPanel label="דגשים לצביעה" open={openPanel === "coloring"} onClose={() => setOpenPanel(null)}>
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            {COLORING_TIP_CARDS.map((tip, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-cream">
                <div className="flex h-48 w-full items-center justify-center overflow-hidden bg-white p-1">
                  <img src={tip.image} alt="" className="h-full w-full object-contain" />
                </div>
                <div className="flex flex-1 flex-col gap-2 px-4 py-3 text-center">
                  <h3 className="font-bold leading-snug text-blue-600">{tip.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{tip.text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-sage/10 px-4 py-3 text-center text-sm font-semibold">
            לא חייבים להישאר בדיוק בתוך הקווים — המטרה היא לתרגל וליהנות.
          </p>
        </TipPanel>
      </div>

      {children}
    </div>
  );
}
