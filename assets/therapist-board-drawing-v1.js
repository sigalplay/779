(() => {
  "use strict";

  let canvas = null;
  let board = null;
  let controls = null;
  let drawingEnabled = false;
  let tool = "pen";
  let color = "#5a67a8";
  let width = 4;
  let strokes = [];
  let currentStroke = null;
  let loadedKey = "";
  let saveTimer = 0;

  function isEnglish() {
    try { return sessionStorage.getItem("boo_english_preview") === "1" && localStorage.getItem("boo_nesahek_language") === "en"; }
    catch { return document.documentElement.lang === "en"; }
  }

  const text = (hebrew, english) => isEnglish() ? english : hebrew;

  function isMeetingBoard() {
    return location.pathname.replace(/\/$/, "") === "/therapist/build" && new URLSearchParams(location.search).get("view") === "session";
  }

  function localDate() {
    const date = new Date();
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  function storageKey() {
    const params = new URLSearchParams(location.search);
    const patientId = params.get("patientBoard");
    const requestedDate = params.get("boardDate");
    const boardDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate || "") ? requestedDate : localDate();
    return patientId ? `boo_board_drawing_patient_${patientId}_${boardDate}` : `boo_board_drawing_guest_${boardDate}`;
  }

  function loadStrokes() {
    const key = storageKey();
    if (key === loadedKey) return;
    loadedKey = key;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      strokes = Array.isArray(saved) ? saved : [];
    } catch { strokes = []; }
  }

  function saveStrokes() {
    localStorage.setItem(storageKey(), JSON.stringify(strokes));
    const status = controls?.querySelector("[data-drawing-status]");
    if (status) status.textContent = text("נשמר", "Saved");
    if (typeof window.booSaveBoardDrawing === "function") {
      if (status) status.textContent = text("שומרת…", "Saving…");
      window.booSaveBoardDrawing(strokes);
    }
  }

  function queueSave() {
    clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveStrokes, 250);
  }

  function resizeCanvas() {
    if (!canvas || !board) return;
    const rect = board.getBoundingClientRect();
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const nextWidth = Math.max(1, Math.round(rect.width * ratio));
    const nextHeight = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }
    render();
  }

  function drawStroke(context, stroke, rect) {
    if (!stroke?.points?.length) return;
    context.save();
    context.globalCompositeOperation = stroke.tool === "eraser" ? "destination-out" : "source-over";
    context.strokeStyle = stroke.color || color;
    context.fillStyle = stroke.color || color;
    context.lineWidth = Number(stroke.width || 4) * (stroke.tool === "eraser" ? 2 : 1);
    context.lineCap = "round";
    context.lineJoin = "round";
    const points = stroke.points.map((point) => ({ x: point.x * rect.width, y: point.y * rect.height }));
    if (points.length === 1) {
      context.beginPath();
      context.arc(points[0].x, points[0].y, context.lineWidth / 2, 0, Math.PI * 2);
      context.fill();
    } else {
      context.beginPath();
      context.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
      context.stroke();
    }
    context.restore();
  }

  function render() {
    if (!canvas || !board) return;
    const rect = board.getBoundingClientRect();
    const ratio = Math.max(1, window.devicePixelRatio || 1);
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    strokes.forEach((stroke) => drawStroke(context, stroke, rect));
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
    };
  }

  function enableDrawing(enabled) {
    drawingEnabled = enabled;
    canvas?.classList.toggle("drawing-enabled", enabled);
    const button = document.querySelector("[data-board-pen]");
    button?.classList.toggle("active", enabled);
    button?.setAttribute("aria-pressed", String(enabled));
    if (controls) controls.hidden = !enabled;
  }

  function installCanvas(list) {
    board = list;
    board.classList.add("meeting-board-surface");
    canvas = board.querySelector(":scope > canvas.meeting-board-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.className = "meeting-board-canvas";
      canvas.setAttribute("aria-label", text("כתיבה וציור על לוח המפגש", "Writing and drawing on the session board"));
      board.append(canvas);
      canvas.addEventListener("pointerdown", (event) => {
        if (!drawingEnabled) return;
        event.preventDefault();
        canvas.setPointerCapture?.(event.pointerId);
        currentStroke = { tool, color, width, points: [pointFromEvent(event)] };
        strokes.push(currentStroke);
        render();
      });
      canvas.addEventListener("pointermove", (event) => {
        if (!drawingEnabled || !currentStroke) return;
        event.preventDefault();
        const point = pointFromEvent(event);
        const previous = currentStroke.points[currentStroke.points.length - 1];
        const rect = canvas.getBoundingClientRect();
        if (Math.hypot((point.x - previous.x) * rect.width, (point.y - previous.y) * rect.height) < 2) return;
        currentStroke.points.push(point);
        render();
      });
      const finish = () => {
        if (!currentStroke) return;
        currentStroke = null;
        queueSave();
      };
      canvas.addEventListener("pointerup", finish);
      canvas.addEventListener("pointercancel", finish);
    }
    loadStrokes();
    resizeCanvas();
  }

  function installToolbar(actions) {
    let wrap = actions.querySelector("[data-drawing-tools]");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "meeting-drawing-tools";
      wrap.dataset.drawingTools = "true";
      wrap.innerHTML = `<button type="button" class="meeting-pen-button" data-board-pen aria-pressed="false" title="${text("עט — כתיבה וציור על הלוח", "Pen — write and draw on the board")}"><span class="meeting-action-icon" aria-hidden="true">✎</span><span class="meeting-action-label-desktop">${text("עט", "Pen")}</span><span class="meeting-action-label-mobile">${text("עט", "Pen")}</span></button><div class="meeting-drawing-controls" data-drawing-controls hidden><label>${text("צבע", "Color")} <input type="color" value="${color}" data-pen-color></label><label>${text("עובי", "Width")} <input type="range" min="2" max="14" step="1" value="${width}" data-pen-width><output data-width-output>${width}</output></label><button type="button" data-pen-mode class="active">${text("עט", "Pen")}</button><button type="button" data-eraser-mode>${text("מחק", "Eraser")}</button><button type="button" data-clear-drawing>${text("מחיקת הכתיבה", "Clear drawing")}</button><small data-drawing-status></small></div>`;
      const timer = actions.querySelector(".meeting-timer");
      actions.insertBefore(wrap, timer || actions.querySelector(".meeting-fullscreen"));
    }
    controls = wrap.querySelector("[data-drawing-controls]");
  }

  function mount() {
    if (!isMeetingBoard()) {
      enableDrawing(false);
      return;
    }
    const list = document.querySelector("ol.space-y-3");
    const actions = document.querySelector("[data-meeting-board-actions]");
    if (!list || !actions) return;
    installToolbar(actions);
    installCanvas(list);
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest?.("[data-board-pen]")) {
      event.preventDefault();
      enableDrawing(!drawingEnabled);
      return;
    }
    if (event.target.closest?.("[data-pen-mode]")) {
      tool = "pen";
      controls?.querySelector("[data-pen-mode]")?.classList.add("active");
      controls?.querySelector("[data-eraser-mode]")?.classList.remove("active");
      return;
    }
    if (event.target.closest?.("[data-eraser-mode]")) {
      tool = "eraser";
      controls?.querySelector("[data-eraser-mode]")?.classList.add("active");
      controls?.querySelector("[data-pen-mode]")?.classList.remove("active");
      return;
    }
    if (event.target.closest?.("[data-clear-drawing]")) {
      if (!strokes.length || !window.confirm(text("למחוק את כל הכתיבה מהלוח?", "Clear all drawing from the board?"))) return;
      strokes = [];
      render();
      saveStrokes();
    }
  }, true);

  document.addEventListener("input", (event) => {
    if (event.target.matches?.("[data-pen-color]")) color = event.target.value;
    if (event.target.matches?.("[data-pen-width]")) {
      width = Number(event.target.value);
      const output = controls?.querySelector("[data-width-output]");
      if (output) output.textContent = String(width);
    }
  });

  window.addEventListener("boo_cloud_drawing_status", (event) => {
    const status = controls?.querySelector("[data-drawing-status]");
    if (status) status.textContent = event.detail === "saved" ? text("נשמר בענן", "Saved to cloud") : text("השמירה נכשלה", "Save failed");
  });
  window.addEventListener("resize", resizeCanvas);
  if (window.ResizeObserver) new ResizeObserver(resizeCanvas).observe(document.documentElement);

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; mount(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener("popstate", schedule);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
})();
