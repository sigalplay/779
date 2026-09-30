import { useEffect, useId, useRef, useState } from "react";
import { Timer, Play, Pause, RotateCcw, X, Minus, Plus, GripVertical, Maximize2, Minimize2, Bell, BellOff, Music, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslator } from "@/lib/language";
import { playTimerSound, unlockTimerAudio } from "@/lib/timer-sound";

const PRESETS = [1, 3, 5, 10, 15, 20, 30, 45, 60];
const RAINBOW = ["#e88ba5", "#efbc81", "#e0d884", "#a9cfaa", "#91bad1", "#b19acd"];
const TIMER_STORAGE = {
  width: "boo_visual_timer_width_v3",
  position: "boo_visual_timer_position_v2",
  sound: "boo_visual_timer_sound_v1",
};
const SOUND_CHOICES = [
  { id: "chime", Icon: Bell, he: "פעמון", en: "Bell" },
  { id: "melody", Icon: Music, he: "מנגינה", en: "Tune" },
  { id: "bowl", Icon: Waves, he: "רך", en: "Soft" },
  { id: "silent", Icon: BellOff, he: "בלי צליל", en: "Silent" },
];

function readSound() {
  try {
    const saved = localStorage.getItem(TIMER_STORAGE.sound);
    return SOUND_CHOICES.some((choice) => choice.id === saved) ? saved : "chime";
  } catch {
    return "chime";
  }
}
// Smaller by default so the timer does not cover the board (phones smaller still).
const DEFAULT_PANEL_WIDTH = 300;
const PHONE_PANEL_WIDTH = 260;
const isPhone = () => typeof window !== "undefined" && window.innerWidth <= 760;
// Everything in the timer stays visible without scrolling: the dial shrinks on short screens
// to leave room for the controls (about this much height). Phones also keep clear of the
// bottom navigation bar.
const CONTROLS_HEIGHT = 390;
const PHONE_BOTTOM_BAR = 76;
const bottomReserve = () => (window.innerWidth <= 760 ? PHONE_BOTTOM_BAR : 0);

function defaultPanelPosition() {
  if (typeof window === "undefined") return { x: 80, y: 8 };
  return { x: Math.max(8, Math.min(80, window.innerWidth - DEFAULT_PANEL_WIDTH - 8)), y: 8 };
}

function sectorPath(fraction) {
  if (fraction <= 0) return "";
  if (fraction >= 1) return "M 120 120 m 0 -88 a 88 88 0 1 1 0 176 a 88 88 0 1 1 0 -176";
  const angle = fraction * Math.PI * 2;
  const x = 120 + Math.sin(angle) * 88;
  const y = 120 - Math.cos(angle) * 88;
  return `M 120 120 L 120 32 A 88 88 0 ${fraction > 0.5 ? 1 : 0} 1 ${x} ${y} Z`;
}

export function VisualSessionTimer({
  floating = false,
  roundTrigger = false,
  hideTrigger = false,
  language = "he",
  open: controlledOpen,
  onOpenChange,
}) {
  const { t } = useTranslator();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = (nextValue) => {
    const next = typeof nextValue === "function" ? nextValue(open) : nextValue;
    if (!isControlled) setUncontrolledOpen(next);
    onOpenChange?.(next);
  };
  const text = (hebrew, english) => language === "en" ? english : hebrew;
  const [panelWidth, setPanelWidth] = useState(() => Number(localStorage.getItem(TIMER_STORAGE.width)) || (isPhone() ? PHONE_PANEL_WIDTH : DEFAULT_PANEL_WIDTH));
  const [position, setPosition] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(TIMER_STORAGE.position)) || defaultPanelPosition();
    } catch {
      return defaultPanelPosition();
    }
  });
  const [minimized, setMinimized] = useState(false);
  const [minutes, setMinutes] = useState(10);
  const [remaining, setRemaining] = useState(600);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [sound, setSound] = useState(readSound);
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const deadline = useRef(null);
  const panelRef = useRef(null);
  const clipId = `visual-timer-${useId().replace(/:/g, "")}`;

  function resizePanel(next) {
    const width = Math.max(240, Math.min(760, Number(next)));
    setPanelWidth(width);
    localStorage.setItem(TIMER_STORAGE.width, String(width));
  }

  function beginDrag(event) {
    if (event.button !== 0 || event.target.closest("button, input")) return;
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const origin = position;
    const move = (moveEvent) => {
      const maxX = Math.max(8, window.innerWidth - Math.min(panelWidth, window.innerWidth - 16) - 8);
      const maxY = Math.max(8, window.innerHeight - (minimized ? 64 : 120));
      setPosition({
        x: Math.max(8, Math.min(maxX, origin.x + moveEvent.clientX - startX)),
        y: Math.max(8, Math.min(maxY, origin.y + moveEvent.clientY - startY)),
      });
    };
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop, { once: true });
  }

  useEffect(() => {
    localStorage.setItem(TIMER_STORAGE.position, JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    if (!open || minimized || !panelRef.current || !window.ResizeObserver) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      // Keep the whole panel on screen when it opens or changes size.
      const rect = entry.target.getBoundingClientRect();
      setPosition((current) => {
        const x = Math.max(8, Math.min(current.x, window.innerWidth - rect.width - 8));
        const y = Math.max(8, Math.min(current.y, window.innerHeight - bottomReserve() - rect.height - 8));
        return x === current.x && y === current.y ? current : { x, y };
      });
    });
    observer.observe(panelRef.current);
    return () => observer.disconnect();
  }, [open, minimized]);

  useEffect(() => {
    if (!running) return undefined;
    const update = () => {
      const next = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        setRunning(false);
        setFinished(true);
        deadline.current = null;
        if (soundRef.current !== "silent") {
          playTimerSound(soundRef.current);
          navigator.vibrate?.([200, 120, 200]);
        }
      }
    };
    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [running]);

  // Keep a tablet or phone screen awake while the timer runs, where the browser allows it.
  useEffect(() => {
    if (!running || !navigator.wakeLock) return undefined;
    let lock = null;
    let released = false;
    const request = () => navigator.wakeLock.request("screen").then((next) => {
      if (released) next.release();
      else lock = next;
    }).catch(() => {});
    const onVisible = () => { if (document.visibilityState === "visible") request(); };
    request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisible);
      lock?.release().catch(() => {});
    };
  }, [running]);

  function chooseSound(id) {
    setSound(id);
    try { localStorage.setItem(TIMER_STORAGE.sound, id); } catch { /* the choice just isn't remembered */ }
    // Tapping a sound plays it, so it can be heard before the timer ends.
    if (id !== "silent") {
      unlockTimerAudio();
      playTimerSound(id);
    }
  }

  function selectMinutes(next) {
    const value = Math.max(1, Math.min(60, next));
    setMinutes(value);
    setRemaining(value * 60);
    setRunning(false);
    setFinished(false);
    deadline.current = null;
  }

  function toggleRunning() {
    if (running) {
      setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
      deadline.current = null;
      setRunning(false);
      return;
    }
    // Browsers only allow sound after a tap, so the audio is unlocked now for the end of the timer.
    if (sound !== "silent") unlockTimerAudio();
    setFinished(false);
    const seconds = remaining || minutes * 60;
    setRemaining(seconds);
    deadline.current = Date.now() + seconds * 1000;
    setRunning(true);
  }

  const fraction = remaining / (minutes * 60);
  const timeLabel = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;

  return (
    <div className={cn("relative print:hidden", floating && (roundTrigger ? "fixed left-4 top-[calc(50%+8rem)] z-40" : "fixed bottom-5 left-5 z-50"))}>
      {!hideTrigger && <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={text(t("פתיחת טיימר חזותי", "Open visual timer"), "Open visual timer")} title={text(t("טיימר חזותי", "Visual timer"), "Visual timer")} className={cn("flex items-center justify-center border text-sm font-medium shadow-md transition-colors", roundTrigger ? "h-14 w-14 rounded-2xl p-1" : "gap-2 rounded-full px-4 py-2", open || running ? "border-[#a9cfaa] bg-[#edf6ef]" : "border-border bg-white hover:bg-muted")}>
        <span className={cn("flex items-center justify-center rounded-full bg-gradient-to-br from-[#f6d9e2] via-[#e4efdc] to-[#d8eaf3]", roundTrigger ? "h-full w-full" : "h-7 w-7")}><Timer className={roundTrigger ? "h-7 w-7 text-[#52766a]" : "h-5 w-5"} /></span>
        {!roundTrigger && <span>{text(t("טיימר חזותי", "Visual timer"), "Visual timer")}</span>}
        {!roundTrigger && running && <span dir="ltr" className="font-semibold tabular-nums">{timeLabel}</span>}
      </button>}

      {open && (
        <section ref={panelRef} dir={language === "en" ? "ltr" : "rtl"} style={{ left: position.x, top: position.y, width: panelWidth, minWidth: 240, maxWidth: "calc(100vw - 16px)", maxHeight: "calc(100dvh - 16px)", overflow: minimized ? "hidden" : "auto" }} className="fixed z-[100] rounded-[24px] border border-border/70 bg-white p-4 shadow-2xl" aria-label={text(t("טיימר חזותי ללוח המפגש", "Visual timer for the session schedule"), "Visual session timer")}>
          <div onPointerDown={beginDrag} className="flex cursor-move touch-none select-none items-center justify-between rounded-xl bg-muted/50 px-2 py-1">
            <div className="flex items-center gap-2"><GripVertical className="h-5 w-5 text-muted-foreground" /><h2 className="font-display text-lg font-bold">{text(t("כמה זמן נשאר?", "How much time is left?"), "How much time is left?")}</h2></div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setMinimized((value) => !value)} aria-label={minimized ? t("החזרת הטיימר", "Restore timer") : t("מזעור הטיימר", "Minimize timer")} title={minimized ? t("החזרה", "Restore") : t("מזעור", "Minimize")} className="rounded-full p-2 text-muted-foreground hover:bg-white">{minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}</button>
              <button type="button" onClick={() => setOpen(false)} aria-label={text(t("סגירת הטיימר", "Close timer"), "Close timer")} className="rounded-full p-2 text-muted-foreground hover:bg-white"><X className="h-4 w-4" /></button>
            </div>
          </div>

          {!minimized && <>
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-muted/60 p-2"><button type="button" onClick={() => resizePanel(panelWidth - 40)} aria-label={t("הקטנת הטיימר", "Reduce timer")} className="rounded-full border bg-white p-1.5"><Minus className="h-4 w-4" /></button><input type="range" min="240" max="760" step="10" value={panelWidth} onChange={(event) => resizePanel(event.target.value)} aria-label={t("גודל הטיימר", "Timer size")} className="min-w-0 flex-1 accent-[#a9cfaa]" /><button type="button" onClick={() => resizePanel(panelWidth + 40)} aria-label={t("הגדלת הטיימר", "Enlarge timer")} className="rounded-full border bg-white p-1.5"><Plus className="h-4 w-4" /></button></div>

          <div className="mx-auto mt-2" style={{ width: `min(100%, ${Math.round(panelWidth * (isPhone() ? 0.6 : 0.68))}px)`, maxWidth: `max(120px, calc(100dvh - ${CONTROLS_HEIGHT + bottomReserve()}px))` }}>
            <svg viewBox="0 0 240 240" role="img" data-finished={finished || undefined} aria-label={t(`נותרו ${timeLabel}`, `${timeLabel} left`)} className="h-auto w-full">
              <defs><clipPath id={clipId}><path d={sectorPath(fraction)} /></clipPath></defs>
              <circle cx="120" cy="120" r="112" fill="#f5f7f5" stroke="#d9e3df" strokeWidth="2" />
              <circle cx="120" cy="120" r="89" fill="#ffffff" />
              <g clipPath={`url(#${clipId})`}>
                {RAINBOW.map((color, index) => <circle key={color} cx="120" cy="120" r={88 - index * 13} fill={color} />)}
              </g>
              {Array.from({ length: 12 }, (_, index) => {
                const angle = index * Math.PI / 6;
                const x = 120 + Math.sin(angle) * 101;
                const y = 120 - Math.cos(angle) * 101;
                return <text key={index} x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#65726f">{index * 5}</text>;
              })}
              <circle cx="120" cy="120" r="9" fill="#ffffff" stroke="#d9e3df" strokeWidth="2" />
            </svg>
          </div>

          {finished
            ? <div role="status" className="timer-finished text-center text-3xl font-bold text-[#52766a]">{t("הזמן נגמר!", "Time's up!")}</div>
            : <div dir="ltr" className="text-center text-3xl font-bold tabular-nums tracking-wide">{timeLabel}</div>}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button type="button" onClick={() => selectMinutes(minutes - 1)} aria-label={t("הפחתת דקה", "Subtract one minute")} className="rounded-full border p-2 hover:bg-muted"><Minus className="h-4 w-4" /></button>
            <span className="min-w-20 text-center text-sm font-medium">{minutes === 1 ? t("דקה אחת", "1 minute") : `${minutes} ${text(t("דקות", "minutes"), "minutes")}`}</span>
            <button type="button" onClick={() => selectMinutes(minutes + 1)} aria-label={t("הוספת דקה", "Add one minute")} className="rounded-full border p-2 hover:bg-muted"><Plus className="h-4 w-4" /></button>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {PRESETS.map((preset) => <button key={preset} type="button" onClick={() => selectMinutes(preset)} className={cn("rounded-full px-2.5 py-1 text-xs", minutes === preset ? "bg-[#dcece3] font-semibold" : "bg-muted/70 hover:bg-muted")}>{preset}</button>)}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={toggleRunning} className="flex items-center gap-2 rounded-full bg-[#a9cfaa] px-5 py-2 text-sm font-semibold">
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? text(t("השהיה", "Pause"), "Pause") : text(t("הפעלה", "Play"), "Start")}
            </button>
            <button type="button" onClick={() => selectMinutes(minutes)} className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm"><RotateCcw className="h-4 w-4" />{text(t("איפוס", "Reset"), "Reset")}</button>
          </div>
          <div className="mt-4 rounded-2xl bg-muted/50 p-2" role="group" aria-label={t("צליל בסיום הזמן", "Sound when time is up")}>
            <div className="mb-1.5 text-center text-xs font-medium text-muted-foreground">{t("צליל בסיום הזמן", "Sound when time is up")}</div>
            <div className="grid grid-cols-4 gap-1.5">
              {SOUND_CHOICES.map(({ id, Icon, he, en }) => (
                <button key={id} type="button" onClick={() => chooseSound(id)} aria-pressed={sound === id} className={cn("flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] leading-tight", sound === id ? "bg-[#dcece3] font-semibold ring-1 ring-[#a9cfaa]" : "bg-white hover:bg-muted")}>
                  <Icon className="h-4 w-4" aria-hidden="true" />{t(he, en)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 text-center text-[11px] text-muted-foreground">{text(t("אפשר לגרור מהכותרת ולשנות גודל עם הפס", "Drag the title bar to move the timer and use the slider to resize it."), "Drag the title bar to move the timer and use the slider to resize it.")}</div>
          </>}
        </section>
      )}
    </div>
  );
}
