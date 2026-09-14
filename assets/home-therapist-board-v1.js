(() => {
  "use strict";

  if (window.location.pathname !== "/") return;

  function linkBoard() {
    const link = [...document.querySelectorAll('#root a[href="/therapist/build"]')].find(
      (candidate) => candidate.querySelector("h2")?.textContent.trim() === "מטפלים",
    );
    if (!link) return false;
    link.setAttribute("href", "/therapist/build?view=session");
    link.setAttribute("aria-label", "אזור המטפלות - בניית לוח מפגש");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.location.assign("/therapist/build?view=session");
    }, true);
    return true;
  }

  if (linkBoard()) return;
  const observer = new MutationObserver(() => {
    if (linkBoard()) observer.disconnect();
  });
  observer.observe(document.getElementById("root"), { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 10000);
})();
