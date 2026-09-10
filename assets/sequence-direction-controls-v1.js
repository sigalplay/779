(() => {
  "use strict";

  let layout = "vertical";
  let scheduled = false;

  const textOf = (element) => (element?.textContent || "").replace(/\s+/g, " ").trim();
  const isHorizontalChoice = (text) => /בשורה|Horizontal/i.test(text);
  const isVerticalChoice = (text) => /בטור|Vertical/i.test(text);

  function hasSequenceLayoutControls() {
    const buttons = [...document.querySelectorAll("button")];
    return buttons.some((button) => isHorizontalChoice(textOf(button))) &&
      buttons.some((button) => isVerticalChoice(textOf(button)));
  }

  function directionFor(button, previous) {
    const english = document.documentElement.lang === "en";
    if (layout === "vertical") {
      return previous
        ? { label: english ? "Move up" : "הזז למעלה", glyph: "↑" }
        : { label: english ? "Move down" : "הזז למטה", glyph: "↓" };
    }

    const rtl = getComputedStyle(button).direction === "rtl" || document.documentElement.dir === "rtl";
    const moveRight = previous === rtl;
    return moveRight
      ? { label: english ? "Move right" : "הזז ימינה", glyph: "→" }
      : { label: english ? "Move left" : "הזז שמאלה", glyph: "←" };
  }

  function update() {
    scheduled = false;
    if (!hasSequenceLayoutControls()) return;

    document.querySelectorAll("button[aria-label]").forEach((button) => {
      const original = button.dataset.sequenceOriginalLabel || button.getAttribute("aria-label") || "";
      const previous = /למעלה|אחורה|Move up|Move backward/i.test(original);
      const next = /למטה|קדימה|Move down|Move forward/i.test(original);
      if (!previous && !next) return;

      if (!button.dataset.sequenceOriginalLabel) button.dataset.sequenceOriginalLabel = original;
      const direction = directionFor(button, previous);
      button.setAttribute("aria-label", direction.label);
      button.setAttribute("title", direction.label);
      button.dataset.sequenceDirectionGlyph = direction.glyph;
      button.classList.add("sequence-direction-button");
    });
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("button");
    if (!button) return;
    const text = textOf(button);
    if (isHorizontalChoice(text)) layout = "horizontal";
    else if (isVerticalChoice(text)) layout = "vertical";
    else return;
    scheduleUpdate();
  }, true);

  function start() {
    const selected = [...document.querySelectorAll("button[aria-pressed='true'], button[data-state='active']")]
      .find((button) => isHorizontalChoice(textOf(button)) || isVerticalChoice(textOf(button)));
    if (selected && isHorizontalChoice(textOf(selected))) layout = "horizontal";
    update();
    new MutationObserver(scheduleUpdate).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
