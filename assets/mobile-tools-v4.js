(() => {
  /* Safari on iPhone/iPad can open its print sheet before React has painted
     the printable calendar. A short delay prevents the resulting blank PDF. */
  const nativePrint = window.print.bind(window);
  window.print = () => window.setTimeout(nativePrint, 400);

  const homePaths = new Set(["/", "/parent", "/therapist"]);
  let handledHomePath = null;

  function updatePathEnhancements() {
    const path = location.pathname.replace(/\/$/, "") || "/";
    const isHome = homePaths.has(path);
    document.body.classList.toggle("home-return-top", isHome);

    if (isHome && handledHomePath !== path) {
      requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
      handledHomePath = path;
    }
    if (!isHome) handledHomePath = null;

    if (path === "/") arrangeHomeTools();
    if (path.endsWith("/hebrew-calendar")) addHolidayShortcut();
  }

  function directChild(container, element) {
    let node = element;
    while (node && node.parentElement !== container) node = node.parentElement;
    return node;
  }

  function arrangeHomeTools() {
    const order = [
      "/parent/daily-routine/",
      "/parent/morning-routine",
      "/parent/evening-routine",
      "/parent/weekly-board",
      "/parent/social-stories",
      "/parent/hebrew-calendar",
      "/parent/experiments",
      "/parent/recipes",
      "/parent/cipher"
    ];
    const morning = document.querySelector('a[href="/parent/morning-routine"]');
    if (!morning) return;

    if (!document.querySelector('a[href="/parent/daily-routine/"]')) {
      let wrapper = morning;
      while (wrapper.parentElement && !wrapper.parentElement.classList.contains("grid")) wrapper = wrapper.parentElement;
      const clone = wrapper.cloneNode(true);
      const link = clone.matches("a") ? clone : clone.querySelector("a");
      if (!link) return;
      link.href = "/parent/daily-routine/";
      link.querySelectorAll("img").forEach((img) => {
        img.src = "/icon-bank/navigation-v2/daily-routine-checklist.webp";
        img.alt = "מחולל לוח התארגנות יומי";
      });
      const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        walker.currentNode.nodeValue = walker.currentNode.nodeValue
          .replace("לוח התארגנות בוקר", "לוח התארגנות יומי")
          .replace("Morning Routine Board", "Daily Routine Board")
          .replace("Morning routine", "Daily routine");
      }
      wrapper.parentElement?.appendChild(clone);
    }

    const anchors = order.map((href) => document.querySelector(`a[href="${href}"]`));
    if (anchors.some((anchor) => !anchor)) return;
    let grid = anchors[0].parentElement;
    while (grid && (!grid.classList.contains("grid") || !anchors.every((anchor) => grid.contains(anchor)))) grid = grid.parentElement;
    if (!grid || grid.dataset.dailyOrderDone === "1") return;
    order.forEach((href) => {
      const anchor = document.querySelector(`a[href="${href}"]`);
      const tile = directChild(grid, anchor);
      if (tile) grid.appendChild(tile);
    });
    grid.dataset.dailyOrderDone = "1";
  }

  function addHolidayShortcut() {
    if (document.querySelector(".school-holidays-shortcut")) return;
    const printButton = [...document.querySelectorAll("button")]
      .find((button) => button.textContent.trim().includes("הדפסה"));
    if (!printButton) return;
    const link = document.createElement("a");
    link.href = "/parent/school-holidays/";
    link.className = "school-holidays-shortcut";
    link.textContent = "לוח חופשות משרד החינוך";
    printButton.parentElement?.appendChild(link);
  }

  const originalPushState = history.pushState;
  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    setTimeout(updatePathEnhancements, 0);
  };
  window.addEventListener("popstate", () => setTimeout(updatePathEnhancements, 0));
  new MutationObserver(updatePathEnhancements).observe(document.documentElement, { childList: true, subtree: true });
  updatePathEnhancements();
})();
