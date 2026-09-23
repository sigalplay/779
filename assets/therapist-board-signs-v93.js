(() => {
  "use strict";

  const DRAFT_KEY = "pp_draft_plan";
  const signs = [
    { id: "enough", label: "מספיק", labelEn: "Enough", asset: "/icon-bank/ui/visual-signs-v95/enough.png" },
    { id: "more", label: "עוד", labelEn: "More", asset: "/icon-bank/ui/visual-signs-v95/more.png" },
    { id: "stop", label: "עצור", labelEn: "Stop", asset: "/icon-bank/ui/visual-signs-v95/stop.png" },
    { id: "my-turn", label: "תורי", labelEn: "My turn", asset: "/icon-bank/ui/visual-signs-v95/my-turn.png" },
    { id: "your-turn", label: "תורך", labelEn: "Your turn", asset: "/icon-bank/ui/visual-signs-v95/your-turn.png" }
  ];
  const cardCache = new Map();

  function isEnglish() {
    try { return sessionStorage.getItem("boo_english_preview") === "1" && localStorage.getItem("boo_nesahek_language") === "en"; }
    catch { return document.documentElement.lang === "en"; }
  }

  const text = (hebrew, english) => isEnglish() ? english : hebrew;
  const signLabel = (sign) => isEnglish() ? sign.labelEn : sign.label;

  function isBoard() {
    const params = new URLSearchParams(location.search);
    return location.pathname.replace(/\/$/, "") === "/therapist/build" && params.get("view") === "session";
  }

  function cardMarkup(sign) {
    return `<span class="visual-sign-card"><span class="visual-sign-art"><img src="${sign.asset}" alt=""></span><strong>${signLabel(sign)}</strong></span>`;
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
    const cacheKey = `${isEnglish() ? "en" : "he"}:${sign.id}`;
    if (cardCache.has(cacheKey)) return cardCache.get(cacheKey);
    const promise = new Promise((resolve, reject) => {
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
        context.direction = isEnglish() ? "ltr" : "rtl";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#111";
        context.font = '800 64px Rubik, Arial, sans-serif';
        context.fillText(signLabel(sign), 300, 530);
        resolve(canvas.toDataURL("image/png"));
      };
      image.onerror = reject;
      image.src = sign.asset;
    });
    cardCache.set(cacheKey, promise);
    return promise;
  }

  async function addSign(sign) {
    let items = [];
    try { items = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]"); } catch {}
    if (!Array.isArray(items)) items = [];
    let image;
    try { image = await renderCard(sign); } catch { return; }
    items.push({ kind: "photo", uid: `sign-${sign.id}-${Date.now()}`, image, label: signLabel(sign), visualSign: sign.id });
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
    palette.setAttribute("aria-label", text("בחירת סימן מוסכם", "Choose a visual sign"));
    palette.innerHTML = `<strong>${text("בחירת סימן ללוח", "Choose a sign for the board")}</strong><div>${signs.map((sign) => `<button type="button" data-add-visual-sign="${sign.id}" aria-label="${text(`הוספת ${sign.label} ללוח`, `Add ${sign.labelEn} to the board`)}">${cardMarkup(sign)}</button>`).join("")}</div><button type="button" class="meeting-signs-close" data-close-signs>${text("סגירה", "Close")}</button>`;
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
    wrap.innerHTML = `<button type="button" class="meeting-signs-button" data-board-signs aria-expanded="false" title="${text("הוספת סימנים מוסכמים ללוח", "Add visual signs to the board")}"><span class="meeting-action-icon" aria-hidden="true">✋</span><span class="meeting-action-label-desktop">${text("סימנים מוסכמים", "Visual signs")}</span><span class="meeting-action-label-mobile">${text("סימנים", "Signs")}</span></button>`;
    const timer = actions.querySelector(".meeting-timer");
    actions.insertBefore(wrap, timer || actions.querySelector(".meeting-photo"));
  }

  async function decorateBoardSigns() {
    let items = [];
    try { items = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]"); } catch {}
    if (!Array.isArray(items)) return;
    const rows = [...document.querySelectorAll("ol.space-y-3 > li")];
    await Promise.all(items.map(async (item, index) => {
      if (!item?.visualSign || !rows[index]) return;
      const sign = signs.find((candidate) => candidate.id === item.visualSign);
      if (!sign) return;
      const label = signLabel(sign);
      const row = rows[index];
      const title = row.querySelector("h2,h3,h4");
      const image = row.querySelector("img");
      if (title && title.textContent.trim() !== label) title.textContent = label;
      if (image) {
        const localizedImage = await renderCard(sign);
        if (image.src !== localizedImage) image.src = localizedImage;
        image.alt = label;
      }
      const completion = row.querySelector(":scope > button[aria-label]");
      if (completion) completion.setAttribute("aria-label", text(`סימון ${sign.label} כפעילות שבוצעה`, `Mark ${sign.labelEn} as completed`));
      row.classList.add("visual-sign-board-item");
    }));
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
