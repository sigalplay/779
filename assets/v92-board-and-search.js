(() => {
  "use strict";

  const CLOUD_URL = "https://qcklptudfclzvddjarkw.supabase.co";
  const CLOUD_KEY = "sb_publishable_8Bp_l_qcOxT2A67Sw2T35A_aVCvWh8H";
  const DRAFT_KEY = "pp_draft_plan";
  const GUEST_BOARDS_KEY = "boo_guest_boards_by_date";
  let knownBoardDates = [];

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);

  function localDate() {
    const date = new Date();
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  function activeBoardDate() {
    const value = new URLSearchParams(location.search).get("boardDate");
    return /^\d{4}-\d{2}-\d{2}$/.test(value || "") ? value : localDate();
  }

  function addDays(value, days) {
    const date = new Date(`${value}T12:00:00`);
    date.setDate(date.getDate() + days);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  function formatDate(value) {
    try { return new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`)); }
    catch { return value; }
  }

  function isSessionBoard() {
    const params = new URLSearchParams(location.search);
    return location.pathname.replace(/\/$/, "") === "/therapist/build" && params.get("view") === "session";
  }

  function readSession() {
    try { return JSON.parse(localStorage.getItem("boo_cloud_session") || "null"); } catch { return null; }
  }

  function readGuestBoards() {
    try {
      const boards = JSON.parse(localStorage.getItem(GUEST_BOARDS_KEY) || "{}");
      return boards && typeof boards === "object" && !Array.isArray(boards) ? boards : {};
    } catch { return {}; }
  }

  function persistGuestBoard(date = activeBoardDate()) {
    if (!isSessionBoard() || new URLSearchParams(location.search).has("patientBoard")) return;
    const boards = readGuestBoards();
    boards[date] = localStorage.getItem(DRAFT_KEY) || "[]";
    localStorage.setItem(GUEST_BOARDS_KEY, JSON.stringify(boards));
  }

  function moveToBoardDate(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return;
    const url = new URL(location.href);
    if (!url.searchParams.has("patientBoard")) {
      persistGuestBoard();
      const saved = readGuestBoards()[date];
      localStorage.setItem(DRAFT_KEY, typeof saved === "string" ? saved : Array.isArray(saved) ? JSON.stringify(saved) : "[]");
    }
    url.searchParams.set("view", "session");
    url.searchParams.set("boardDate", date);
    url.searchParams.delete("cloudBoardReady");
    url.searchParams.delete("planning");
    location.assign(`${url.pathname}${url.search}`);
  }

  async function loadKnownBoardDates(select) {
    const params = new URLSearchParams(location.search);
    const patientId = params.get("patientBoard");
    const current = activeBoardDate();
    if (patientId) {
      const session = readSession();
      if (session?.access_token) {
        try {
          const headers = { apikey: CLOUD_KEY, Authorization: `Bearer ${session.access_token}` };
          const response = await fetch(`${CLOUD_URL}/rest/v1/daily_meeting_boards?patient_id=eq.${encodeURIComponent(patientId)}&select=board_date&order=board_date.asc`, { headers });
          if (response.ok) knownBoardDates = (await response.json()).map((board) => board.board_date).filter(Boolean);
        } catch {}
      }
    } else {
      knownBoardDates = Object.keys(readGuestBoards());
    }
    knownBoardDates = [...new Set([...knownBoardDates, current])].sort();
    if (!select) return;
    select.innerHTML = `<option value="">מעבר ללוח שמור…</option>${knownBoardDates.map((date) => `<option value="${escapeHtml(date)}"${date === current ? " selected" : ""}>${escapeHtml(formatDate(date))}</option>`).join("")}`;
  }

  function neighboringDate(direction) {
    const current = activeBoardDate();
    const ordered = [...knownBoardDates].sort();
    const candidates = direction < 0 ? ordered.filter((date) => date < current) : ordered.filter((date) => date > current);
    if (candidates.length) return direction < 0 ? candidates[candidates.length - 1] : candidates[0];
    return addDays(current, direction * 7);
  }

  async function copyBoardToNextWeek(button) {
    const current = activeBoardDate();
    const next = addDays(current, 7);
    let items = [];
    try { items = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]"); } catch {}
    if (!Array.isArray(items)) items = [];
    const params = new URLSearchParams(location.search);
    const patientId = params.get("patientBoard");
    button.disabled = true;
    button.textContent = "משכפלת…";
    if (patientId) {
      const session = readSession();
      if (!session?.access_token || !session?.user?.id) {
        button.disabled = false;
        button.textContent = "שכפול לשבוע הבא";
        return;
      }
      let drawingData = [];
      try { drawingData = JSON.parse(localStorage.getItem(`boo_board_drawing_patient_${patientId}_${current}`) || "[]"); } catch {}
      try {
        const response = await fetch(`${CLOUD_URL}/rest/v1/daily_meeting_boards?on_conflict=user_id,patient_id,board_date`, {
          method: "POST",
          headers: { apikey: CLOUD_KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
          body: JSON.stringify({ user_id: session.user.id, patient_id: patientId, board_date: next, items, drawing_data: Array.isArray(drawingData) ? drawingData : [], updated_at: new Date().toISOString() })
        });
        if (!response.ok) throw new Error("copy-failed");
      } catch {
        button.disabled = false;
        button.textContent = "נסי שוב";
        return;
      }
    } else {
      const boards = readGuestBoards();
      boards[next] = JSON.stringify(items);
      localStorage.setItem(GUEST_BOARDS_KEY, JSON.stringify(boards));
    }
    moveToBoardDate(next);
  }

  function installDateNavigation() {
    if (!isSessionBoard()) return;
    const actions = document.querySelector("[data-meeting-board-actions]");
    if (!actions || document.querySelector("[data-board-date-navigation]")) return;
    const current = activeBoardDate();
    const navigation = document.createElement("section");
    navigation.className = "meeting-board-date-navigation";
    navigation.dataset.boardDateNavigation = "true";
    navigation.setAttribute("aria-label", "מעבר בין לוחות טיפול");
    navigation.innerHTML = `
      <button type="button" class="meeting-board-date-card" data-previous-board><span class="meeting-date-arrow" aria-hidden="true">‹</span><strong>הטיפול הקודם</strong></button>
      <label class="meeting-board-date-card meeting-current-date"><strong>${current === localDate() ? "היום" : "תאריך הטיפול"}</strong><span>${escapeHtml(formatDate(current))}</span><input type="date" value="${current}" data-board-date-input aria-label="בחירת תאריך טיפול"></label>
      <button type="button" class="meeting-board-date-card" data-next-board><strong>הטיפול הבא</strong><span class="meeting-date-arrow" aria-hidden="true">›</span></button>
      <select data-saved-board-select aria-label="מעבר ללוח טיפול שמור"><option>טוענת לוחות…</option></select>
      <button type="button" class="meeting-copy-board" data-copy-next-board>שכפול לשבוע הבא</button>`;
    actions.parentElement.insertBefore(navigation, actions);
    loadKnownBoardDates(navigation.querySelector("[data-saved-board-select]"));
  }

  function ensurePhotoInput() {
    if (!isSessionBoard() || document.querySelector("[data-board-photo-input]")) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.hidden = true;
    input.dataset.boardPhotoInput = "true";
    document.body.append(input);
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      input.value = "";
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const scale = Math.min(1, 900 / Math.max(image.width, image.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(image.width * scale));
          canvas.height = Math.max(1, Math.round(image.height * scale));
          canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
          showPhotoPreview(dataUrl, input);
        };
        image.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function showPhotoPreview(dataUrl, input) {
    document.querySelector("[data-board-photo-preview]")?.remove();
    const dialog = document.createElement("div");
    dialog.className = "board-photo-preview";
    dialog.dataset.boardPhotoPreview = "true";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", "תצוגה מקדימה של התמונה");
    dialog.innerHTML = `<div class="board-photo-preview-card"><h2>התמונה שתתווסף ללוח</h2><img alt="תצוגה מקדימה"><div><button type="button" data-confirm-photo>הוספה ללוח</button><button type="button" data-repick-photo>צילום או בחירה מחדש</button><button type="button" data-cancel-photo>ביטול</button></div></div>`;
    dialog.querySelector("img").src = dataUrl;
    const close = () => dialog.remove();
    dialog.querySelector("[data-cancel-photo]").addEventListener("click", close);
    dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
    dialog.querySelector("[data-repick-photo]").addEventListener("click", () => {
      close();
      input.click();
    });
    dialog.querySelector("[data-confirm-photo]").addEventListener("click", () => {
      let items = [];
      try { items = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]"); } catch {}
      if (!Array.isArray(items)) items = [];
      items.push({ kind: "photo", uid: `photo-${Date.now()}`, image: dataUrl, label: "תמונה" });
      localStorage.setItem(DRAFT_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent("boo_draft_plan_changed", { detail: { items, source: "meeting-board-photo" } }));
      close();
      window.setTimeout(() => location.reload(), 450);
    });
    document.body.append(dialog);
    dialog.querySelector("[data-confirm-photo]").focus();
  }

  function activityCardsForCurrentPage() {
    const path = location.pathname.replace(/\/$/, "");
    if (path === "/therapist/all" || path === "/parent/all") {
      const grids = [...document.querySelectorAll("div.grid")];
      const grid = grids.find((candidate) => candidate.querySelectorAll('a[href^="/activity/"]').length >= 2);
      return grid ? [...grid.children] : [];
    }
    if (path !== "/therapist/build" || new URLSearchParams(location.search).get("view") === "session") return [];
    const cards = new Set();
    document.querySelectorAll("button").forEach((button) => {
      if (!/(הוסף לתכנית|הוסף לתוכנית|הוסף למפגש)/.test(button.textContent || "")) return;
      const card = button.closest("div.flex.flex-col.overflow-hidden.rounded-3xl");
      if (card && !card.closest("aside")) cards.add(card);
    });
    return [...cards];
  }

  function installActivityNameSearch() {
    const path = location.pathname.replace(/\/$/, "");
    if (!["/therapist/all", "/parent/all", "/therapist/build"].includes(path) || isSessionBoard()) return;
    const cards = activityCardsForCurrentPage();
    if (!cards.length) return;
    document.body.classList.add("activities-two-column-page");
    if (cards.every((card) => card.parentElement === cards[0].parentElement)) cards[0].parentElement?.classList.add("activity-card-grid-v92");
    let search = document.querySelector("[data-activity-name-search]");
    if (!search) {
      search = document.createElement("div");
      search.className = "activity-name-search";
      search.dataset.activityNameSearch = "true";
      search.innerHTML = `<span aria-hidden="true">⌕</span><input type="search" autocomplete="off" placeholder="חיפוש לפי שם הפעילות…" aria-label="חיפוש לפי שם הפעילות"><button type="button" aria-label="ניקוי החיפוש" title="ניקוי החיפוש">×</button><small role="status"></small>`;
      const descriptiveLine = [...document.querySelectorAll("p")].find((element) => /כל הפעילויות בבנק|כל הפעילויות/.test(element.textContent || ""));
      const grid = cards[0].parentElement;
      (descriptiveLine?.parentElement || grid?.parentElement)?.insertBefore(search, descriptiveLine ? descriptiveLine.nextSibling : grid);
      search.querySelector("input").addEventListener("input", applyActivitySearch);
      search.querySelector("button").addEventListener("click", () => {
        search.querySelector("input").value = "";
        applyActivitySearch();
        search.querySelector("input").focus();
      });
    }
    applyActivitySearch();
  }

  function installCompactCatalogCards() {
    const path = location.pathname.replace(/\/$/, "");
    const active = ["/parent/recipes", "/therapist/recipes", "/parent/experiments", "/therapist/experiments"].includes(path);
    document.body?.classList.toggle("compact-catalog-mobile-page", active);
    if (!active) return;
    document.querySelectorAll("div.grid").forEach((grid) => {
      const cards = [...grid.children].filter((child) => child.matches("div") && child.querySelector(":scope > button.block.w-full"));
      if (cards.length < 2) return;
      grid.classList.add("compact-catalog-grid-v95");
      cards.forEach((card) => card.classList.add("compact-catalog-card-v95"));
    });
  }

  function applyActivitySearch() {
    const search = document.querySelector("[data-activity-name-search]");
    if (!search) return;
    const query = search.querySelector("input").value.trim().toLocaleLowerCase("he").replace(/\s+/g, " ");
    const cards = activityCardsForCurrentPage();
    let shown = 0;
    cards.forEach((card) => {
      const title = card.querySelector("h2,h3,h4")?.textContent || card.textContent || "";
      const match = !query || title.toLocaleLowerCase("he").replace(/\s+/g, " ").includes(query);
      card.hidden = !match;
      card.style.display = match ? "" : "none";
      if (match) shown += 1;
    });
    search.classList.toggle("has-query", Boolean(query));
    search.querySelector("small").textContent = query && !shown ? "לא נמצאה פעילות בשם הזה" : query ? `${shown} פעילויות נמצאו` : "";
  }

  function keepEnglishHidden() {
    let englishPreview = false;
    try { englishPreview = sessionStorage.getItem("boo_english_preview") === "1" && localStorage.getItem("boo_nesahek_language") === "en"; } catch {}
    try {
      if (!englishPreview && localStorage.getItem("boo_nesahek_language") !== "he") localStorage.setItem("boo_nesahek_language", "he");
    } catch {}
    document.documentElement.lang = englishPreview ? "en" : "he";
    document.documentElement.dir = englishPreview ? "ltr" : "rtl";
    document.querySelectorAll("button,a").forEach((element) => {
      if (element.hasAttribute("data-boo-lang-switch")) return;
      const text = (element.textContent || "").replace(/\s+/g, " ").trim();
      if (text === "English" || (text === "עברית" && (element.tagName === "BUTTON" || element.getAttribute("href") === "/en"))) {
        element.hidden = true;
        element.style.setProperty("display", "none", "important");
        element.dataset.englishSwitchHidden = "true";
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (event.target.closest?.("[data-previous-board]")) moveToBoardDate(neighboringDate(-1));
    if (event.target.closest?.("[data-next-board]")) moveToBoardDate(neighboringDate(1));
    const copy = event.target.closest?.("[data-copy-next-board]");
    if (copy) copyBoardToNextWeek(copy);
  }, true);

  document.addEventListener("change", (event) => {
    if (event.target.matches?.("[data-board-date-input]") && event.target.value) moveToBoardDate(event.target.value);
    if (event.target.matches?.("[data-saved-board-select]") && event.target.value) moveToBoardDate(event.target.value);
  });

  window.addEventListener("boo_open_board_photo_picker", () => {
    ensurePhotoInput();
    document.querySelector("[data-board-photo-input]")?.click();
  });

  window.addEventListener("boo_draft_plan_changed", () => persistGuestBoard());
  window.addEventListener("pagehide", () => persistGuestBoard());

  let queued = false;
  function refresh() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      installDateNavigation();
      ensurePhotoInput();
      installActivityNameSearch();
      installCompactCatalogCards();
      keepEnglishHidden();
    });
  }
  new MutationObserver(refresh).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh, { once: true });
  else refresh();
})();
