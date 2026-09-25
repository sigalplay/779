(() => {
  "use strict";

  const params = new URLSearchParams(location.search);
  if (location.pathname.replace(/\/$/, "") !== "/therapist/build" || params.get("boardMode") !== "1") return;

  function replaceButtonText(button, pattern, replacement) {
    const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) node.nodeValue = node.nodeValue.replace(pattern, replacement);
  }

  function adaptSearch() {
    document.querySelectorAll("button").forEach((button) => {
      const text = button.textContent.replace(/\s+/g, " ").trim();
      if (text === "התחל מפגש" || text === "התחל טיפול") {
        button.dataset.returnToMeetingBoard = "true";
        replaceButtonText(button, /התחל מפגש|התחל טיפול/g, "הוסף למפגש");
      } else if (text === "הוסף לתכנית" || text === "הוסף לתכנית הטיפול") {
        button.dataset.scrollToTreatmentPlan = "true";
        button.closest("div.flex.flex-col.overflow-hidden.rounded-3xl")?.classList.add("meeting-search-activity-card");
        replaceButtonText(button, /הוסף לתכנית(?: הטיפול)?/g, "הוסף למפגש");
      }
    });
    document.querySelectorAll("button img.h-7.w-7").forEach((image) => {
      image.closest("button")?.classList.add("meeting-development-chip");
    });
  }

  function scrollToTreatmentPlan() {
    if (!window.matchMedia("(max-width: 760px)").matches) return;
    const heading = [...document.querySelectorAll("h2")].find((element) => {
      const text = element.textContent.replace(/\s+/g, " ").trim();
      return text === "תכנית הטיפול" || text === "תוכנית הטיפול";
    });
    const panel = heading?.closest("aside") || heading;
    if (!panel) return;
    panel.style.scrollMarginTop = "76px";
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.addEventListener("click", (event) => {
    const addButton = event.target.closest?.("button[data-scroll-to-treatment-plan=true]");
    if (addButton) {
      window.setTimeout(scrollToTreatmentPlan, 120);
      return;
    }
    const button = event.target.closest?.("button[data-return-to-meeting-board=true]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const patientId = params.get("patientBoard");
    const boardDate = params.get("boardDate");
    const hasBoardDate = /^\d{4}-\d{2}-\d{2}$/.test(boardDate || "");
    if (!patientId && hasBoardDate) {
      let boards = {};
      try { boards = JSON.parse(localStorage.getItem("boo_guest_boards_by_date") || "{}"); } catch {}
      boards[boardDate] = localStorage.getItem("pp_draft_plan") || "[]";
      localStorage.setItem("boo_guest_boards_by_date", JSON.stringify(boards));
    }
    const dateSuffix = hasBoardDate ? `&boardDate=${encodeURIComponent(boardDate)}` : "";
    const suffix = patientId
      ? `&patientBoard=${encodeURIComponent(patientId)}${dateSuffix}&cloudBoardReady=1`
      : `${dateSuffix}&guest=1`;
    location.assign(`/therapist/build?view=session${suffix}`);
  }, true);

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; adaptSearch(); });
  };
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", adaptSearch, { once: true });
  else adaptSearch();
})();
