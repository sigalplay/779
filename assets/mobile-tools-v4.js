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
    installTherapistMenu();
    installTherapistTopLinks();
    installMobileLanguageSwitch();
    installTherapistMobileShortcuts(path);
  }

  function installTherapistMobileShortcuts(path) {
    if (!path.startsWith("/therapist")) return;
    const main = document.querySelector("main");
    if (!main || main.querySelector(".therapist-mobile-shortcuts")) return;
    const language = document.documentElement.lang;
    const shortcuts = document.createElement("nav");
    shortcuts.className = "therapist-mobile-shortcuts";
    shortcuts.setAttribute("aria-label", language === "en" ? "Therapist shortcuts" : "קיצורים למטפלים");
    shortcuts.innerHTML = `
      <a href="/therapist/build?tab=search">${language === "en" ? "Search" : "מנוע חיפוש"}</a>
      <a href="/therapist/plans">${language === "en" ? "My saved plans" : "התכניות השמורות שלי"}</a>
      <a href="/therapist/diary">${language === "en" ? "Diary" : "יומן"}</a>`;
    main.prepend(shortcuts);
  }

  function installTherapistTopLinks() {
    const trigger = document.querySelector('header a[href="/therapist/build"]');
    const nav = trigger?.parentElement;
    if (!trigger || !nav || nav.querySelector(".therapist-top-link")) return;
    const language = document.documentElement.lang;
    const items = [
      ["/therapist/plans", language === "en" ? "My saved plans" : "התכניות השמורות שלי"],
      ["/therapist/diary", language === "en" ? "Diary" : "יומן"]
    ];
    let after = trigger;
    items.forEach(([href, label]) => {
      const link = trigger.cloneNode(false);
      link.href = href;
      link.textContent = label;
      link.className = "therapist-top-link whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition text-muted-foreground hover:bg-muted hover:text-foreground";
      if (location.pathname === href) {
        link.classList.remove("text-muted-foreground", "hover:bg-muted", "hover:text-foreground");
        link.classList.add("bg-primary", "text-primary-foreground");
      }
      link.removeAttribute("aria-haspopup");
      link.removeAttribute("aria-expanded");
      delete link.dataset.quickMenuReady;
      after.insertAdjacentElement("afterend", link);
      after = link;
    });
  }

  function installMobileLanguageSwitch() {
    const menu = document.getElementById("site-navigation-menu");
    if (!menu || menu.querySelector(".mobile-language-switch")) return;
    const header = menu.closest("header");
    if (header) menu.style.setProperty("--mobile-menu-top", `${header.getBoundingClientRect().bottom}px`);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "mobile-language-switch";
    const updateLabel = () => {
      button.textContent = document.documentElement.lang === "en" ? "עברית" : "English";
      button.setAttribute("aria-label", document.documentElement.lang === "en" ? "מעבר לעברית" : "Switch to English");
    };
    updateLabel();
    button.addEventListener("click", () => {
      const original = [...menu.querySelectorAll("button")].find((candidate) =>
        candidate !== button && ["English", "עברית"].includes(candidate.textContent.trim())
      );
      original?.click();
      setTimeout(updateLabel, 0);
    });
    menu.prepend(button);
  }

  function installTherapistMenu() {
    const trigger = document.querySelector('header a[href="/therapist/build"]');
    if (!trigger || trigger.dataset.quickMenuReady === "1") return;
    trigger.dataset.quickMenuReady = "1";
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");

    let menu = document.querySelector(".therapist-quick-menu");
    if (!menu) {
      menu = document.createElement("nav");
      menu.className = "therapist-quick-menu";
      menu.setAttribute("aria-label", "כלים למטפלים");
      menu.innerHTML = `
        <a href="/therapist/build?tab=search">מנוע חיפוש</a>
        <a href="/therapist/plans">התכניות השמורות שלי</a>
        <a href="/therapist/diary">יומן</a>`;
      document.body.appendChild(menu);
    }

    const close = () => {
      menu.dataset.open = "false";
      trigger.setAttribute("aria-expanded", "false");
    };
    const position = () => {
      const rect = trigger.getBoundingClientRect();
      const width = 230;
      menu.style.top = `${rect.bottom + 8}px`;
      menu.style.left = `${Math.max(10, Math.min(innerWidth - width - 10, rect.left + rect.width - width))}px`;
    };
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const opening = menu.dataset.open !== "true";
      if (opening) position();
      menu.dataset.open = opening ? "true" : "false";
      trigger.setAttribute("aria-expanded", opening ? "true" : "false");
    });
    menu.addEventListener("click", close);
    document.addEventListener("click", (event) => {
      if (!trigger.contains(event.target) && !menu.contains(event.target)) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
    window.addEventListener("resize", () => menu.dataset.open === "true" && position());
    window.addEventListener("scroll", () => menu.dataset.open === "true" && position(), { passive: true });
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
