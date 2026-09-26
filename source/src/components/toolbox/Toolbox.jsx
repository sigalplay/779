import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { POSTURE_POINTS } from "@/lib/pencil-grip-posture";
import { SCISSOR_TIP_CARDS } from "@/lib/scissors-tips";
import { COLORING_TIP_CARDS } from "@/lib/coloring-tips";

const BUTTON_SIZE = 64;
const EDGE = 12;
const DRAG_THRESHOLD = 6;
const HINT_KEY = "boo_toolbox_scroll_hint";
const TOOL_WIDTH = 68;
const LARGE_TOOL_WIDTH = 118;
const GRID_GAP = 10;
const GRID_PADDING = 16;

function clampPosition({ x, y }) {
  return {
    x: Math.min(Math.max(EDGE, x), window.innerWidth - BUTTON_SIZE - EDGE),
    y: Math.min(Math.max(EDGE, y), window.innerHeight - BUTTON_SIZE - EDGE),
  };
}

function savedPosition(storageKey, placement) {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y)) return clampPosition(saved);
  } catch { /* storage blocked or bad value */ }
  const y = placement === "bottom" ? window.innerHeight - BUTTON_SIZE - EDGE - 2 : window.innerHeight / 2 - BUTTON_SIZE / 2;
  return clampPosition({ x: EDGE + 4, y });
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

function ToolCircle({ tool, index, className = "", onClick }) {
  const content = (
    <>
      <span className={`toolbox-tool-circle ${className}`} style={tool.color ? { background: tool.color } : undefined}>
        {tool.image ? <img src={tool.image} alt="" /> : tool.icon}
      </span>
      <small>{tool.label}</small>
    </>
  );
  // A tip only shows a picture and its words; there is nothing to press.
  if (tool.display) return <div className="toolbox-tool toolbox-tool-display" style={{ "--i": index }} data-toolbox-tool={tool.id}>{content}</div>;
  return (
    <button type="button" className="toolbox-tool" style={{ "--i": index }} data-toolbox-tool={tool.id} aria-label={tool.ariaLabel} onClick={onClick}>
      {content}
    </button>
  );
}

// A toolbox button that can be dragged anywhere on the screen. A click opens a row of round tools
// that float beside it. Each tool is { id, label, color, icon | image, onSelect } or, to open a second row,
// { id, label, color, icon, items: [{ id, label, image, ariaLabel, onSelect }] }.
export function Toolbox({ language, tools, storageKey, placement = "middle", hidden = false }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [view, setView] = useState(null); // "bank" | id of a tool with items | null
  const [position, setPosition] = useState(() => savedPosition(storageKey, placement));
  const [panelStyle, setPanelStyle] = useState(null);
  const drag = useRef(null);
  const panelRef = useRef(null);
  const subTool = view && view !== "bank" ? tools.find((tool) => tool.id === view) : null;

  useEffect(() => {
    const onResize = () => setPosition((current) => clampPosition(current));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!view) return undefined;
    const onKey = (event) => { if (event.key === "Escape") setView(null); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [view]);

  // The row floats beside the button, towards the side with more room, level with the button.
  const opensRight = position.x + BUTTON_SIZE / 2 < window.innerWidth / 2;
  const room = opensRight ? window.innerWidth - position.x - BUTTON_SIZE - 4 - EDGE : position.x - 4 - EDGE;
  // A second row (such as the signs) is shown whole, in two lines, so a child can point at any of
  // them. Where two lines are not wide enough, it takes as many lines as it needs.
  const gridCount = subTool ? subTool.items.length + 1 : 0;
  const toolWidth = subTool?.large ? LARGE_TOOL_WIDTH : TOOL_WIDTH;
  const gridColumns = subTool ? Math.max(1, Math.min(Math.ceil(gridCount / 2), Math.floor((room - (subTool?.large ? 24 : GRID_PADDING) + GRID_GAP) / (toolWidth + GRID_GAP)))) : 0;
  useLayoutEffect(() => {
    const strip = panelRef.current;
    if (!view || !strip) { setPanelStyle(null); return; }
    const height = strip.getBoundingClientRect().height;
    const top = Math.min(Math.max(EDGE, position.y + BUTTON_SIZE / 2 - height / 2), window.innerHeight - height - EDGE);
    setPanelStyle(opensRight
      ? { top, left: position.x + BUTTON_SIZE + 4, maxWidth: room }
      : { top, right: window.innerWidth - position.x + 4, maxWidth: room });
  }, [view, position, opensRight, room]);

  // When not every tool fits, the row is cut off with a fade and can be scrolled. The first time,
  // it nudges sideways to show that.
  const [overflowing, setOverflowing] = useState(false);
  useEffect(() => {
    const strip = panelRef.current;
    if (!view || !strip || !panelStyle) return undefined;
    const more = strip.scrollWidth > strip.clientWidth + 2;
    setOverflowing(more);
    if (!more) return undefined;
    try { if (localStorage.getItem(HINT_KEY)) return undefined; localStorage.setItem(HINT_KEY, "1"); } catch { return undefined; }
    const step = opensRight ? 70 : -70;
    const out = window.setTimeout(() => strip.scrollBy({ left: step, behavior: "smooth" }), 450);
    const back = window.setTimeout(() => strip.scrollBy({ left: -step, behavior: "smooth" }), 1050);
    return () => { window.clearTimeout(out); window.clearTimeout(back); };
  }, [view, panelStyle, opensRight]);

  if (hidden) return null;

  function toggle() {
    setView((open) => (open ? null : "bank"));
  }
  function select(tool) {
    if (tool.items) { setView(tool.id); return; }
    setView(null);
    tool.onSelect();
  }

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
    if (!current.moved) { toggle(); return; }
    try { localStorage.setItem(storageKey, JSON.stringify(position)); } catch { /* storage blocked */ }
  }

  return (
    <>
      <button
        type="button"
        className={view ? "toolbox-toggle open" : "toolbox-toggle"}
        style={{ left: position.x, top: position.y }}
        aria-expanded={Boolean(view)}
        aria-label={t("ארגז כלים (אפשר לגרור)", "Toolbox (drag to move)")}
        title={t("ארגז כלים — אפשר לגרור לכל מקום", "Toolbox — drag to move")}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={pointerUp}
        onPointerCancel={() => { drag.current = null; }}
        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle(); } }}
      >
        {view ? <X aria-hidden="true" /> : <ToolboxIcon />}
      </button>

      {view && (
        <div
          ref={panelRef}
          key={view}
          className={["toolbox-strip", opensRight ? "opens-right" : "opens-left", subTool ? "toolbox-grid" : overflowing && "overflowing", subTool?.large && "toolbox-grid-large"].filter(Boolean).join(" ")}
          style={{ ...(panelStyle || { left: -9999, top: -9999 }), ...(subTool ? { gridTemplateColumns: `repeat(${gridColumns}, ${toolWidth}px)`, direction: language === "en" ? "ltr" : "rtl" } : null) }}
          role="dialog"
          aria-label={subTool ? subTool.label : t("ארגז כלים", "Toolbox")}
        >
          {(subTool
            ? [{ id: "back", label: t("חזרה", "Back"), icon: <ArrowRight className={language === "en" ? "rotate-180" : undefined} />, back: true }, ...subTool.items]
            : tools
          ).map((tool, index) => (
            <ToolCircle
              key={tool.id}
              tool={tool}
              index={index}
              className={tool.back ? "toolbox-tool-back" : subTool ? "toolbox-tool-item" : ""}
              onClick={() => (tool.back ? setView("bank") : subTool ? (setView(null), tool.onSelect()) : select(tool))}
            />
          ))}
        </div>
      )}
    </>
  );
}

// The four guidance tools. Sitting, cutting and coloring open their tips as large circles, like the
// signs; writing opens its tip window.
export function tipTools(language, onOpenTip, { showScissors = true } = {}) {
  const t = (he, en) => (language === "en" ? en : he);
  const tips = (id, cards) => cards.map((card, index) => ({
    id: `${id}-${index}`,
    image: card.image,
    label: language === "en" ? card.titleEn || card.textEn : card.title || card.text,
    display: true,
  }));
  return [
    { id: "posture", color: "#bfe6d1", image: "/icon-bank/ui/posture-chair.webp", label: t("ישיבה", "Sitting"), large: true, items: tips("posture", POSTURE_POINTS) },
    showScissors && { id: "scissors", color: "#e6dcf5", image: "/icon-bank/ui/cutting-scissors.webp", label: t("גזירה", "Cutting"), large: true, items: tips("scissors", SCISSOR_TIP_CARDS) },
    { id: "writing", color: "#f9d0de", image: "/icon-bank/guidance/writing/notebook-pencil.png", label: t("כתיבה", "Writing"), onSelect: () => onOpenTip("writing") },
    { id: "coloring", color: "#d8ecc6", image: "/icon-bank/guidance/coloring/1-relaxed-grip.webp", label: t("צביעה", "Coloring"), large: true, items: tips("coloring", COLORING_TIP_CARDS) },
  ].filter(Boolean);
}
