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

    if (path === "/") addDailyRoutineShortcut();
    if (path.endsWith("/hebrew-calendar")) addHolidayShortcut();
  }

  function addDailyRoutineShortcut() {
    if (document.querySelector(".daily-routine-shortcut")) return;
    const weekly = document.querySelector('a[href="/parent/weekly-board"]');
    if (!weekly) return;
    const link = document.createElement("a");
    link.href = "/parent/daily-routine/";
    link.className = "daily-routine-shortcut";
    link.textContent = "✓ מחולל לוח התארגנות יומי";
    weekly.parentElement?.parentElement?.insertAdjacentElement("beforebegin", link);
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
