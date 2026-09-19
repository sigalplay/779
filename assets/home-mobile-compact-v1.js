(() => {
  "use strict";

  const toolPaths = new Set([
    "/parent/social-stories",
    "/parent/routine-boards",
    "/parent/daily-sequences",
    "/parent/daily-routine",
    "/parent/weekly-board",
    "/parent/morning-routine",
    "/parent/evening-routine",
    "/parent/hebrew-calendar",
    "/parent/cipher",
    "/parent/recipes",
    "/parent/experiments",
    "/parent/card-games-generator"
  ]);

  function pathOf(link) {
    try {
      return new URL(link.href, location.origin).pathname.replace(/\/$/, "").replace(/^\/en(?=\/)/, "");
    } catch {
      return "";
    }
  }

  function adaptHomeCards() {
    const homePath = location.pathname.replace(/\/$/, "") || "/";
    const isHome = homePath === "/" || homePath === "/en";
    document.body.classList.toggle("home-mobile-compact", isHome);
    if (!isHome) return;

    const seenTools = new Set();
    document.querySelectorAll("#root main a[href]").forEach((link) => {
      const path = pathOf(link);
      const isToolCard = toolPaths.has(path) && !seenTools.has(path);
      if (isToolCard) seenTools.add(path);
      link.classList.toggle("home-primary-card", path === "/therapist/build" || path === "/parent/play");
      link.classList.toggle("home-tool-card", isToolCard);
    });
    const toolCards = [...document.querySelectorAll("#root main .home-tool-card")];
    if (toolCards.length) toolCards[0].parentElement?.classList.add("home-tools-grid");
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      adaptHomeCards();
    });
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener("popstate", schedule);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
})();
