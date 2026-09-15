(() => {
  "use strict";
  let reloadAfterCloudDelete = false;
  const CLOUD_URL = "https://qcklptudfclzvddjarkw.supabase.co";
  const CLOUD_KEY = "sb_publishable_8Bp_l_qcOxT2A67Sw2T35A_aVCvWh8H";

  function isMeetingBoard() {
    return location.pathname.replace(/\/$/, "") === "/therapist/build" && new URLSearchParams(location.search).get("view") === "session";
  }

  function addMeetingActions() {
    const existing = document.querySelector("[data-meeting-board-actions]");
    if (!isMeetingBoard()) {
      existing?.remove();
      document.body.classList.remove("meeting-board-page");
      document.body.classList.remove("meeting-board-fullscreen");
      return;
    }
    document.body.classList.add("meeting-board-page");
    if (existing) {
      hideLegacySessionControls();
      setupVisualTimer(existing);
      addDeleteButtons();
      return;
    }

    const list = document.querySelector("ol.space-y-3");
    if (!list?.parentElement) return;

    const actions = document.createElement("div");
    actions.className = "meeting-board-actions";
    actions.dataset.meetingBoardActions = "true";
    const params = new URLSearchParams(location.search);
    const patientId = params.get("patientBoard");
    const cloudReady = params.get("cloudBoardReady") === "1";
    const boardDate = params.get("boardDate");
    const dateSuffix = /^\d{4}-\d{2}-\d{2}$/.test(boardDate || "") ? `&boardDate=${encodeURIComponent(boardDate)}` : "";
    const patientSuffix = patientId ? `&patientBoard=${encodeURIComponent(patientId)}${dateSuffix}${cloudReady ? "&cloudBoardReady=1" : ""}` : dateSuffix;
    let activePatient = null;
    try { activePatient = JSON.parse(localStorage.getItem("boo_active_cloud_patient") || "null"); } catch {}
    const planningLabel = patientId && activePatient?.id === patientId
      ? `<strong>לוח המפגש של ${escapeHtml(activePatient.name)}</strong><small data-cloud-save-state>נשמר בענן</small>`
      : `<strong>תכנון טיפולים</strong><small>בחירת מטופל ושמירת לוחות</small>`;
    actions.innerHTML = `
      <button class="meeting-tools-toggle" type="button" aria-expanded="true" aria-label="כיווץ כלי הלוח" title="כיווץ כלי הלוח"><span aria-hidden="true">⌃</span></button>
      <div class="meeting-planning-wrap">
        <button class="meeting-save-state${patientId ? "" : " guest"}" type="button" data-treatment-planning aria-expanded="false">${planningLabel}<span aria-hidden="true">⌄</span></button>
        <div class="meeting-patient-menu" data-patient-menu hidden></div>
      </div>
      <a class="meeting-add-activity" href="/therapist/build?tab=search&boardMode=1${patientSuffix}">הוסף פעילות ללוח המפגש</a>
      <a class="meeting-board-link" href="/therapist/motor-trail?returnTo=session${patientSuffix}"><span class="meeting-action-icon" aria-hidden="true">＋</span><span class="meeting-action-label-desktop">הוספת מסלול מוטורי</span><span class="meeting-action-label-mobile">מסלול מוטורי</span></a>
      <button class="meeting-timer" type="button"><span class="meeting-action-icon" aria-hidden="true">⏱</span><span class="meeting-action-label-desktop">טיימר חזותי</span><span class="meeting-action-label-mobile">טיימר</span></button>
      <button class="meeting-photo" type="button"><span class="meeting-action-icon" aria-hidden="true">📷</span><span class="meeting-action-label-desktop">צילום או הוספת תמונה</span><span class="meeting-action-label-mobile">תמונה</span></button>
      <button class="meeting-fullscreen" type="button" aria-pressed="false"><span class="meeting-action-icon" aria-hidden="true">⛶</span><span data-fullscreen-label>מסך מלא</span></button>`;
    list.parentElement.insertBefore(actions, list);
    hideLegacySessionControls();
    setupVisualTimer(actions);
    addDeleteButtons();
    if (params.get("planning") === "1") window.setTimeout(() => openPlanningMenu(actions), 0);
  }

  function readSession() {
    try { return JSON.parse(localStorage.getItem("boo_cloud_session") || "null"); } catch { return null; }
  }

  function planningReturnUrl() {
    const url = new URL(location.href);
    url.searchParams.set("view", "session");
    url.searchParams.set("planning", "1");
    url.searchParams.delete("patientBoard");
    url.searchParams.delete("cloudBoardReady");
    url.searchParams.delete("guest");
    return `${url.pathname}${url.search}`;
  }

  async function openPlanningMenu(actions = document.querySelector("[data-meeting-board-actions]")) {
    if (!actions) return;
    const trigger = actions.querySelector("[data-treatment-planning]");
    const menu = actions.querySelector("[data-patient-menu]");
    if (!trigger || !menu) return;
    if (!menu.hidden) {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      return;
    }
    trigger.setAttribute("aria-expanded", "true");
    menu.hidden = false;
    const session = readSession();
    if (!session?.access_token || !session?.user?.id) {
      const redirect = encodeURIComponent(planningReturnUrl());
      menu.innerHTML = `<strong>שמירת לוחות למטופלים</strong><p>התחברי כדי לשמור מספר מטופלים ולפתוח את הלוחות מכל מכשיר.</p><a class="patient-menu-primary" href="/auth?mode=login&intent=patients&redirect=${redirect}">התחברות</a><button type="button" data-close-patient-menu>חזרה ללוח ללא התחברות</button>`;
      return;
    }
    menu.innerHTML = `<strong>בחירת מטופל</strong><p class="patient-menu-loading">טוענת את המטופלים…</p>`;
    const headers = { apikey: CLOUD_KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" };
    try {
      const response = await fetch(`${CLOUD_URL}/rest/v1/therapist_patients?select=id,display_name,updated_at&order=updated_at.desc`, { headers });
      if (!response.ok) throw new Error("load-failed");
      const patients = await response.json();
      menu.innerHTML = `<strong>בחירת מטופל</strong><div class="patient-menu-list">${patients.map((patient) => `<button type="button" data-select-patient="${escapeHtml(patient.id)}">${escapeHtml(patient.display_name)}</button>`).join("") || "<p>עדיין לא הוספת מטופלים.</p>"}</div><form data-add-patient-form><label for="quickPatientName">הוספת מטופל</label><div><input id="quickPatientName" name="patientName" maxlength="80" required placeholder="שם פרטי, ראשי תיבות או כינוי"><button type="submit">הוספה</button></div><small>מומלץ לא להזין שם מלא או מידע רפואי.</small></form><button type="button" data-use-guest-board>מעבר ללוח ללא מטופל</button><a href="/therapist/my-patients/">ניהול המטופלים שלי</a><p class="patient-menu-message" role="status"></p>`;
      menu.dataset.cloudHeaders = JSON.stringify(headers);
    } catch {
      menu.innerHTML = `<strong>לא הצלחנו לטעון את המטופלים</strong><p>ייתכן שצריך להתחבר מחדש.</p><a class="patient-menu-primary" href="/auth?mode=login&intent=patients&redirect=${encodeURIComponent(planningReturnUrl())}">התחברות מחדש</a><button type="button" data-close-patient-menu>חזרה ללוח</button>`;
    }
  }

  function setupVisualTimer(actions) {
    const timer = actions.querySelector(".meeting-timer");
    if (!timer) return;
    const original = [...document.querySelectorAll("button")].find((element) => {
      if (element === timer || element.closest(".meeting-board-actions")) return false;
      return element.textContent.replace(/\s+/g, " ").trim().includes("טיימר חזותי");
    });
    if (!original) return;
    original.dataset.meetingOriginalTimer = "true";
    original.style.setProperty("display", "none", "important");
  }

  function deleteMeetingItem(button) {
    const index = Number(button.dataset.deleteMeetingItem);
    if (!Number.isInteger(index) || index < 0) return;
    let items = [];
    try { items = JSON.parse(localStorage.getItem("pp_draft_plan") || "[]"); } catch {}
    if (!Array.isArray(items) || index >= items.length) return;
    items.splice(index, 1);
    localStorage.setItem("pp_draft_plan", JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("boo_draft_plan_changed", { detail: { items, source: "meeting-board-delete" } }));
    button.closest("ol.space-y-3 > li")?.remove();
    document.querySelectorAll("[data-delete-meeting-item]").forEach((element, nextIndex) => {
      element.dataset.deleteMeetingItem = String(nextIndex);
    });
    const cloudBoard = new URLSearchParams(location.search).has("patientBoard");
    if (cloudBoard) {
      reloadAfterCloudDelete = true;
      const status = document.querySelector("[data-cloud-save-state]");
      if (status) status.textContent = "שומרת את המחיקה…";
    } else {
      window.setTimeout(() => location.reload(), 50);
    }
  }

  function hideLegacySessionControls() {
    document.querySelectorAll("button,a").forEach((element) => {
      const text = element.textContent.replace(/\s+/g, " ").trim();
      if (text === "חזרה לעריכת התוכנית" || text === "חזרה לעריכת התכנית") {
        element.hidden = true;
        element.style.setProperty("display", "none", "important");
      }
    });
  }

  function addDeleteButtons() {
    const list = document.querySelector("ol.space-y-3");
    if (!list) return;
    [...list.querySelectorAll(":scope > li")].forEach((row, index) => {
      if (row.querySelector("[data-delete-meeting-item]")) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "meeting-delete-item";
      button.dataset.deleteMeetingItem = String(index);
      button.setAttribute("aria-label", "מחיקת הפעילות מלוח המפגש");
      button.title = "מחיקה מהלוח";
      button.textContent = "×";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        deleteMeetingItem(button);
      }, true);
      row.querySelector(":scope > div")?.append(button);
    });
  }

  document.addEventListener("click", (event) => {
    const toolsToggle = event.target.closest?.(".meeting-tools-toggle");
    if (toolsToggle) {
      event.preventDefault();
      const actions = toolsToggle.closest(".meeting-board-actions");
      const collapsed = actions?.classList.toggle("meeting-tools-collapsed") || false;
      toolsToggle.setAttribute("aria-expanded", String(!collapsed));
      toolsToggle.setAttribute("aria-label", collapsed ? "פתיחת כלי הלוח" : "כיווץ כלי הלוח");
      toolsToggle.title = collapsed ? "פתיחת כלי הלוח" : "כיווץ כלי הלוח";
      toolsToggle.querySelector("span").textContent = collapsed ? "⌄" : "⌃";
      return;
    }
    const planning = event.target.closest?.("[data-treatment-planning]");
    if (planning) {
      event.preventDefault();
      event.stopPropagation();
      openPlanningMenu(planning.closest(".meeting-board-actions"));
      return;
    }
    if (event.target.closest?.("[data-close-patient-menu]")) {
      event.preventDefault();
      const menu = event.target.closest("[data-patient-menu]");
      if (menu) menu.hidden = true;
      document.querySelector("[data-treatment-planning]")?.setAttribute("aria-expanded", "false");
      return;
    }
    const selectedPatient = event.target.closest?.("[data-select-patient]");
    if (selectedPatient) {
      event.preventDefault();
      const patientId = selectedPatient.dataset.selectPatient;
      const boardDate = new URLSearchParams(location.search).get("boardDate");
      const dateSuffix = /^\d{4}-\d{2}-\d{2}$/.test(boardDate || "") ? `&boardDate=${encodeURIComponent(boardDate)}` : "";
      location.assign(`/therapist/build?view=session&patientBoard=${encodeURIComponent(patientId)}${dateSuffix}`);
      return;
    }
    if (event.target.closest?.("[data-use-guest-board]")) {
      event.preventDefault();
      location.assign("/therapist/build?view=session&guest=1");
      return;
    }
    const remove = event.target.closest?.("[data-delete-meeting-item]");
    if (remove) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      deleteMeetingItem(remove);
      return;
    }
    const timer = event.target.closest?.(".meeting-timer");
    if (timer) {
      event.preventDefault();
      event.stopPropagation();
      document.querySelector("[data-meeting-original-timer]")?.click();
      return;
    }
    const photo = event.target.closest?.(".meeting-photo");
    if (photo) {
      event.preventDefault();
      event.stopPropagation();
      window.dispatchEvent(new CustomEvent("boo_open_board_photo_picker"));
      return;
    }
    const navigation = event.target.closest?.(".meeting-board-actions a[href]");
    if (navigation) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      location.assign(navigation.href);
      return;
    }
    const fullscreen = event.target.closest?.(".meeting-fullscreen");
    if (!fullscreen) return;
    const active = document.body.classList.toggle("meeting-board-fullscreen");
    const fullscreenLabel = fullscreen.querySelector("[data-fullscreen-label]");
    if (fullscreenLabel) fullscreenLabel.textContent = active ? "יציאה ממסך מלא" : "מסך מלא";
    fullscreen.setAttribute("aria-pressed", String(active));
    const board = document.querySelector("ol.meeting-board-surface");
    if (active && board?.requestFullscreen) board.requestFullscreen().catch(() => {});
    if (!active && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }, true);

  document.addEventListener("submit", async (event) => {
    const form = event.target.closest?.("[data-add-patient-form]");
    if (!form) return;
    event.preventDefault();
    event.stopPropagation();
    const input = form.elements.patientName;
    const displayName = input?.value.trim();
    const session = readSession();
    if (!displayName || !session?.access_token || !session?.user?.id) return;
    const submit = form.querySelector('button[type="submit"]');
    const message = form.closest("[data-patient-menu]")?.querySelector(".patient-menu-message");
    if (submit) submit.disabled = true;
    try {
      const response = await fetch(`${CLOUD_URL}/rest/v1/therapist_patients`, {
        method: "POST",
        headers: { apikey: CLOUD_KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify({ user_id: session.user.id, display_name: displayName })
      });
      if (!response.ok) throw new Error("create-failed");
      const patients = await response.json();
      const patientId = patients[0]?.id;
      if (!patientId) throw new Error("missing-patient");
      location.assign(`/therapist/build?view=session&patientBoard=${encodeURIComponent(patientId)}`);
    } catch {
      if (message) message.textContent = "לא הצלחנו להוסיף את המטופל כרגע.";
      if (submit) submit.disabled = false;
    }
  }, true);

  document.addEventListener("click", (event) => {
    const menu = document.querySelector("[data-patient-menu]:not([hidden])");
    if (!menu || event.target.closest?.(".meeting-planning-wrap")) return;
    menu.hidden = true;
    document.querySelector("[data-treatment-planning]")?.setAttribute("aria-expanded", "false");
  });

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) return;
    document.body.classList.remove("meeting-board-fullscreen");
    const button = document.querySelector(".meeting-fullscreen");
    if (button) {
      const label = button.querySelector("[data-fullscreen-label]");
      if (label) label.textContent = "מסך מלא";
      button.setAttribute("aria-pressed", "false");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !document.body.classList.contains("meeting-board-fullscreen")) return;
    document.body.classList.remove("meeting-board-fullscreen");
    const button = document.querySelector(".meeting-fullscreen");
    button?.setAttribute("aria-pressed", "false");
    const label = button?.querySelector("[data-fullscreen-label]");
    if (label) label.textContent = "מסך מלא";
  });

  window.addEventListener("boo_cloud_board_status", (event) => {
    const status = document.querySelector("[data-cloud-save-state]");
    if (status) status.textContent = event.detail === "saving" ? "שומרת…" : event.detail === "error" ? "השמירה נכשלה" : "נשמר בענן";
    if (event.detail === "saved" && reloadAfterCloudDelete) {
      reloadAfterCloudDelete = false;
      window.setTimeout(() => location.reload(), 50);
    }
  });

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;" })[character]);
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; addMeetingActions(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener("popstate", schedule);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addMeetingActions, { once: true });
  else addMeetingActions();
})();
