(() => {
  "use strict";
  const path = location.pathname.replace(/\/$/, "");
  if (path !== "/therapist/build") return;

  const params = new URLSearchParams(location.search);
  const patientId = params.get("patientBoard");
  const guestMode = params.get("guest") === "1";
  const DRAFT = "pp_draft_plan";
  const ACTIVE = "boo_active_cloud_patient";
  const GUEST_BACKUP = "boo_guest_board_backup";
  const GUEST_BOARDS = "boo_guest_boards_by_date";
  const DRAWING_PREFIX = "boo_board_drawing_patient";
  const URL = "https://qcklptudfclzvddjarkw.supabase.co";
  const KEY = "sb_publishable_8Bp_l_qcOxT2A67Sw2T35A_aVCvWh8H";
  let session = null;
  try { session = JSON.parse(localStorage.getItem("boo_cloud_session") || "null"); } catch {}

  const originalSet = Storage.prototype.setItem;
  const originalRemove = Storage.prototype.removeItem;
  const setLocal = (key, value) => originalSet.call(localStorage, key, value);
  const removeLocal = (key) => originalRemove.call(localStorage, key);

  const localToday = (() => {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  })();
  const requestedDate = params.get("boardDate");
  const boardDate = /^\d{4}-\d{2}-\d{2}$/.test(requestedDate || "") ? requestedDate : localToday;

  function loadGuestBoard() {
    const backup = localStorage.getItem(GUEST_BACKUP);
    let boards = {};
    try { boards = JSON.parse(localStorage.getItem(GUEST_BOARDS) || "{}"); } catch {}
    const saved = boards?.[boardDate];
    if (typeof saved === "string") setLocal(DRAFT, saved);
    else if (Array.isArray(saved)) setLocal(DRAFT, JSON.stringify(saved));
    else if (backup !== null && !params.has("boardDate")) setLocal(DRAFT, backup);
    if (!Object.prototype.hasOwnProperty.call(boards, boardDate)) {
      boards[boardDate] = localStorage.getItem(DRAFT) || "[]";
      setLocal(GUEST_BOARDS, JSON.stringify(boards));
    }
  }

  if (guestMode) {
    loadGuestBoard();
    removeLocal(ACTIVE);
    return;
  }

  if (!patientId && params.get("view") === "session") {
    loadGuestBoard();
    removeLocal(ACTIVE);
    return;
  }

  if (!patientId || !session?.access_token || !session?.user?.id) return;

  const headers = {
    apikey: KEY,
    Authorization: `Bearer ${session.access_token}`,
    "Content-Type": "application/json"
  };
  let saveTimer = 0;
  let ready = params.get("cloudBoardReady") === "1";

  async function save(items) {
    if (!ready) return;
    try {
      const response = await fetch(`${URL}/rest/v1/daily_meeting_boards?on_conflict=user_id,patient_id,board_date`, {
        method: "POST",
        keepalive: true,
        headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ user_id: session.user.id, patient_id: patientId, board_date: boardDate, items, updated_at: new Date().toISOString() })
      });
      if (!response.ok) throw new Error("cloud-save-failed");
      dispatchEvent(new CustomEvent("boo_cloud_board_status", { detail: "saved" }));
    } catch {
      dispatchEvent(new CustomEvent("boo_cloud_board_status", { detail: "error" }));
    }
  }

  async function saveDrawing(drawingData) {
    if (!ready) return false;
    try {
      let items = [];
      try { items = JSON.parse(localStorage.getItem(DRAFT) || "[]"); } catch {}
      const response = await fetch(`${URL}/rest/v1/daily_meeting_boards?on_conflict=user_id,patient_id,board_date`, {
        method: "POST",
        keepalive: true,
        headers: { ...headers, Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ user_id: session.user.id, patient_id: patientId, board_date: boardDate, items: Array.isArray(items) ? items : [], drawing_data: Array.isArray(drawingData) ? drawingData : [], updated_at: new Date().toISOString() })
      });
      if (!response.ok) throw new Error("drawing-save-failed");
      dispatchEvent(new CustomEvent("boo_cloud_drawing_status", { detail: "saved" }));
      return true;
    } catch {
      dispatchEvent(new CustomEvent("boo_cloud_drawing_status", { detail: "error" }));
      return false;
    }
  }

  window.booSaveBoardDrawing = saveDrawing;

  Storage.prototype.setItem = function (key, value) {
    originalSet.call(this, key, value);
    if (this !== localStorage || key !== DRAFT || !ready) return;
    let items = [];
    try { items = JSON.parse(value); } catch {}
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => save(Array.isArray(items) ? items : []), 100);
    dispatchEvent(new CustomEvent("boo_cloud_board_status", { detail: "saving" }));
  };

  async function preload() {
    if (ready) return;
    const active = localStorage.getItem(ACTIVE);
    if (!active) setLocal(GUEST_BACKUP, localStorage.getItem(DRAFT) || "[]");
    try {
      const patientResponse = await fetch(`${URL}/rest/v1/therapist_patients?id=eq.${encodeURIComponent(patientId)}&select=id,display_name`, { headers });
      const patients = await patientResponse.json();
      if (!patientResponse.ok || !patients[0]) throw new Error("patient-not-found");
      const boardResponse = await fetch(`${URL}/rest/v1/daily_meeting_boards?patient_id=eq.${encodeURIComponent(patientId)}&board_date=eq.${boardDate}&select=items,drawing_data`, { headers });
      const boards = await boardResponse.json();
      if (!boardResponse.ok) throw new Error("board-load-failed");
      setLocal(DRAFT, JSON.stringify(Array.isArray(boards[0]?.items) ? boards[0].items : []));
      setLocal(`${DRAWING_PREFIX}_${patientId}_${boardDate}`, JSON.stringify(Array.isArray(boards[0]?.drawing_data) ? boards[0].drawing_data : []));
      setLocal(ACTIVE, JSON.stringify({ id: patientId, name: patients[0].display_name }));
      params.set("cloudBoardReady", "1");
      location.replace(`${location.pathname}?${params.toString()}`);
    } catch {
      dispatchEvent(new CustomEvent("boo_cloud_board_status", { detail: "error" }));
    }
  }

  preload();
})();
