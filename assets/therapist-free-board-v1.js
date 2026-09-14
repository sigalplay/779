import { SEED_ACTIVITIES } from "/assets/activities-data-BqW1L61q.js";
import { BOARD_GAMES } from "/assets/board-games-data-D4loEPYW.js";

const STORAGE_KEY = "boo_therapist_free_board_v1";
const canvas = document.querySelector("#boardCanvas");
const emptyBoard = document.querySelector("#emptyBoard");
const boardTitle = document.querySelector("#boardTitle");
const addMenuButton = document.querySelector("#addMenuButton");
const addMenu = document.querySelector("#addMenu");
const overlay = document.querySelector("#pickerOverlay");
const pickerResults = document.querySelector("#pickerResults");
const pickerSearch = document.querySelector("#pickerSearch");
const pickerSearchWrap = document.querySelector("#pickerSearchWrap");
const customPicker = document.querySelector("#customPicker");
const motorPicker = document.querySelector("#motorPicker");
const toast = document.querySelector("#toast");
const fullscreenButton = document.querySelector("#fullscreenBoard");
const quickAddTimer = document.querySelector("#quickAddTimer");
const addActivityFromSearch = document.querySelector("#addActivityFromSearch");

let state = loadState();
let activeWidgetId = null;
let activeSlot = null;
let pickerTab = "activities";
let customImageData = "";
let timerTicker = null;
let topZ = 3;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.widgets && Array.isArray(saved.widgets)) {
      saved.widgets.forEach((widget) => {
        if (widget.type === "timer") widget.running = false;
      });
      return saved;
    }
  } catch {}
  return { title: "לוח המפגש שלי", widgets: [] };
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function notify(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(notify.timeout);
  notify.timeout = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function makeId(type) {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nextPosition(index) {
  return { x: 40 + (index % 3) * 75, y: 45 + (index % 4) * 65 };
}

function addWidget(type) {
  const position = nextPosition(state.widgets.length);
  if (type === "sequence") {
    state.widgets.push({ id: makeId(type), type, ...position, items: [null, null, null, null] });
  } else if (type === "timer") {
    state.widgets.push({ id: makeId(type), type, ...position, minutes: 10, remaining: 600, running: false });
  }
  persist();
  render();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
}

function activityImage(item) {
  const special = {
    "seed-77": "/icon-bank/movement/seed-77/hero.webp",
    "seed-78": "/icon-bank/sensory-new/seed-78-illustrated/hero.webp",
    "seed-79": "/icon-bank/embedded-v359/seed-79/hero.webp",
    "seed-81": "/icon-bank/movement/seed-81/hero.webp",
    "seed-83": "/icon-bank/crafts-new/seed-83/cell-00.webp",
    "seed-85": "/icon-bank/sensory/seed-85/hero.webp",
    "seed-86": "/icon-bank/creative/seed-86/hero.webp",
    "seed-87": "/icon-bank/crafts-new/seed-87-independent/hero.webp",
    "seed-88": "/icon-bank/social-new/seed-88-rattles/hero.webp",
    "seed-89": "/icon-bank/crafts-new/seed-89-independent/hero.webp",
    "seed-90": "/icon-bank/movement-new/seed-90-illustrated/hero.webp",
    "seed-91": "/icon-bank/crafts-new/seed-91-independent/hero.webp",
    "seed-92": "/icon-bank/navigation-v2/play-today-flat.webp",
    "seed-93": "/icon-bank/navigation-v2/play-today-flat.webp",
    "seed-94": "/icon-bank/navigation-v2/play-today-flat.webp",
    "seed-95": "/icon-bank/navigation-v2/play-today-flat.webp",
    "seed-96": "/icon-bank/navigation-v2/play-today-flat.webp",
    "seed-97": "/icon-bank/navigation-v2/play-today-flat.webp",
    "seed-98": "/icon-bank/navigation-v2/play-today-flat.webp",
    "seed-99": "/icon-bank/navigation-v2/play-today-flat.webp",
    "seed-100": "/icon-bank/crafts-new/seed-100-independent/hero.webp",
    "seed-101": "/icon-bank/crafts-new/seed-101-illustrated/hero.webp",
    "seed-102": "/icon-bank/crafts-new/seed-102-illustrated/hero.webp",
    "seed-103": "/icon-bank/crafts-new/seed-103/hero.webp",
    "seed-104": "/icon-bank/sensory-new/seed-104-find-sound/hero.webp",
    "seed-105": "/icon-bank/crafts-new/seed-105-magic-ocean/hero.webp",
    "seed-106": "/icon-bank/crafts-new/seed-106-popsicle-craft/hero-v3.webp",
    "seed-107": "/icon-bank/crafts-new/seed-107-colorful-butterfly/hero.webp",
    "seed-112": "/icon-bank/crafts-new/seed-110-pomegranate/hero.webp",
    "seed-113": "/icon-bank/crafts-new/seed-113-shark-teeth/hero.webp",
    "seed-114": "/icon-bank/food-exposure/seed-114-train/hero.png",
    "seed-115": "/icon-bank/food-exposure/seed-115-bear/hero.png",
    "seed-116": "/icon-bank/sensory-new/seed-116-sensory-bag-path/hero.png",
    "seed-117": "/icon-bank/sensory-new/seed-117-paint-bag/hero.png",
    "seed-118": "/icon-bank/sensory-new/seed-118-colour-scarf-pull/hero.png",
  };
  return item.hero_image || item.image || special[item.id] || `/icon-bank/activities/${item.id}.webp`;
}

function sequenceMarkup(widget) {
  const rows = widget.items.map((item, index) => `
    <div class="sequence-row">
      <span class="step-number">${index + 1}</span>
      <button class="slot-button" type="button" data-slot="${index}" aria-label="בחירת תמונה לשלב ${index + 1}">
        ${item?.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.label)}">` : '<span class="plus">+</span>'}
      </button>
      <span class="slot-label ${item ? "" : "empty"}">${escapeHtml(item?.label || "לחצו כדי לבחור מה נעשה")}</span>
      ${item ? `<button class="icon-button clear-slot" type="button" data-clear-slot="${index}" aria-label="ניקוי שלב ${index + 1}" title="ניקוי">×</button>` : ""}
    </div>`).join("");
  return `<article class="board-widget sequence-widget" data-widget="${widget.id}" style="right:${widget.x}px;top:${widget.y}px;z-index:${widget.z || 2}">
    <div class="widget-head drag-handle"><strong>מה נעשה בטיפול?</strong><div class="widget-tools"><button class="icon-button" type="button" data-remove-widget aria-label="מחיקת סדר הפעילויות" title="מחיקה">×</button></div></div>
    <div class="sequence-body"><div class="sequence-controls"><button type="button" data-sequence-add aria-label="הוספת שלב" title="הוספת שלב">+</button><button type="button" data-sequence-remove aria-label="הסרת שלב" title="הסרת שלב">−</button><span>${widget.items.length} שלבים</span></div><div class="sequence-list">${rows}</div></div>
  </article>`;
}

function timerMarkup(widget) {
  const display = `${String(Math.floor(widget.remaining / 60)).padStart(2, "0")}:${String(widget.remaining % 60).padStart(2, "0")}`;
  const progress = Math.max(0, Math.min(100, (widget.remaining / (widget.minutes * 60)) * 100));
  return `<article class="board-widget timer-widget" data-widget="${widget.id}" style="right:${widget.x}px;top:${widget.y}px;z-index:${widget.z || 2}">
    <div class="widget-head drag-handle"><strong>כמה זמן נשאר?</strong><div class="widget-tools"><button class="icon-button" type="button" data-remove-widget aria-label="מחיקת הטיימר" title="מחיקה">×</button></div></div>
    <div class="timer-body"><div class="timer-clock" style="--timer-progress:${progress}%"><span class="timer-display">${display}</span></div>
      <div class="timer-presets">${[5,10,15,20,30].map((minute) => `<button type="button" data-timer-minutes="${minute}" class="${widget.minutes === minute ? "active" : ""}">${minute} דק׳</button>`).join("")}</div>
      <div class="timer-actions"><button class="button primary" type="button" data-timer-toggle>${widget.running ? "השהיה" : "התחלה"}</button><button class="button secondary" type="button" data-timer-reset>איפוס</button></div>
    </div>
  </article>`;
}

function activityMarkup(widget) {
  return `<article class="board-widget activity-widget" data-widget="${widget.id}" style="right:${widget.x}px;top:${widget.y}px;z-index:${widget.z || 2}">
    <div class="widget-head drag-handle"><strong>פעילות במפגש</strong><div class="widget-tools"><button class="icon-button" type="button" data-remove-widget aria-label="מחיקת הפעילות" title="מחיקה">×</button></div></div>
    <div class="activity-widget-body"><img src="${escapeHtml(widget.image)}" alt="${escapeHtml(widget.label)}"><strong>${escapeHtml(widget.label)}</strong></div>
  </article>`;
}

function render() {
  canvas.querySelectorAll(".board-widget").forEach((widget) => widget.remove());
  for (const widget of state.widgets) {
    const markup = widget.type === "sequence" ? sequenceMarkup(widget) : widget.type === "timer" ? timerMarkup(widget) : activityMarkup(widget);
    canvas.insertAdjacentHTML("beforeend", markup);
  }
  emptyBoard.hidden = state.widgets.length > 0;
  boardTitle.value = state.title;
  startTimerTicker();
}

function getWidget(id) {
  return state.widgets.find((widget) => widget.id === id);
}

function removeWidget(id) {
  state.widgets = state.widgets.filter((widget) => widget.id !== id);
  persist();
  render();
}

function startDrag(event, widgetElement, widget) {
  if (event.button !== 0 || event.target.closest("button,input,a")) return;
  event.preventDefault();
  topZ += 1;
  widget.z = topZ;
  widgetElement.style.zIndex = topZ;
  const startX = event.clientX;
  const startY = event.clientY;
  const startRight = widget.x;
  const startTop = widget.y;
  const move = (moveEvent) => {
    const maxRight = Math.max(0, canvas.clientWidth - widgetElement.offsetWidth);
    const maxTop = Math.max(0, canvas.clientHeight - widgetElement.offsetHeight);
    widget.x = Math.max(0, Math.min(maxRight, startRight - (moveEvent.clientX - startX)));
    widget.y = Math.max(0, Math.min(maxTop, startTop + (moveEvent.clientY - startY)));
    widgetElement.style.right = `${widget.x}px`;
    widgetElement.style.top = `${widget.y}px`;
  };
  const end = () => {
    window.removeEventListener("pointermove", move);
    persist();
  };
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end, { once: true });
}

canvas.addEventListener("pointerdown", (event) => {
  const handle = event.target.closest(".drag-handle");
  if (!handle) return;
  const element = handle.closest(".board-widget");
  const widget = getWidget(element.dataset.widget);
  if (widget) startDrag(event, element, widget);
});

canvas.addEventListener("click", (event) => {
  const element = event.target.closest(".board-widget");
  if (!element) return;
  const widget = getWidget(element.dataset.widget);
  if (!widget) return;
  if (event.target.closest("[data-remove-widget]")) return removeWidget(widget.id);
  const slot = event.target.closest("[data-slot]");
  if (slot) return openPicker(widget.id, Number(slot.dataset.slot));
  const clearSlot = event.target.closest("[data-clear-slot]");
  if (clearSlot) {
    widget.items[Number(clearSlot.dataset.clearSlot)] = null;
    persist();
    return render();
  }
  if (event.target.closest("[data-sequence-add]")) {
    if (widget.items.length < 10) widget.items.push(null);
    persist();
    return render();
  }
  if (event.target.closest("[data-sequence-remove]")) {
    if (widget.items.length > 1) widget.items.pop();
    persist();
    return render();
  }
  const minutes = event.target.closest("[data-timer-minutes]");
  if (minutes) {
    widget.minutes = Number(minutes.dataset.timerMinutes);
    widget.remaining = widget.minutes * 60;
    widget.running = false;
    persist();
    return render();
  }
  if (event.target.closest("[data-timer-toggle]")) {
    if (widget.remaining <= 0) widget.remaining = widget.minutes * 60;
    widget.running = !widget.running;
    persist();
    return render();
  }
  if (event.target.closest("[data-timer-reset]")) {
    widget.running = false;
    widget.remaining = widget.minutes * 60;
    persist();
    return render();
  }
});

function startTimerTicker() {
  window.clearInterval(timerTicker);
  if (!state.widgets.some((widget) => widget.type === "timer" && widget.running)) return;
  timerTicker = window.setInterval(() => {
    let changed = false;
    for (const widget of state.widgets) {
      if (widget.type !== "timer" || !widget.running) continue;
      widget.remaining = Math.max(0, widget.remaining - 1);
      if (widget.remaining === 0) widget.running = false;
      updateTimerDisplay(widget);
      changed = true;
    }
    if (changed) {
      persist();
      if (!state.widgets.some((widget) => widget.type === "timer" && widget.running)) window.clearInterval(timerTicker);
    }
  }, 1000);
}

function updateTimerDisplay(widget) {
  const element = canvas.querySelector(`[data-widget="${widget.id}"]`);
  if (!element) return;
  const display = `${String(Math.floor(widget.remaining / 60)).padStart(2, "0")}:${String(widget.remaining % 60).padStart(2, "0")}`;
  const progress = Math.max(0, Math.min(100, (widget.remaining / (widget.minutes * 60)) * 100));
  element.querySelector(".timer-display").textContent = display;
  element.querySelector(".timer-clock").style.setProperty("--timer-progress", `${progress}%`);
  element.querySelector("[data-timer-toggle]").textContent = widget.running ? "השהיה" : "התחלה";
}

function openPicker(widgetId, slotIndex) {
  activeWidgetId = widgetId;
  activeSlot = slotIndex;
  pickerTab = "activities";
  pickerSearch.value = "";
  setPickerTab("activities");
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closePicker() {
  overlay.hidden = true;
  document.body.style.overflow = "";
  customImageData = "";
}

function chooseItem(item) {
  const widget = getWidget(activeWidgetId);
  if (!widget || activeSlot === null) return;
  widget.items[activeSlot] = item;
  persist();
  closePicker();
  render();
}

function setPickerTab(tab) {
  pickerTab = tab;
  document.querySelectorAll("[data-picker-tab]").forEach((button) => button.classList.toggle("active", button.dataset.pickerTab === tab));
  pickerResults.hidden = !["activities", "games"].includes(tab);
  pickerSearchWrap.hidden = !["activities", "games"].includes(tab);
  customPicker.hidden = tab !== "book";
  motorPicker.hidden = tab !== "motor";
  if (["activities", "games"].includes(tab)) renderPickerResults();
}

function renderPickerResults() {
  const query = pickerSearch.value.trim().toLowerCase();
  const source = pickerTab === "games" ? BOARD_GAMES : SEED_ACTIVITIES;
  const entries = source.filter((item) => !query || item.title.toLowerCase().includes(query)).slice(0, 80);
  pickerResults.innerHTML = entries.map((item) => {
    const image = pickerTab === "games" ? item.image : activityImage(item);
    return `<button class="picker-item" type="button" data-pick-id="${escapeHtml(item.id)}"><img src="${escapeHtml(image || "/icon-bank/navigation-v2/creative.webp")}" alt=""><strong>${escapeHtml(item.title)}</strong></button>`;
  }).join("") || "<p>לא נמצאו תוצאות.</p>";
}

pickerResults.addEventListener("click", (event) => {
  const button = event.target.closest("[data-pick-id]");
  if (!button) return;
  const source = pickerTab === "games" ? BOARD_GAMES : SEED_ACTIVITIES;
  const item = source.find((entry) => entry.id === button.dataset.pickId);
  if (!item) return;
  chooseItem({ kind: pickerTab === "games" ? "game" : "activity", id: item.id, label: item.title, image: pickerTab === "games" ? item.image : activityImage(item) });
});

document.querySelectorAll("[data-picker-tab]").forEach((button) => button.addEventListener("click", () => setPickerTab(button.dataset.pickerTab)));
pickerSearch.addEventListener("input", renderPickerResults);
document.querySelector("#closePicker").addEventListener("click", closePicker);
overlay.addEventListener("click", (event) => { if (event.target === overlay) closePicker(); });

document.querySelector("#customImage").addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  customImageData = await resizeImage(file);
  const preview = document.querySelector("#customPreview");
  preview.src = customImageData;
  preview.hidden = false;
});

function resizeImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, 520 / Math.max(image.width, image.height));
        const output = document.createElement("canvas");
        output.width = Math.round(image.width * scale);
        output.height = Math.round(image.height * scale);
        output.getContext("2d").drawImage(image, 0, 0, output.width, output.height);
        resolve(output.toDataURL("image/jpeg", 0.82));
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

document.querySelector("#useCustom").addEventListener("click", () => {
  const label = document.querySelector("#customLabel").value.trim() || "ספר או פעילות אישית";
  chooseItem({ kind: "custom", label, image: customImageData || "/icon-bank/weekly-board-kids/reading.webp" });
});

document.querySelector("#useMotor").addEventListener("click", () => {
  const label = document.querySelector("#motorLabel").value.trim() || "מסלול מוטורי";
  chooseItem({ kind: "motor", label, image: "/icon-bank/navigation-v2/therapy-build-flat.webp" });
});

addMenuButton.addEventListener("click", () => {
  const willOpen = addMenu.hidden;
  addMenu.hidden = !willOpen;
  addMenuButton.setAttribute("aria-expanded", String(willOpen));
});

quickAddTimer.addEventListener("click", () => addWidget("timer"));
addActivityFromSearch.addEventListener("click", () => {
  let draft = [];
  try { draft = JSON.parse(localStorage.getItem("pp_draft_plan") || "[]"); } catch {}
  sessionStorage.setItem("boo_board_search_baseline", JSON.stringify(Array.isArray(draft) ? draft : []));
  localStorage.setItem("pp_draft_plan", "[]");
});

addMenu.addEventListener("click", (event) => {
  const add = event.target.closest("[data-add]");
  const pending = event.target.closest("[data-pending]");
  if (add) addWidget(add.dataset.add);
  if (pending) notify("המקום נשמר בתפריט. נחבר את התוכן הקיים לאחר שתעלי אותו.");
  addMenu.hidden = true;
  addMenuButton.setAttribute("aria-expanded", "false");
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".add-wrap")) {
    addMenu.hidden = true;
    addMenuButton.setAttribute("aria-expanded", "false");
  }
});

boardTitle.addEventListener("input", () => {
  state.title = boardTitle.value;
  persist();
});

document.querySelector("#saveBoard").addEventListener("click", () => {
  state.title = boardTitle.value.trim() || "לוח המפגש שלי";
  persist();
  notify("לוח המפגש נשמר במכשיר");
});
document.querySelector("#printBoard").addEventListener("click", () => window.print());
function updateFullscreenButton() {
  const active = document.body.classList.contains("board-focus-mode");
  fullscreenButton.textContent = active ? "יציאה ממסך מלא" : "מסך מלא";
  fullscreenButton.setAttribute("aria-pressed", String(active));
}

fullscreenButton.addEventListener("click", async () => {
  const active = document.body.classList.contains("board-focus-mode");
  if (active) {
    document.body.classList.remove("board-focus-mode");
    if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen().catch(() => {});
  } else {
    document.body.classList.add("board-focus-mode");
    if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen().catch(() => {});
  }
  updateFullscreenButton();
});

document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) document.body.classList.remove("board-focus-mode");
  updateFullscreenButton();
});
document.querySelector("#clearBoard").addEventListener("click", () => {
  if (!state.widgets.length || window.confirm("לנקות את כל הרכיבים מהלוח?")) {
    state.widgets = [];
    persist();
    render();
  }
});

function importActivitiesFromSearch() {
  let pending = [];
  try { pending = JSON.parse(sessionStorage.getItem("boo_board_pending_activities") || "[]"); } catch {}
  sessionStorage.removeItem("boo_board_pending_activities");
  if (!Array.isArray(pending) || !pending.length) return;
  const existing = new Set(state.widgets.filter((widget) => widget.type === "activity").map((widget) => widget.sourceId));
  let added = 0;
  for (const entry of pending) {
    if (entry?.kind !== "activity" || !entry.id || existing.has(entry.id)) continue;
    const activity = findActivity(entry.id);
    if (!activity) continue;
    const position = nextPosition(state.widgets.length);
    state.widgets.push({ id: makeId("activity"), type: "activity", sourceId: activity.id, label: activity.title, image: activityImage(activity), ...position });
    existing.add(entry.id);
    added += 1;
  }
  if (added) {
    persist();
    notify(added === 1 ? "הפעילות נוספה ללוח המפגש" : `${added} פעילויות נוספו ללוח המפגש`);
  }
}

function findActivity(id) {
  const builtIn = SEED_ACTIVITIES.find((item) => item.id === id);
  if (builtIn) return builtIn;
  try {
    const custom = JSON.parse(localStorage.getItem("pp_activities_custom") || "[]");
    const match = Array.isArray(custom) && custom.find((item) => item.id === id);
    if (match) return match;
  } catch {}
  try {
    const published = JSON.parse(localStorage.getItem("boo_cms_published_v1") || "[]");
    const match = Array.isArray(published) && published.find((item) => item.content_type === "activity" && item.content_id === id);
    if (match?.payload) return { ...match.payload, id };
  } catch {}
  return null;
}

importActivitiesFromSearch();
render();
