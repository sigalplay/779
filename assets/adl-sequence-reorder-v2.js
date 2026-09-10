(() => {
  "use strict";

  let orientation = "horizontal";
  let order = [];
  let scheduled = false;
  let applying = false;

  const clean = (value) => (value || "").replace(/\s+/g, " ").trim();
  const keyFor = (card) => {
    const image = card.querySelector("img");
    const caption = [...card.querySelectorAll("span,p,strong")]
      .map((node) => clean(node.textContent))
      .find((text) => text && !/^\d+$/.test(text) && text !== "×") || "";
    return `${image?.currentSrc || image?.src || "image"}|${caption}`;
  };

  function removeButtonFor(card) {
    return [...card.querySelectorAll("button")].find((button) => {
      const label = clean(button.getAttribute("aria-label") || button.title || button.textContent);
      return label === "×" || /הוצא|הסר|remove/i.test(label);
    });
  }

  function cardFor(removeButton) {
    let node = removeButton.parentElement;
    while (node && node !== document.body) {
      if (node.querySelectorAll("img").length === 1 && node.querySelectorAll("button").length >= 1) return node;
      node = node.parentElement;
    }
    return null;
  }

  function findCards() {
    const controls = [...document.querySelectorAll("button")].filter((button) => {
      const label = clean(button.getAttribute("aria-label") || button.title || button.textContent);
      return label === "×" || /הוצא.*רצף|remove.*sequence/i.test(label);
    });
    return [...new Set(controls.map(cardFor).filter(Boolean))].filter((card) => card.querySelector("img"));
  }

  function move(key, delta) {
    const index = order.indexOf(key);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    schedule();
  }

  function makeButton(card, key, delta) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "adl-sequence-move-button";
    button.dataset.delta = String(delta);
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      move(key, delta);
    });
    card.querySelector(".adl-sequence-move-controls")?.appendChild(button);
    return button;
  }

  function updateButton(button, previous, index, total) {
    const horizontal = orientation === "horizontal";
    const rtl = document.documentElement.dir !== "ltr";
    const english = document.documentElement.lang === "en";
    let glyph;
    let label;
    if (horizontal) {
      const pointsRight = previous === rtl;
      glyph = pointsRight ? "→" : "←";
      label = english ? `Move ${pointsRight ? "right" : "left"}` : `הזז ${pointsRight ? "ימינה" : "שמאלה"}`;
    } else {
      glyph = previous ? "↑" : "↓";
      label = english ? `Move ${previous ? "up" : "down"}` : `הזז ${previous ? "למעלה" : "למטה"}`;
    }
    if (button.textContent !== glyph) button.textContent = glyph;
    button.setAttribute("aria-label", label);
    button.title = label;
    button.disabled = previous ? index === 0 : index === total - 1;
  }

  function apply() {
    scheduled = false;
    if (applying) return;
    const cards = findCards();
    if (!cards.length) return;
    applying = true;

    const current = cards.map((card) => ({ card, key: keyFor(card) }));
    const keys = current.map((item) => item.key);
    order = order.filter((key) => keys.includes(key));
    keys.forEach((key) => { if (!order.includes(key)) order.push(key); });

    const byKey = new Map(current.map((item) => [item.key, item.card]));
    const currentOrder = current.map((item) => item.key);
    if (currentOrder.some((key, index) => key !== order[index])) {
      order.forEach((key) => {
        const card = byKey.get(key);
        if (card?.parentElement) card.parentElement.appendChild(card);
      });
    }

    order.forEach((key, index) => {
      const card = byKey.get(key);
      if (!card) return;
      card.classList.add("adl-sequence-card");
      let controls = card.querySelector(":scope > .adl-sequence-move-controls");
      if (!controls) {
        controls = document.createElement("div");
        controls.className = "adl-sequence-move-controls";
        controls.setAttribute("aria-label", document.documentElement.lang === "en" ? "Change step position" : "שינוי מיקום השלב");
        card.appendChild(controls);
        makeButton(card, key, -1);
        makeButton(card, key, 1);
      }
      const buttons = controls.querySelectorAll("button");
      updateButton(buttons[0], true, index, order.length);
      updateButton(buttons[1], false, index, order.length);

      const number = [...card.querySelectorAll("span")].find((node) => /^\d+$/.test(clean(node.textContent)));
      if (number && number.textContent !== String(index + 1)) number.textContent = String(index + 1);
    });
    applying = false;
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("button");
    if (!button) return;
    const text = clean(button.textContent);
    if (/בשורה|Horizontal/i.test(text)) orientation = "horizontal";
    if (/בטור|Vertical/i.test(text)) orientation = "vertical";
    schedule();
  }, true);

  function start() {
    apply();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
