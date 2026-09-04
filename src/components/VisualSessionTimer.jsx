import { useEffect, useId, useRef, useState } from "react";
import { Timer, Play, Pause, RotateCcw, X, Minus, Plus, GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESETS = [5, 10, 15, 20, 30, 45, 60];
const RAINBOW = ["#e88ba5", "#efbc81", "#e0d884", "#a9cfaa", "#91bad1", "#b19acd"];
const TIMER_STORAGE = {
  width: "boo_visual_timer_width_v2",
  height: "boo_visual_timer_height_v2",
  position: "boo_visual_timer_position_v2",
};
const DEFAULT_PANEL_WIDTH = 336;
const DEFAULT_PANEL_HEIGHT = 748;

function defaultPanelHeight() {
  return typeof window === "undefined" ? DEFAULT_PANEL_HEIGHT : Math.min(DEFAULT_PANEL_HEIGHT, window.innerHeight - 16);
}

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

export function VisualSessionTimer({ floating = false, roundTrigger = false }) {
  const [open, setOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(() => Number(localStorage.getItem(TIMER_STORAGE.width)) || DEFAULT_PANEL_WIDTH);
  const [panelHeight, setPanelHeight] = useState(() => Number(localStorage.getItem(TIMER_STORAGE.height)) || defaultPanelHeight());
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
  const deadline = useRef(null);
  const panelRef = useRef(null);
  const clipId = `visual-timer-${useId().replace(/:/g, "")}`;

  function resizePanel(next) {
    const width = Math.max(280, Math.min(760, Number(next)));
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
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      if (width >= 280) {
        setPanelWidth(width);
        localStorage.setItem(TIMER_STORAGE.width, String(width));
      }
      if (height >= 360) {
        setPanelHeight(height);
        localStorage.setItem(TIMER_STORAGE.height, String(height));
      }
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
        deadline.current = null;
      }
    };
    update();
    const interval = window.setInterval(update, 250);
    return () => window.clearInterval(interval);
  }, [running]);

  function selectMinutes(next) {
    const value = Math.max(1, Math.min(60, next));
    setMinutes(value);
    setRemaining(value * 60);
    setRunning(false);
    deadline.current = null;
  }

  function toggleRunning() {
    if (running) {
      setRemaining(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)));
      deadline.current = null;
      setRunning(false);
      return;
    }
    const seconds = remaining || minutes * 60;
    setRemaining(seconds);
    deadline.current = Date.now() + seconds * 1000;
    setRunning(true);
  }

  const fraction = remaining / (minutes * 60);
  const timeLabel = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;

  return (
    <div className={cn("relative print:hidden", floating && (roundTrigger ? "fixed left-4 top-[calc(50%+8rem)] z-40" : "fixed bottom-5 left-5 z-50"))}>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label="פתיחת טיימר חזותי" title="טיימר חזותי" className={cn("flex items-center justify-center border text-sm font-medium shadow-md transition-colors", roundTrigger ? "h-14 w-14 rounded-2xl p-1" : "gap-2 rounded-full px-4 py-2", open || running ? "border-[#a9cfaa] bg-[#edf6ef]" : "border-border bg-white hover:bg-muted")}>
        <span className={cn("flex items-center justify-center rounded-full bg-gradient-to-br from-[#f6d9e2] via-[#e4efdc] to-[#d8eaf3]", roundTrigger ? "h-full w-full" : "h-7 w-7")}><Timer className={roundTrigger ? "h-7 w-7 text-[#52766a]" : "h-5 w-5"} /></span>
        {!roundTrigger && <span>טיימר חזותי</span>}
        {!roundTrigger && running && <span dir="ltr" className="font-semibold tabular-nums">{timeLabel}</span>}
      </button>

      {open && (
        <section ref={panelRef} style={{ left: position.x, top: position.y, width: panelWidth, height: minimized ? "auto" : panelHeight, minWidth: 280, minHeight: minimized ? 0 : 420, maxWidth: "calc(100vw - 16px)", maxHeight: "calc(100vh - 16px)", resize: minimized ? "none" : "both", overflow: minimized ? "hidden" : "auto" }} className="fixed z-[100] rounded-[24px] border border-border/70 bg-white p-4 shadow-2xl" aria-label="טיימר חזותי ללוח המפגש">
          <div onPointerDown={beginDrag} className="flex cursor-move touch-none select-none items-center justify-between rounded-xl bg-muted/50 px-2 py-1">
            <div className="flex items-center gap-2"><GripVertical className="h-5 w-5 text-muted-foreground" /><h2 className="font-display text-lg font-bold">כמה זמן נשאר?</h2></div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setMinimized((value) => !value)} aria-label={minimized ? "החזרת הטיימר" : "מזעור הטיימר"} title={minimized ? "החזרה" : "מזעור"} className="rounded-full p-2 text-muted-foreground hover:bg-white">{minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}</button>
              <button type="button" onClick={() => setOpen(false)} aria-label="סגירת הטיימר" className="rounded-full p-2 text-muted-foreground hover:bg-white"><X className="h-4 w-4" /></button>
            </div>
          </div>

          {!minimized && <>
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-muted/60 p-2"><button type="button" onClick={() => resizePanel(panelWidth - 40)} aria-label="הקטנת הטיימר" className="rounded-full border bg-white p-1.5"><Minus className="h-4 w-4" /></button><input type="range" min="280" max="760" step="10" value={panelWidth} onChange={(event) => resizePanel(event.target.value)} aria-label="גודל הטיימר" className="min-w-0 flex-1 accent-[#a9cfaa]" /><button type="button" onClick={() => resizePanel(panelWidth + 40)} aria-label="הגדלת הטיימר" className="rounded-full border bg-white p-1.5"><Plus className="h-4 w-4" /></button></div>

          <div className="mx-auto mt-2 w-[min(100%,390px)]">
            <svg viewBox="0 0 240 240" role="img" aria-label={`נותרו ${timeLabel}`} className="h-auto w-full">
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

          <div dir="ltr" className="text-center text-3xl font-bold tabular-nums tracking-wide">{timeLabel}</div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button type="button" onClick={() => selectMinutes(minutes - 1)} aria-label="הפחתת דקה" className="rounded-full border p-2 hover:bg-muted"><Minus className="h-4 w-4" /></button>
            <span className="min-w-20 text-center text-sm font-medium">{minutes} דקות</span>
            <button type="button" onClick={() => selectMinutes(minutes + 1)} aria-label="הוספת דקה" className="rounded-full border p-2 hover:bg-muted"><Plus className="h-4 w-4" /></button>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {PRESETS.map((preset) => <button key={preset} type="button" onClick={() => selectMinutes(preset)} className={cn("rounded-full px-2.5 py-1 text-xs", minutes === preset ? "bg-[#dcece3] font-semibold" : "bg-muted/70 hover:bg-muted")}>{preset}</button>)}
          </div>
          <div className="mt-4 flex justify-center gap-2">
            <button type="button" onClick={toggleRunning} className="flex items-center gap-2 rounded-full bg-[#a9cfaa] px-5 py-2 text-sm font-semibold">
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "השהיה" : "הפעלה"}
            </button>
            <button type="button" onClick={() => selectMinutes(minutes)} className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm"><RotateCcw className="h-4 w-4" />איפוס</button>
          </div>
          <div className="mt-3 text-center text-[11px] text-muted-foreground">אפשר לגרור מהכותרת ולשנות גודל מהפינה</div>
          </>}
        </section>
      )}
    </div>
  );
}
