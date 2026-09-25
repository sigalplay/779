import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, Hand, Pencil, Timer, X } from "lucide-react";
import { TherapistPostureScissorsTips } from "@/components/TherapistPostureScissorsTips";
import { VISUAL_SIGNS, localizedLabel } from "@/lib/session-board-tools";

const PEN_COLORS = ["#5a67a8", "#d9534f", "#2f8f5b", "#f0a500", "#222222"];
const POSITION_KEY = "boo_board_tools_position";
const BUTTON_SIZE = 64;
const EDGE = 12;
const DRAG_THRESHOLD = 6;

function clampPosition({ x, y }) {
  return {
    x: Math.min(Math.max(EDGE, x), window.innerWidth - BUTTON_SIZE - EDGE),
    y: Math.min(Math.max(EDGE, y), window.innerHeight - BUTTON_SIZE - EDGE),
  };
}

function savedPosition() {
  try {
    const saved = JSON.parse(localStorage.getItem(POSITION_KEY));
    if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y)) return clampPosition(saved);
  } catch { /* storage blocked or bad value */ }
  return clampPosition({ x: EDGE + 2, y: window.innerHeight - BUTTON_SIZE - EDGE - 2 });
}

function ToolboxIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="8" y="24" width="48" height="30" rx="7" fill="#f6b8a8" />
      <rect x="8" y="24" width="48" height="10" rx="5" fill="#ee9d8a" />
      <path d="M24 24v-6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6" fill="none" stroke="#40362f" strokeWidth="4" strokeLinecap="round" />
      <rect x="28" y="30" width="8" height="8" rx="2" fill="#fff" />
    </svg>
  );
}

// In full screen only the board is shown, so the tool row is hidden. A toolbox button that can be
// dragged anywhere opens a row of round tools above it. To add a tool, add an entry to `tools`.
export function BoardFullscreenTools({ language, pen, onOpenTimer, onAddSign }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [view, setView] = useState(null); // "bank" | "signs" | null
  const [tipPanel, setTipPanel] = useState(null);
  const [position, setPosition] = useState(savedPosition);
  const [panelStyle, setPanelStyle] = useState(null);
  const drag = useRef(null);
  const panelRef = useRef(null);

  const tools = [
    { id: "timer", color: "#bcdcf2", icon: <Timer />, label: t("טיימר", "Timer"), onSelect: () => { setView(null); onOpenTimer(); } },
    { id: "pen", color: "#f6c3b5", icon: <Pencil />, label: t("עט", "Pen"), onSelect: () => { setView(null); pen.setTool("pen"); pen.setEnabled(true); } },
    { id: "signs", color: "#f8df9a", icon: <Hand />, label: t("סימנים מוסכמים", "Visual signs"), onSelect: () => { pen.setEnabled(false); setView("signs"); } },
    { id: "posture", color: "#bfe6d1", image: "/icon-bank/ui/posture-chair.webp", label: t("ישיבה", "Sitting"), onSelect: () => openTip("posture") },
    { id: "scissors", color: "#e6dcf5", image: "/icon-bank/ui/cutting-scissors.webp", label: t("גזירה", "Cutting"), onSelect: () => openTip("scissors") },
    { id: "writing", color: "#f9d0de", image: "/icon-bank/guidance/writing/notebook-pencil.png", label: t("כתיבה", "Writing"), onSelect: () => openTip("writing") },
    { id: "coloring", color: "#d8ecc6", image: "/icon-bank/guidance/coloring/1-relaxed-grip.webp", label: t("צביעה", "Coloring"), onSelect: () => openTip("coloring") },
  ];

  function openTip(panel) {
    setView(null);
    pen.setEnabled(false);
    setTipPanel(panel);
  }

  // Keep the button on screen when the window size changes.
  useEffect(() => {
    const onResize = () => setPosition((current) => clampPosition(current));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // The window opens above the button (below it when there is no room), and stays inside the screen.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!view || !panel) { setPanelStyle(null); return; }
    const { width, height } = panel.getBoundingClientRect();
    const centerX = position.x + BUTTON_SIZE / 2;
    const left = Math.min(Math.max(EDGE, centerX - width / 2), window.innerWidth - width - EDGE);
    const above = position.y - height - 12;
    const top = above >= EDGE ? above : Math.min(position.y + BUTTON_SIZE + 12, window.innerHeight - height - EDGE);
    setPanelStyle({ left, top: Math.max(EDGE, top) });
  }, [view, position]);

  function pointerDown(event) {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    drag.current = { startX: event.clientX, startY: event.clientY, origin: position, moved: false };
  }
  function pointerMove(event) {
    const current = drag.current;
    if (!current) return;
    const dx = event.clientX - current.startX;
    const dy = event.clientY - current.startY;
    if (!current.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    current.moved = true;
    setPosition(clampPosition({ x: current.origin.x + dx, y: current.origin.y + dy }));
  }
  function pointerUp() {
    const current = drag.current;
    drag.current = null;
    if (!current) return;
    if (current.moved) {
      try { localStorage.setItem(POSITION_KEY, JSON.stringify(position)); } catch { /* storage blocked */ }
      return;
    }
    setView((open) => (open ? null : "bank"));
  }

  return (
    <>
      {!tipPanel && <button
        type="button"
        className={view ? "board-fs-tools-toggle open" : "board-fs-tools-toggle"}
        style={{ left: position.x, top: position.y }}
        aria-expanded={Boolean(view)}
        aria-label={t("כלים ללוח (אפשר לגרור)", "Board tools (drag to move)")}
        title={t("כלים ללוח — אפשר לגרור לכל מקום", "Board tools — drag to move")}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={() => { drag.current = null; }}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setView((open) => (open ? null : "bank")); } }}
      >
        {view ? <X aria-hidden="true" /> : <ToolboxIcon />}
      </button>}

      {view && (
        <div
          ref={panelRef}
          className="board-fs-tools-panel"
          style={panelStyle || { left: -9999, top: -9999 }}
          role="dialog"
          aria-label={view === "signs" ? t("בחירת סימן מוסכם", "Choose a visual sign") : t("כלים ללוח", "Board tools")}
        >
          {view === "bank" && (
            <div className="board-fs-tools-row">
              {tools.map((tool) => (
                <button key={tool.id} type="button" className="board-fs-tool" data-board-fs-tool={tool.id} onClick={tool.onSelect}>
                  <span className="board-fs-tool-circle" style={{ background: tool.color }}>
                    {tool.image ? <img src={tool.image} alt="" /> : tool.icon}
                  </span>
                  <small>{tool.label}</small>
                </button>
              ))}
            </div>
          )}
          {view === "signs" && (
            <div className="board-fs-tools-row">
              <button type="button" className="board-fs-tool" onClick={() => setView("bank")}>
                <span className="board-fs-tool-circle board-fs-tool-back"><ArrowRight className="rtl:rotate-0 ltr:rotate-180" /></span>
                <small>{t("חזרה", "Back")}</small>
              </button>
              {VISUAL_SIGNS.map((sign) => (
                <button key={sign.id} type="button" className="board-fs-tool" aria-label={t(`הוספת ${sign.label} ללוח`, `Add ${sign.labelEn} to the board`)} onClick={() => { setView(null); onAddSign(sign); }}>
                  <span className="board-fs-tool-circle board-fs-tool-sign"><img src={sign.asset} alt="" /></span>
                  <small>{localizedLabel(sign, language)}</small>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {pen.enabled && (
        <div className="board-fs-pen-bar" role="toolbar" aria-label={t("כלי כתיבה", "Pen tools")}>
          {PEN_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={pen.tool === "pen" && pen.color === color ? "board-fs-pen-color active" : "board-fs-pen-color"}
              style={{ background: color }}
              aria-label={t("צבע עט", "Pen color")}
              aria-pressed={pen.tool === "pen" && pen.color === color}
              onClick={() => { pen.setColor(color); pen.setTool("pen"); }}
            />
          ))}
          <button type="button" className={pen.tool === "eraser" ? "active" : undefined} aria-pressed={pen.tool === "eraser"} onClick={() => pen.setTool("eraser")}>{t("מחק", "Eraser")}</button>
          <button type="button" onClick={pen.onClear}>{t("מחיקת הכתיבה", "Clear drawing")}</button>
          <button type="button" className="board-fs-pen-done" onClick={() => pen.setEnabled(false)}>{t("סיום", "Done")}</button>
        </div>
      )}

      <TherapistPostureScissorsTips hideTriggers language={language} openPanel={tipPanel} onOpenPanelChange={setTipPanel} />
    </>
  );
}
