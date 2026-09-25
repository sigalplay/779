const PEN_COLORS = ["#5a67a8", "#d9534f", "#2f8f5b", "#f0a500", "#222222"];

// Colors, eraser and "done" while the pen is on. `pen` is { tool, setTool, color, setColor, onClear, setEnabled }.
export function PenBar({ language, pen }) {
  const t = (he, en) => (language === "en" ? en : he);
  return (
    <div className="toolbox-pen-bar" role="toolbar" aria-label={t("כלי כתיבה", "Pen tools")}>
      {PEN_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={pen.tool === "pen" && pen.color === color ? "toolbox-pen-color active" : "toolbox-pen-color"}
          style={{ background: color }}
          aria-label={t("צבע עט", "Pen color")}
          aria-pressed={pen.tool === "pen" && pen.color === color}
          onClick={() => { pen.setColor(color); pen.setTool("pen"); }}
        />
      ))}
      <button type="button" className={pen.tool === "eraser" ? "active" : undefined} aria-pressed={pen.tool === "eraser"} onClick={() => pen.setTool("eraser")}>{t("מחק", "Eraser")}</button>
      <button type="button" onClick={pen.onClear}>{t("מחיקת הכתיבה", "Clear drawing")}</button>
      <button type="button" className="toolbox-pen-done" onClick={() => pen.setEnabled(false)}>{t("סיום", "Done")}</button>
    </div>
  );
}
