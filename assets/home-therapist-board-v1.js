(() => {
  "use strict";

  const target = "/therapist/build?view=session";
  const isHome = () => location.pathname === "/" || location.pathname === "/en/" || location.pathname === "/en";
  const isTherapistEntry = (link) => {
    if (!isHome() || !link?.matches?.('a[href^="/therapist/build"]')) return false;
    const heading = link.querySelector("h2")?.textContent?.trim();
    if (heading === "מטפלים" || heading === "Therapists") return true;
    return link.closest('nav[aria-label="ניווט ראשי"], nav[aria-label="Main navigation"]') !== null
      && ["למטפלים", "Therapists"].includes(link.textContent.trim());
  };

  function updateLinks() {
    if (!isHome()) return;
    document.querySelectorAll('#root a[href^="/therapist/build"]').forEach((link) => {
      if (isTherapistEntry(link)) link.setAttribute("href", target);
    });
  }

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest?.('a[href^="/therapist/build"]');
    if (!isTherapistEntry(link) || (link.target && link.target !== "_self")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(target);
  }, true);

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; updateLinks(); });
  }

  const root = document.getElementById("root") || document.documentElement;
  new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  addEventListener("popstate", schedule);
  addEventListener("pageshow", schedule);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
})();
