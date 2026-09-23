import { useEffect, useRef, useState } from "react";
import { Armchair, ChevronLeft, ChevronRight, Clock3, Hand, Menu, Palette, Pencil, Scissors, X } from "lucide-react";
import { VISUAL_SIGNS, localizedSignLabel } from "@/lib/session-board-tools";
import { cn } from "@/lib/utils";

export function FullscreenBoardTools({ language = "he", onGuide, onTimer, onPen, penActive, onAddSign }) {
  const [open, setOpen] = useState(false);
  const [showSigns, setShowSigns] = useState(false);
  const closeButtonRef = useRef(null);
  const isEnglish = language === "en";
  const text = (hebrew, english) => isEnglish ? english : hebrew;

  useEffect(() => {
    if (!open) return undefined;
    closeButtonRef.current?.focus();
    const onKeyDown = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function choose(callback) {
    callback();
    setOpen(false);
    setShowSigns(false);
  }

  const tools = [
    { id: "posture", label: text("דגשים לישיבה", "Sitting posture"), icon: Armchair, action: () => onGuide("posture") },
    { id: "coloring", label: text("דגשים לצביעה", "Coloring tips"), icon: Palette, action: () => onGuide("coloring") },
    { id: "scissors", label: text("דגשים לגזירה", "Cutting tips"), icon: Scissors, action: () => onGuide("scissors") },
    { id: "writing", label: text("דגשים לכתיבה", "Writing tips"), icon: Pencil, action: () => onGuide("writing") },
    { id: "signs", label: text("סימנים", "Visual signs"), icon: Hand, action: () => setShowSigns(true) },
    { id: "timer", label: text("טיימר", "Timer"), icon: Clock3, action: onTimer },
    { id: "pen", label: penActive ? text("סגירת עט", "Close pen") : text("עט", "Pen"), icon: Pencil, action: onPen, active: penActive },
  ];

  return (
    <div dir={isEnglish ? "ltr" : "rtl"} className="board-tools-root print:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={text("פתיחת כלי הלוח", "Open board tools")}
        aria-expanded={open}
        className={cn("board-tools-edge-trigger", isEnglish ? "left-0 rounded-r-2xl" : "right-0 rounded-l-2xl")}
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && <button type="button" className="board-tools-backdrop" aria-label={text("סגירת כלי הלוח", "Close board tools")} onClick={() => setOpen(false)} />}
      <aside className={cn("board-tools-drawer", open && "is-open", isEnglish ? "is-ltr" : "is-rtl")} aria-hidden={!open} aria-label={text("כלי לוח המפגש", "Session board tools")}>
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            {showSigns && <button type="button" onClick={() => setShowSigns(false)} className="rounded-full p-2 hover:bg-muted" aria-label={text("חזרה לכלים", "Back to tools")}>{isEnglish ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}</button>}
            <h2 className="font-display text-xl font-black">{showSigns ? text("בחירת סימן", "Choose a sign") : text("כלי הלוח", "Board tools")}</h2>
          </div>
          <button ref={closeButtonRef} type="button" onClick={() => setOpen(false)} className="rounded-full border border-border bg-white p-2 shadow-sm hover:bg-muted" aria-label={text("סגירה", "Close")}><X className="h-5 w-5" /></button>
        </div>

        {showSigns ? (
          <div className="grid grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-3 lg:grid-cols-2">
            {VISUAL_SIGNS.map((sign) => (
              <button key={sign.id} type="button" onClick={() => choose(() => onAddSign(sign))} className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-3xl border border-border/70 bg-white p-3 shadow-sm hover:border-sage hover:bg-sage/10">
                <img src={sign.asset} alt="" className="h-20 w-20 object-contain" />
                <span className="font-bold">{localizedSignLabel(sign, language)}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 overflow-y-auto p-4 sm:grid-cols-4 lg:grid-cols-2">
            {tools.map(({ id, label, icon: Icon, action, active }) => (
              <button key={id} type="button" onClick={() => id === "signs" ? action() : choose(action)} aria-pressed={id === "pen" ? active : undefined} className={cn("flex min-h-28 flex-col items-center justify-center gap-2 rounded-3xl border border-border/70 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-sage hover:bg-sage/10", active && "border-sage bg-sage/20")}>
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef6f1]"><Icon className="h-8 w-8 text-[#3d7560]" /></span>
                <span className="text-sm font-bold leading-tight">{label}</span>
              </button>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
