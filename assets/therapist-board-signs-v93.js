(() => {
  "use strict";

  const DRAFT_KEY = "pp_draft_plan";
  const signs = [
    { id: "enough", label: "מספיק", asset: "/icon-bank/ui/visual-signs-v95/enough.png" },
    { id: "more", label: "עוד", asset: "/icon-bank/ui/visual-signs-v95/more.png" },
    { id: "stop", label: "עצור", asset: "/icon-bank/ui/visual-signs-v95/stop.png" },
    { id: "my-turn", label: "תורי", asset: "/icon-bank/ui/visual-signs-v95/my-turn.png" },
    { id: "your-turn", label: "תורך", asset: "/icon-bank/ui/visual-signs-v95/your-turn.png" }
  ];

  function isBoard() {
    const params = new URLSearchParams(location.search);
    return location.pathname.replace(/\/$/, "") === "/therapist/build" && params.get("view") === "session";
  }

  function cardMarkup(sign) {
    return `<span class="visual-sign-card"><span class="visual-sign-art"><img src="${sign.asset}" alt=""></span><strong>${sign.label}</strong></span>`;
  }

  function roundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.arcTo(x + width, y, x + width, y + height, radius);
    context.arcTo(x + width, y + height, x, y + height, radius);
    context.arcTo(x, y + height, x, y, radius);
    context.arcTo(x, y, x + width, y, radius);
    context.closePath();
  }

  function renderCard(sign) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = async () => {
        try { if (document.fonts?.load) await document.fonts.load('800 64px Rubik'); } catch {}
        const canvas = document.createElement("canvas");
        canvas.width = 600;
        canvas.height = 600;
        const context = canvas.getContext("2d");
        context.fillStyle = "#fff";
        roundRect(context, 12, 12, 576, 576, 52);
        context.fill();
        context.lineWidth = 12;
        context.strokeStyle = "#111";
        context.stroke();
        context.drawImage(image, 82, 42, 436, 436);
        context.direction = "rtl";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#111";
        context.font = '800 64px Rubik, Arial, sans-serif';
        context.fillText(sign.label, 300, 530);
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = reject;
      image.src = sign.asset;
    });
  }

  async function addSign(sign) {
    let items = [];
    try { items = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]"); } catch {}
    if (!Array.isArray(items)) items = [];
    let image;
    try { image = await renderCard(sign); } catch { return; }
    items.push({ kind: "photo", uid: `sign-${sign.id}-${Date.now()}`, image, label: sign.label, visualSign: sign.id });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("boo_draft_plan_changed", { detail: { items, source: "meeting-board-sign" } }));
    document.querySelector("[data-signs-palette]")?.remove();
    window.setTimeout(() => location.reload(), 180);
  }

  function openPalette(button) {
    const existing = document.querySelector("[data-signs-palette]");
    if (existing) { existing.remove(); button.setAttribute("aria-expanded", "false"); return; }
    const palette = document.createElement("div");
    palette.className = "meeting-signs-palette";
    palette.dataset.signsPalette = "true";
    palette.setAttribute("role", "dialog");
    palette.setAttribute("aria-label", "בחירת סימן מוסכם");
    palette.innerHTML = `<strong>בחירת סימן ללוח</strong><div>${signs.map((sign) => `<button type="button" data-add-visual-sign="${sign.id}" aria-label="הוספת ${sign.label} ללוח">${cardMarkup(sign)}</button>`).join("")}</div><button type="button" class="meeting-signs-close" data-close-signs>סגירה</button>`;
    button.closest("[data-signs-tools]").append(palette);
    button.setAttribute("aria-expanded", "true");
  }

  function install() {
    if (!isBoard()) return;
    const actions = document.querySelector("[data-meeting-board-actions]");
    if (!actions || actions.querySelector("[data-signs-tools]")) return;
    const wrap = document.createElement("div");
    wrap.className = "meeting-signs-tools";
    wrap.dataset.signsTools = "true";
    wrap.innerHTML = `<button type="button" class="meeting-signs-button" data-board-signs aria-expanded="false" title="הוספת סימנים מוסכמים ללוח"><span class="meeting-action-icon" aria-hidden="true">✋</span><span class="meeting-action-label-desktop">סימנים מוסכמים</span><span class="meeting-action-label-mobile">סימנים</span></button>`;
    const timer = actions.querySelector(".meeting-timer");
    actions.insertBefore(wrap, timer || actions.querySelector(".meeting-photo"));
  }

  function decorateBoardSigns() {
    const labels = new Set(signs.map((sign) => sign.label));
    document.querySelectorAll('.meeting-board-surface img[src^="data:image/png"]').forEach((image) => {
      const item = image.closest("li");
      const title = item?.querySelector("h3");
      const label = title?.textContent?.trim();
      if (!label || !labels.has(label)) return;
      item.classList.add("visual-sign-board-item");
      image.alt = label;
    });
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest?.("[data-board-signs]");
    if (trigger) { event.preventDefault(); event.stopPropagation(); openPalette(trigger); return; }
    if (event.target.closest?.("[data-close-signs]")) {
      document.querySelector("[data-signs-palette]")?.remove();
      document.querySelector("[data-board-signs]")?.setAttribute("aria-expanded", "false");
      return;
    }
    const choice = event.target.closest?.("[data-add-visual-sign]");
    if (choice) {
      const sign = signs.find((item) => item.id === choice.dataset.addVisualSign);
      if (sign) addSign(sign);
    }
  }, true);

  let queued = false;
  const refresh = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; install(); decorateBoardSigns(); });
  };
  new MutationObserver(refresh).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh, { once: true });
  else refresh();
})();
