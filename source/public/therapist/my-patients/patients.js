/* patients-site-header-v1.js */
(() => {
  "use strict";

  function sessionExists() {
    try {
      const value = JSON.parse(localStorage.getItem("boo_cloud_session") || "null");
      return Boolean(value && (value.access_token || value.user));
    } catch {
      return false;
    }
  }

  function updateAccountLinks() {
    const signedIn = sessionExists();
    document.querySelectorAll("[data-patients-account]").forEach((link) => {
      link.textContent = signedIn ? "החשבון שלי" : "כניסה";
      link.href = signedIn ? "/profile" : `/auth?mode=login&redirect=${encodeURIComponent(location.pathname)}`;
    });
  }

  function init() {
    const button = document.querySelector(".standard-site-header__menu-button");
    const menu = document.getElementById("patientsSiteMenu");
    if (button && menu) {
      button.addEventListener("click", () => {
        const open = menu.hidden;
        menu.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
      });
      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || menu.hidden) return;
        menu.hidden = true;
        button.setAttribute("aria-expanded", "false");
        button.focus();
      });
    }
    updateAccountLinks();
    addEventListener("pp_auth_change", updateAccountLinks);
    const workflowNav = document.createElement("nav");
    workflowNav.className = "therapist-mobile-workflow-nav";
    workflowNav.setAttribute("aria-label", "ניווט מהיר באזור המטפלות");
    workflowNav.innerHTML = `<div class="therapist-mobile-workflow-nav__inner"><a href="/therapist/build?tab=search&boardMode=1"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg><strong>מנוע חיפוש</strong></a><a href="/therapist/build?view=session"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="3"></rect><path d="M8 8h8M8 12h8M8 16h5"></path></svg><strong>לוח המפגש</strong></a><a aria-current="page" href="/therapist/my-patients/"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.5"></circle><path d="M3.5 20c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M14 15c3.7-.7 5.8 1 6.5 4"></path></svg><strong>המטופלים שלי</strong></a><a href="/therapist/diary"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M7 3v4M17 3v4M3 10h18M8 14h3M13 14h3M8 17h3"></path></svg><strong>יומן</strong></a><button type="button" data-workflow-menu><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"></path></svg><strong>תפריט</strong></button></div>`;
    workflowNav.querySelector("[data-workflow-menu]")?.addEventListener("click", () => {
      document.querySelector(".standard-site-header__menu-button")?.click();
    });
    document.body.append(workflowNav);
    document.body.classList.add("therapist-area-mobile-nav-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();

/* therapist-patients-v1.js */
(() => {
  "use strict";
  const URL = "https://qcklptudfclzvddjarkw.supabase.co";
  const KEY = "sb_publishable_8Bp_l_qcOxT2A67Sw2T35A_aVCvWh8H";
  const signedOut = document.querySelector("#signedOut");
  const signedIn = document.querySelector("#signedIn");
  const list = document.querySelector("#patientsList");
  const form = document.querySelector("#patientForm");
  const input = document.querySelector("#patientName");
  const message = document.querySelector("#patientMessage");
  const ACTIVE_PATIENT = "boo_active_cloud_patient";
  const DRAFT = "pp_draft_plan";
  const DRAWING_PREFIX = "boo_board_drawing_patient";
  let session = null;
  try { session = JSON.parse(localStorage.getItem("boo_cloud_session") || "null"); } catch {}

  if (!session?.access_token || !session?.user?.id) {
    signedOut.hidden = false;
    return;
  }
  signedIn.hidden = false;
  const headers = { apikey: KEY, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '\"': "&quot;" })[character]);
  }

  function setMessage(text, state = "error") {
    message.textContent = text;
    message.dataset.state = text ? state : "";
  }

  function clearDeletedPatientFromDevice(patientId) {
    let activePatient = null;
    try { activePatient = JSON.parse(localStorage.getItem(ACTIVE_PATIENT) || "null"); } catch {}
    if (activePatient?.id === patientId) {
      localStorage.removeItem(ACTIVE_PATIENT);
      localStorage.removeItem(DRAFT);
    }
    const drawingStart = `${DRAWING_PREFIX}_${patientId}_`;
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(drawingStart)) localStorage.removeItem(key);
    }
  }

  async function loadPatients() {
    setMessage("");
    list.innerHTML = '<p class="patients-empty">טוענת את הלוחות…</p>';
    try {
      const response = await fetch(`${URL}/rest/v1/therapist_patients?select=id,display_name,updated_at&order=updated_at.desc`, { headers });
      if (!response.ok) throw new Error("load-failed");
      const patients = await response.json();
      list.innerHTML = patients.length ? patients.map((patient) => `<article class="patient-card"><div class="patient-card-copy"><strong>${escapeHtml(patient.display_name)}</strong><small>לוח המפגש להיום</small></div><div class="patient-card-actions"><a href="/therapist/build?view=session&patientBoard=${encodeURIComponent(patient.id)}">פתיחת הלוח</a><button type="button" class="patient-delete" data-delete-patient="${encodeURIComponent(patient.id)}" data-patient-name="${escapeHtml(patient.display_name)}" aria-label="מחיקת ${escapeHtml(patient.display_name)}">מחיקה</button></div></article>`).join("") : '<p class="patients-empty">עדיין לא הוספת מטופלים. אפשר להתחיל בשם פרטי, ראשי תיבות או כינוי.</p>';
    } catch {
      list.innerHTML = "";
      setMessage("לא הצלחנו לטעון את המטופלים. נסי להתחבר מחדש.");
    }
  }

  list.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-delete-patient]");
    if (!button || button.disabled) return;
    const patientId = decodeURIComponent(button.dataset.deletePatient || "");
    const patientName = button.dataset.patientName || "המטופל";
    if (!patientId) return;
    const approved = window.confirm(`למחוק את ${patientName}?\n\nהמחיקה תסיר גם את לוח המפגש השמור ולא ניתן יהיה לבטל אותה.`);
    if (!approved) return;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = "מוחקת…";
    setMessage("");
    try {
      const response = await fetch(`${URL}/rest/v1/therapist_patients?id=eq.${encodeURIComponent(patientId)}&user_id=eq.${encodeURIComponent(session.user.id)}`, {
        method: "DELETE",
        headers: { ...headers, Prefer: "return=representation" }
      });
      if (!response.ok) throw new Error("delete-failed");
      const deleted = await response.json();
      if (!Array.isArray(deleted) || !deleted.some((patient) => patient.id === patientId)) throw new Error("delete-not-authorized");
      clearDeletedPatientFromDevice(patientId);
      await loadPatients();
      setMessage(`${patientName} נמחק/ה בהצלחה יחד עם לוח המפגש.`, "success");
    } catch {
      button.disabled = false;
      button.textContent = originalText;
      setMessage("לא הצלחנו למחוק את המטופל כרגע. נסי להתחבר מחדש.");
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const displayName = input.value.trim();
    if (!displayName) return;
    form.querySelector("button").disabled = true;
    try {
      const response = await fetch(`${URL}/rest/v1/therapist_patients`, { method: "POST", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify({ user_id: session.user.id, display_name: displayName }) });
      if (!response.ok) throw new Error("create-failed");
      input.value = "";
      await loadPatients();
    } catch { setMessage("לא הצלחנו להוסיף את המטופל כרגע."); }
    finally { form.querySelector("button").disabled = false; }
  });

  loadPatients();
})();
