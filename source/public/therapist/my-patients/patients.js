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
  // Same project as src/lib/cloud-auth.js.
  const URL = "https://xoyaymlmnsmhuaxnkdqh.supabase.co";
  const KEY = "sb_publishable_FjXUtCvY96sSzeTs_0LFOQ_bxp2_mKb";
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

  // Groups ("מסגרות") sort the clients by where the therapist sees them. Only a type and a color are
  // kept, never the name of a kindergarten or a school, so the list does not tell where a child is.
  // They live on the therapist's account: { list: [{ id, type, color }], of: { patientId: groupId } }.
  const GROUP_TYPES = [
    { id: "clinic", label: "קליניקה", icon: "🏠" },
    { id: "kindergarten", label: "גן", icon: "🏫" },
    { id: "school", label: "בית ספר", short: "בי״ס", icon: "🎒" },
    { id: "center", label: "מכון", icon: "🩺" }
  ];
  const GROUP_COLORS = ["#7fc4a0", "#8fb8e8", "#f2a65a", "#c9a3e0", "#f0d36b", "#ef9aa8", "#8fd3d0", "#c8b39a"];
  const CHOSEN_GROUP = "boo_patients_group";
  const chips = document.querySelector("#groupChips");
  const search = document.querySelector("#patientSearch");
  const dialog = document.querySelector("#groupDialog");
  const groupForm = document.querySelector("#groupForm");
  const formButton = form.querySelector("button");
  let patients = [];
  let groups = readGroups(session.user?.user_metadata?.patient_groups);
  let chosen = "all";
  try { chosen = localStorage.getItem(CHOSEN_GROUP) || "all"; } catch {}
  let draft = { type: "clinic", color: GROUP_COLORS[0] };

  function readGroups(value) {
    return { list: Array.isArray(value?.list) ? value.list.filter((group) => group?.id) : [], of: value?.of && typeof value.of === "object" ? { ...value.of } : {} };
  }

  function typeOf(group) {
    return GROUP_TYPES.find((type) => type.id === group.type) || GROUP_TYPES[0];
  }

  // "גן" when there is one kindergarten, "גן 1" and "גן 2" when there are two.
  function groupName(group, list = groups.list) {
    const type = typeOf(group);
    const same = list.filter((item) => typeOf(item).id === type.id);
    return same.length > 1 ? `${type.short || type.label} ${same.indexOf(group) + 1}` : type.label;
  }

  function groupOf(patientId) {
    return groups.list.find((group) => group.id === groups.of[patientId]) || null;
  }

  async function saveGroups(next) {
    const previous = groups;
    groups = next;
    render();
    try {
      const response = await fetch(`${URL}/auth/v1/user`, { method: "PUT", headers, body: JSON.stringify({ data: { patient_groups: next } }) });
      if (!response.ok) throw new Error("save-failed");
      const user = await response.json();
      session = { ...session, user };
      try { localStorage.setItem("boo_cloud_session", JSON.stringify(session)); } catch {}
    } catch {
      groups = previous;
      render();
      setMessage("לא הצלחנו לשמור את המסגרות. נסי להתחבר מחדש.");
    }
  }

  function choose(id) {
    chosen = id;
    try { localStorage.setItem(CHOSEN_GROUP, id); } catch {}
    render();
  }

  function renderChips() {
    if (chosen !== "all" && !groups.list.some((group) => group.id === chosen)) chosen = "all";
    const count = (id) => patients.filter((patient) => groups.of[patient.id] === id).length;
    chips.innerHTML = [
      `<button type="button" data-group="all" aria-pressed="${chosen === "all"}">הכל <small>${patients.length}</small></button>`,
      ...groups.list.map((group) => `<button type="button" data-group="${escapeHtml(group.id)}" aria-pressed="${chosen === group.id}"><span class="group-dot" style="background:${escapeHtml(group.color)}"></span><span aria-hidden="true">${typeOf(group).icon}</span> ${escapeHtml(groupName(group))} <small>${count(group.id)}</small></button>`),
      '<button type="button" class="group-add" data-new-group>＋ מסגרת</button>',
      chosen !== "all" ? '<button type="button" class="group-remove" data-remove-group>מחיקת המסגרת</button>' : ""
    ].join("");
    const group = groups.list.find((item) => item.id === chosen);
    formButton.textContent = group ? `הוספה ל${groupName(group)}` : "הוספת מטופל";
  }

  function patientCard(patient) {
    const group = groupOf(patient.id);
    const options = [`<option value="">בלי מסגרת</option>`, ...groups.list.map((item) => `<option value="${escapeHtml(item.id)}"${item.id === group?.id ? " selected" : ""}>${typeOf(item).icon} ${escapeHtml(groupName(item))}</option>`)].join("");
    const place = groups.list.length
      ? `<label class="patient-group">${group ? `<span class="group-dot" style="background:${escapeHtml(group.color)}"></span>` : ""}<span class="sr-only">מסגרת של ${escapeHtml(patient.display_name)}</span><select data-patient-group="${escapeHtml(patient.id)}">${options}</select></label>`
      : "<small>לוח המפגש להיום</small>";
    return `<article class="patient-card"${group ? ` style="--group-color:${escapeHtml(group.color)}"` : ""}><div class="patient-card-copy"><strong>${escapeHtml(patient.display_name)}</strong>${place}</div><div class="patient-card-actions"><a href="/therapist/build?view=session&patientBoard=${encodeURIComponent(patient.id)}">פתיחת הלוח</a><button type="button" class="patient-delete" data-delete-patient="${encodeURIComponent(patient.id)}" data-patient-name="${escapeHtml(patient.display_name)}" aria-label="מחיקת ${escapeHtml(patient.display_name)}">מחיקה</button></div></article>`;
  }

  function render() {
    renderChips();
    search.hidden = patients.length < 7;
    const query = search.hidden ? "" : search.value.trim().toLocaleLowerCase("he");
    const shown = patients.filter((patient) => (chosen === "all" || groups.of[patient.id] === chosen) && (!query || String(patient.display_name).toLocaleLowerCase("he").includes(query)));
    const empty = !patients.length
      ? "עדיין לא הוספת מטופלים. אפשר להתחיל בשם פרטי, ראשי תיבות או כינוי."
      : query ? "לא נמצא מטופל בשם הזה." : "אין עדיין מטופלים במסגרת הזאת. אפשר להוסיף מהטופס למעלה.";
    list.innerHTML = shown.length ? shown.map(patientCard).join("") : `<p class="patients-empty">${empty}</p>`;
  }

  function renderDialog() {
    document.querySelector("#groupTypes").innerHTML = GROUP_TYPES.map((type) => `<button type="button" data-type="${type.id}" aria-pressed="${draft.type === type.id}"><span aria-hidden="true">${type.icon}</span>${type.label}</button>`).join("");
    document.querySelector("#groupColors").innerHTML = GROUP_COLORS.map((color, index) => `<button type="button" data-color="${color}" aria-pressed="${draft.color === color}" aria-label="צבע ${index + 1}" style="background:${color}"></button>`).join("");
    const preview = { id: "new", ...draft };
    document.querySelector("#groupPreview").innerHTML = `<span class="group-dot" style="background:${draft.color}"></span><span aria-hidden="true">${typeOf(preview).icon}</span> ${escapeHtml(groupName(preview, [...groups.list, preview]))}`;
  }

  chips.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.hasAttribute("data-new-group")) {
      const used = new Set(groups.list.map((group) => group.color));
      draft = { type: "clinic", color: GROUP_COLORS.find((color) => !used.has(color)) || GROUP_COLORS[0] };
      renderDialog();
      dialog.showModal();
      return;
    }
    if (button.hasAttribute("data-remove-group")) {
      const group = groups.list.find((item) => item.id === chosen);
      if (!group) return;
      const name = groupName(group);
      if (!window.confirm(`למחוק את המסגרת "${name}"?\n\nהמטופלים לא יימחקו, הם רק יעברו ל"בלי מסגרת".`)) return;
      const of = Object.fromEntries(Object.entries(groups.of).filter(([, id]) => id !== group.id));
      chosen = "all";
      try { localStorage.setItem(CHOSEN_GROUP, "all"); } catch {}
      saveGroups({ list: groups.list.filter((item) => item.id !== group.id), of });
      return;
    }
    choose(button.dataset.group || "all");
  });

  groupForm.addEventListener("click", (event) => {
    const type = event.target.closest("[data-type]");
    const color = event.target.closest("[data-color]");
    if (type) draft.type = type.dataset.type;
    if (color) draft.color = color.dataset.color;
    if (type || color) renderDialog();
  });

  dialog.addEventListener("close", () => {
    if (dialog.returnValue !== "create") return;
    const group = { id: `g-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, ...draft };
    chosen = group.id;
    try { localStorage.setItem(CHOSEN_GROUP, group.id); } catch {}
    saveGroups({ ...groups, list: [...groups.list, group] });
  });

  list.addEventListener("change", (event) => {
    const select = event.target.closest("[data-patient-group]");
    if (!select) return;
    const of = { ...groups.of };
    if (select.value) of[select.dataset.patientGroup] = select.value;
    else delete of[select.dataset.patientGroup];
    saveGroups({ ...groups, of });
  });

  search.addEventListener("input", render);

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
      patients = await response.json();
      render();
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
      if (groups.of[patientId]) {
        const of = { ...groups.of };
        delete of[patientId];
        saveGroups({ ...groups, of });
      }
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
    formButton.disabled = true;
    try {
      const response = await fetch(`${URL}/rest/v1/therapist_patients`, { method: "POST", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify({ user_id: session.user.id, display_name: displayName }) });
      if (!response.ok) throw new Error("create-failed");
      const [created] = await response.json();
      input.value = "";
      if (created?.id && groups.list.some((group) => group.id === chosen)) saveGroups({ ...groups, of: { ...groups.of, [created.id]: chosen } });
      await loadPatients();
    } catch { setMessage("לא הצלחנו להוסיף את המטופל כרגע."); }
    finally { formButton.disabled = false; }
  });

  loadPatients();
})();
