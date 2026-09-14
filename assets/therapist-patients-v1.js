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
