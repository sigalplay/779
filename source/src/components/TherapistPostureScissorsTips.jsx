import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { useTranslator } from "@/lib/language";
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

export function TherapistPostureScissorsTips({
  children = null,
  showScissors = true,
  hideTriggers = false,
  language: languageProp,
  openPanel: controlledOpenPanel,
  onOpenPanelChange,
}) {
  const { language: currentLanguage } = useTranslator();
  const language = languageProp || currentLanguage;
  // On phones the icons can be hidden; the choice is remembered on this device.
  const [iconsHidden, setIconsHidden] = useState(() => {
    try { return localStorage.getItem("boo_mobile_tip_icons_hidden") === "1"; } catch { return false; }
  });
  useEffect(() => {
    try { localStorage.setItem("boo_mobile_tip_icons_hidden", iconsHidden ? "1" : "0"); } catch { /* storage blocked */ }
  }, [iconsHidden]);
  const [uncontrolledOpenPanel, setUncontrolledOpenPanel] = useState(null);
  const isControlled = controlledOpenPanel !== undefined;
  const openPanel = isControlled ? controlledOpenPanel : uncontrolledOpenPanel;
  const setOpenPanel = (next) => {
    if (!isControlled) setUncontrolledOpenPanel(next);
    onOpenPanelChange?.(next);
  };
  const text = (hebrew, english) => language === "en" ? english : hebrew;

  function toggle(panel) {
    setOpenPanel(openPanel === panel ? null : panel);
  }

  return (
    <div className={hideTriggers ? "print:hidden" : "fixed left-4 top-[calc(50%-4rem)] z-40 flex flex-col gap-3 print:hidden"}>
      {!hideTriggers && (
        <button
          type="button"
          onClick={() => { setIconsHidden((value) => !value); setOpenPanel(null); }}
          aria-label={iconsHidden ? text("הצגת סמלי העזר", "Show the support icons") : text("הסתרת סמלי העזר", "Hide the support icons")}
          aria-expanded={!iconsHidden}
          title={iconsHidden ? text("הצגת סמלי העזר", "Show the support icons") : text("הסתרת סמלי העזר", "Hide the support icons")}
          className="flex h-11 w-11 items-center justify-center self-center rounded-full border border-border/60 bg-white text-muted-foreground shadow-md md:hidden"
        >
          {iconsHidden ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
        </button>
      )}
      <div className={iconsHidden ? "hidden md:contents" : "contents"}>
      {!hideTriggers && (
      <div className="relative">
        <TipButton
          icon="/icon-bank/ui/posture-chair.webp"
          label={text("דגשים לישיבה נכונה", "Tips for good sitting posture")}
          open={openPanel === "posture"}
          onToggle={() => toggle("posture")}
        />
      </div>)}

      {!hideTriggers && showScissors ? <div className="relative">
        <TipButton
          icon="/icon-bank/ui/cutting-scissors.webp"
          label={text("דגשים לגזירה נכונה", "Tips for cutting correctly")}
          open={openPanel === "scissors"}
          onToggle={() => toggle("scissors")}
        />
      </div> : null}

      {!hideTriggers && <div className="relative">
        <TipButton
          icon="/icon-bank/guidance/writing/notebook-pencil.png"
          label={text("דגשים לכתיבה", "Handwriting tips")}
          open={openPanel === "writing"}
          onToggle={() => toggle("writing")}
        />
      </div>}

      {!hideTriggers && <div className="relative">
        <TipButton
          icon="/icon-bank/guidance/coloring/1-relaxed-grip.webp"
          label={text("דגשים לצביעה", "Coloring tips")}
          open={openPanel === "coloring"}
          onToggle={() => toggle("coloring")}
        />
      </div>}

      <TipPanel label={text("דגשים לגזירה נכונה", "Tips for cutting correctly")} open={openPanel === "scissors"} onClose={() => setOpenPanel(null)}>
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

      <TipPanel label={text("דגשים לכתיבה", "Handwriting tips")} open={openPanel === "writing"} onClose={() => setOpenPanel(null)}>
        <WritingGuidelinesGuide language={language} />
      </TipPanel>

      <TipPanel label={text("דגשים לצביעה", "Coloring tips")} open={openPanel === "coloring"} onClose={() => setOpenPanel(null)}>
          <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-3">
            {COLORING_TIP_CARDS.map((tip, i) => (
              <div key={i} className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-cream">
                <div className="flex h-48 w-full items-center justify-center overflow-hidden bg-white p-1">
                  <img src={tip.image} alt="" className="h-full w-full object-contain" />
                </div>
                <div className="flex flex-1 flex-col gap-2 px-4 py-3 text-center">
                  <h3 className="font-bold leading-snug text-blue-600">{language === "en" ? tip.titleEn : tip.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{language === "en" ? tip.textEn : tip.text}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-2xl bg-sage/10 px-4 py-3 text-center text-sm font-semibold">
            {text("לא חייבים להישאר בדיוק בתוך הקווים — המטרה היא לתרגל וליהנות.", "Staying perfectly inside the lines is not required — the goal is to practice and enjoy.")}
          </p>
      </TipPanel>

      <TipPanel label={text("דגשים לישיבה נכונה", "Tips for good sitting posture")} open={openPanel === "posture"} onClose={() => setOpenPanel(null)}>
        <PencilGripPostureGuide language={language} />
      </TipPanel>

      {children}
      </div>
    </div>
  );
}
