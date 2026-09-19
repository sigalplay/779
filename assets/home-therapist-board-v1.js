(() => {
  "use strict";

  function linkBoard() {
    if (window.location.pathname !== "/") return false;
    const link = [...document.querySelectorAll('#root a[href^="/therapist/build"]')].find(
      (candidate) => candidate.querySelector("h2")?.textContent.trim() === "מטפלים",
    );
    if (!link) return false;

    link.href = "/therapist/build?view=session";
    link.setAttribute("aria-label", "אזור המטפלות - בניית לוח מפגש");
    if (link.dataset.sessionBoardLinked === "true") return true;
    link.dataset.sessionBoardLinked = "true";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.location.assign("/therapist/build?view=session");
    }, true);
    return true;
  }

  let queued = false;
  const nextFrame = window.requestAnimationFrame?.bind(window) || ((callback) => window.setTimeout(callback, 0));
  function schedule() {
    if (queued) return;
    queued = true;
    nextFrame(() => {
      queued = false;
      linkBoard();
    });
  }

  const root = document.getElementById("root") || document.documentElement;
  new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  addEventListener("popstate", schedule);
  addEventListener("pageshow", schedule);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
})();
