import { useState } from "react";
import { VISUAL_SIGNS, localizedLabel } from "@/lib/session-board-tools";

const PEN_COLORS = ["#5a67a8", "#d9534f", "#2f8f5b", "#f0a500", "#222222"];

// In full screen only the board is shown, so the tool row is hidden. This floating button opens
// a bank of tools inside the board itself. To add a tool, add an entry to the `tools` list.
export function BoardFullscreenTools({ language, pen, onOpenTimer, onAddSign }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [view, setView] = useState(null); // "bank" | "signs" | null

  const tools = [
    { id: "timer", icon: "⏱", label: t("טיימר", "Timer"), onSelect: () => { setView(null); onOpenTimer(); } },
    { id: "pen", icon: "✎", label: t("עט", "Pen"), onSelect: () => { setView(null); pen.setTool("pen"); pen.setEnabled(true); } },
    { id: "signs", icon: "✋", label: t("סימנים מוסכמים", "Visual signs"), onSelect: () => { pen.setEnabled(false); setView("signs"); } },
  ];

  return (
    <>
      <button
        type="button"
        className="board-fs-tools-toggle"
        aria-expanded={Boolean(view)}
        aria-label={t("בנק כלים ללוח", "Board tools")}
        title={t("בנק כלים ללוח", "Board tools")}
        onClick={() => setView((current) => (current ? null : "bank"))}
      >
        <span aria-hidden="true">{view ? "×" : "＋"}</span>
        <small>{t("כלים", "Tools")}</small>
      </button>

      {view === "bank" && (
        <div className="board-fs-tools-panel" role="dialog" aria-label={t("בנק כלים ללוח", "Board tools")}>
          <strong>{t("בנק כלים ללוח", "Board tools")}</strong>
          <div className="board-fs-tools-grid">
            {tools.map((tool) => (
              <button key={tool.id} type="button" data-board-fs-tool={tool.id} onClick={tool.onSelect}>
                <span aria-hidden="true">{tool.icon}</span>
                <small>{tool.label}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {view === "signs" && (
        <div className="board-fs-tools-panel" role="dialog" aria-label={t("בחירת סימן מוסכם", "Choose a visual sign")}>
          <strong>{t("בחירת סימן ללוח", "Choose a sign for the board")}</strong>
          <div className="board-fs-tools-grid">
            {VISUAL_SIGNS.map((sign) => (
              <button key={sign.id} type="button" aria-label={t(`הוספת ${sign.label} ללוח`, `Add ${sign.labelEn} to the board`)} onClick={() => { setView(null); onAddSign(sign); }}>
                <img src={sign.asset} alt="" />
                <small>{localizedLabel(sign, language)}</small>
              </button>
            ))}
          </div>
          <button type="button" className="board-fs-tools-back" onClick={() => setView("bank")}>{t("חזרה לכלים", "Back to tools")}</button>
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
    </>
  );
}
