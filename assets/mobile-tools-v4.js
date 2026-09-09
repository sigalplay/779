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
    updateSearchPreview(path);
    installTherapistMenu();
    installTherapistTopLinks(path);
    installMobileLanguageSwitch();
    installTherapistMobileShortcuts(path);
    arrangeUnifiedMenu();
    formatInfantAgeLabels();
  }

  function formatInfantAgeLabels() {
    document.querySelectorAll("span").forEach((span) => {
      const text = span.textContent.replace(/\s+/g, " ").trim();
      if (text === "גיל 0.5–1") span.textContent = "גיל 6 חודשים–שנה";
      if (text === "Ages 0.5–1") span.textContent = "Ages 6–12 months";
    });
  }

  function updateSearchPreview(path) {
    if (path !== "/") return;
    const english = document.documentElement.lang === "en";
    const title = english ? "Let's Play - Activities and Tools" : "בואו נשחק - פעילויות וכלים";
    const description = english
      ? "Activities, games and tools for home, preschool and the clinic."
      : "פעילויות, משחקים וכלים - לבית, לגן ולקליניקה.";
    if (document.title !== title) document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && meta.content !== description) meta.content = description;
  }

  function installTherapistMobileShortcuts(path) {
    if (!path.startsWith("/therapist")) return;
    const main = document.querySelector("main");
    if (!main) return;
    const language = document.documentElement.lang;
    const current = main.querySelector(".therapist-mobile-shortcuts");
    if (current?.dataset.language === language) return;
    current?.remove();
    const shortcuts = document.createElement("nav");
    shortcuts.className = "therapist-mobile-shortcuts";
    shortcuts.dataset.language = language;
    shortcuts.setAttribute("aria-label", language === "en" ? "Therapist shortcuts" : "קיצורים למטפלים");
    shortcuts.innerHTML = `
      <a href="/therapist/build?tab=search">${language === "en" ? "Search" : "מנוע חיפוש"}</a>
      <a class="shortcut-plans" href="/therapist/plans">${language === "en" ? "My saved plans" : "התכניות השמורות שלי"}</a>
      <a class="shortcut-diary" href="/therapist/diary">${language === "en" ? "Diary" : "יומן"}</a>
      <a class="shortcut-trail" href="/therapist/motor-trail">${language === "en" ? "Motor trail" : "מסלול מוטורי"}</a>`;
    main.prepend(shortcuts);
  }

  function installTherapistTopLinks(path) {
    const trigger = document.querySelector('header a[href="/therapist/build"]');
    const nav = trigger?.parentElement;
    if (!nav) return;
    const existing = [...nav.querySelectorAll(".therapist-top-link")];
    const parentLink = nav.querySelector('a[href="/parent/play"]');
    if (parentLink) parentLink.hidden = path.startsWith("/therapist");
    if (trigger) trigger.hidden = path.startsWith("/parent");
    if (!trigger || !path.startsWith("/therapist")) {
      existing.forEach((link) => link.remove());
      return;
    }
    const language = document.documentElement.lang;
    if (existing.length === 3 && existing.every((link) => link.dataset.language === language)) return;
    existing.forEach((link) => link.remove());
    const items = [
      ["/therapist/plans", language === "en" ? "My saved plans" : "התכניות השמורות שלי"],
      ["/therapist/diary", language === "en" ? "Diary" : "יומן"],
      ["/therapist/motor-trail", language === "en" ? "Motor trail" : "מסלול מוטורי"]
    ];
    let after = trigger;
    items.forEach(([href, label]) => {
      const link = trigger.cloneNode(false);
      link.href = href;
      link.textContent = label;
      link.dataset.language = language;
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
      const nextLanguage = document.documentElement.lang === "en" ? "he" : "en";
      try { localStorage.setItem("boo_nesahek_language", nextLanguage); } catch (_) {}
      document.documentElement.lang = nextLanguage;
      document.documentElement.dir = nextLanguage === "he" ? "rtl" : "ltr";
      window.dispatchEvent(new Event("boo_language_change"));
      setTimeout(() => {
        updateLabel();
        arrangeUnifiedMenu();
        updatePathEnhancements();
      }, 0);
    });
    menu.prepend(button);
  }

  function installTherapistMenu() {
    const trigger = document.querySelector('header a[href="/therapist/build"]');
    if (!trigger) return;
    const language = document.documentElement.lang;
    if (trigger.dataset.quickMenuReady !== "1") {
      trigger.dataset.quickMenuReady = "1";
      trigger.setAttribute("aria-haspopup", "menu");
      trigger.setAttribute("aria-expanded", "false");
    }

    let menu = document.querySelector(".therapist-quick-menu");
    if (!menu) {
      menu = document.createElement("nav");
      menu.className = "therapist-quick-menu";
      menu.setAttribute("aria-label", "כלים למטפלים");
      document.body.appendChild(menu);
    }
    if (menu.dataset.language !== language) {
      menu.dataset.language = language;
      menu.innerHTML = `
        <a href="/therapist/build?tab=search">${language === "en" ? "Search" : "מנוע חיפוש"}</a>
        <a href="/therapist/plans">${language === "en" ? "My saved plans" : "התכניות השמורות שלי"}</a>
        <a href="/therapist/diary">${language === "en" ? "Diary" : "יומן"}</a>
        <a href="/therapist/motor-trail">${language === "en" ? "Motor trail" : "מסלול מוטורי"}</a>`;
    }

    if (trigger.dataset.quickMenuListeners === "1") return;
    trigger.dataset.quickMenuListeners = "1";

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
      event.stopImmediatePropagation();
      const opening = menu.dataset.open !== "true";
      if (opening) position();
      menu.dataset.open = opening ? "true" : "false";
      trigger.setAttribute("aria-expanded", opening ? "true" : "false");
    }, true);
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

  function arrangeUnifiedMenu() {
    const menu = document.getElementById("site-navigation-menu");
    if (!menu) return;
    const language = document.documentElement.lang;
    const english = language === "en";
    const sections = [...menu.querySelectorAll(":scope section")];
    if (!sections.length) return;
    sections.forEach((section) => {
      const heading = section.querySelector("h2");
      if (!heading) return;
      const text = heading.textContent.trim();
      if (["כלים להורים", "כלים למטפלים", "Tools for parents", "Tools for therapists"].includes(text)) {
        section.hidden = true;
        section.classList.add("replaced-menu-section");
      }
    });
    let unified = menu.querySelector(".unified-menu-sections");
    if (unified) {
      if (unified.dataset.language === language) return;
      unified.remove();
    }
    unified = document.createElement("div");
    unified.className = "unified-menu-sections";
    unified.dataset.language = language;
    const groups = [
      [english ? "Parents" : "הורים", [
        ["/parent/play", english ? "What shall we play today?" : "במה נשחק היום?"],
        ["/parent/all", english ? "All activities" : "כל הפעילויות"]
      ]],
      [english ? "Therapists" : "מטפלים", [
        ["/therapist/build?tab=search", english ? "Build a therapy session" : "בניית מפגש טיפולי"],
        ["/therapist/diary", english ? "Therapist diary" : "יומן מטפל"],
        ["/therapist/plans", english ? "My saved plans" : "התכניות השמורות שלי"],
        ["/therapist/motor-trail", english ? "Motor trail" : "מסלול מוטורי"]
      ]],
      [english ? "More tools" : "כלים נוספים", [
        ["/parent/daily-routine/", english ? "Daily routine board" : "לוח התארגנות יומי"],
        ["/parent/morning-routine", english ? "Morning routine board" : "לוח התארגנות בוקר"],
        ["/parent/evening-routine", english ? "Evening routine board" : "לוח התארגנות ערב"],
        ["/parent/weekly-board", english ? "Weekly routine board" : "לוח התארגנות שבועי"],
        ["/parent/social-stories", english ? "Social stories" : "סיפורים חברתיים"],
        ["/parent/hebrew-calendar", english ? "Create a calendar" : "יצירת לוח שנה"],
        ["/parent/cipher", english ? "Secret-code generator" : "מחולל כתב סתרים"],
        ["/parent/recipes", english ? "Recipes" : "מתכונים"],
        ["/parent/experiments", english ? "Experiments" : "ניסויים"],
        ["/parent/board-games", english ? "Board games" : "משחקי קופסה"]
      ]]
    ];
    groups.forEach(([title, links], groupIndex) => {
      const section = document.createElement("section");
      section.className = ["menu-parents", "menu-therapists", "menu-more-tools"][groupIndex];
      const heading = document.createElement("h2");
      heading.textContent = title;
      const grid = document.createElement("div");
      grid.className = "unified-menu-links";
      links.forEach(([href, label]) => {
        const link = document.createElement("a");
        link.href = href;
        link.textContent = label;
        grid.appendChild(link);
      });
      section.append(heading, grid);
      unified.appendChild(section);
    });
    const accountSection = sections.find((section) => {
      const text = section.querySelector("h2")?.textContent.trim();
      return text === "החשבון והאתר" || text === "Account and website";
    });
    accountSection?.classList.add("menu-account-section");
    (accountSection || sections[0]).insertAdjacentElement("beforebegin", unified);
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
