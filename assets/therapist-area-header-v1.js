(() => {
  "use strict";

  function isEnglish() {
    try { return sessionStorage.getItem("boo_english_preview") === "1" && localStorage.getItem("boo_nesahek_language") === "en"; }
    catch { return document.documentElement.lang === "en"; }
  }

  const text = (hebrew, english) => isEnglish() ? english : hebrew;

  function isTherapistArea() {
    if (location.pathname.startsWith("/therapist/")) return true;
    if (!location.pathname.startsWith("/activity/") && !location.pathname.startsWith("/board-game/")) return false;
    const params = new URLSearchParams(location.search);
    return params.get("mode") === "therapist" || (params.get("returnPath") || "").startsWith("/therapist/");
  }

  function normalize(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function adaptHeading() {
    if (location.pathname.replace(/\/$/, "") !== "/therapist/build") return;
    document.querySelectorAll("h1,h2").forEach((heading) => {
      const current = normalize(heading.textContent);
      const desired = text("לוח המפגש", "Session board");
      if (["בנה לוח מובנה למפגש", "לוח המפגש", "Session board"].includes(current) && current !== desired) heading.textContent = desired;
    });
  }

  function markTherapistSearchPage() {
    const isBuildPage = location.pathname.replace(/\/$/, "") === "/therapist/build";
    const isMeetingBoard = new URLSearchParams(location.search).get("view") === "session";
    document.body.classList.toggle("therapist-build-search-page", isBuildPage && !isMeetingBoard);
  }

  function addMobileWorkflowNav() {
    let navigation = document.querySelector(".therapist-mobile-workflow-nav");
    if (!navigation) {
      navigation = document.createElement("nav");
      navigation.className = "therapist-mobile-workflow-nav";
      navigation.setAttribute("aria-label", text("ניווט מהיר באזור המטפלות", "Quick therapist navigation"));
      navigation.innerHTML = `<div class="therapist-mobile-workflow-nav__inner"><a data-workflow-link="search"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg><strong>${text("מנוע חיפוש", "Search")}</strong></a><a data-workflow-link="board"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="3"></rect><path d="M8 8h8M8 12h8M8 16h5"></path></svg><strong>${text("לוח המפגש", "Session board")}</strong></a><a data-workflow-link="patients" href="/therapist/my-patients/"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.5"></circle><path d="M3.5 20c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M14 15c3.7-.7 5.8 1 6.5 4"></path></svg><strong>${text("המטופלים שלי", "My clients")}</strong></a><a data-workflow-link="diary" href="/therapist/diary"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M7 3v4M17 3v4M3 10h18M8 14h3M13 14h3M8 17h3"></path></svg><strong>${text("יומן", "Diary")}</strong></a><button type="button" data-workflow-menu><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"></path></svg><strong>${text("תפריט", "Menu")}</strong></button></div>`;
      navigation.querySelector("[data-workflow-menu]")?.addEventListener("click", () => {
        const menuButton = document.querySelector('button[aria-controls="site-navigation-menu"],.standard-site-header__menu-button');
        if (menuButton) menuButton.click();
        else location.assign("/");
      });
      document.body.append(navigation);
    }

    document.body.classList.add("therapist-area-mobile-nav-ready");
    const params = new URLSearchParams(location.search);
    const patientId = params.get("patientBoard");
    const patientSuffix = patientId ? `&patientBoard=${encodeURIComponent(patientId)}&cloudBoardReady=1` : "";
    navigation.querySelector('[data-workflow-link="search"]').href = `/therapist/build?tab=search&boardMode=1${patientSuffix}`;
    navigation.querySelector('[data-workflow-link="board"]').href = `/therapist/build?view=session${patientSuffix}`;

    const path = location.pathname.replace(/\/$/, "");
    const active = path === "/therapist/my-patients" ? "patients" : path === "/therapist/diary" ? "diary" : path === "/therapist/build" && params.get("view") === "session" ? "board" : path === "/therapist/build" ? "search" : "";
    navigation.querySelectorAll("a").forEach((link) => {
      if (link.dataset.workflowLink === active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function adaptHeader() {
    if (!isTherapistArea()) {
      document.querySelector(".therapist-mobile-workflow-nav")?.remove();
      document.body.classList.remove("therapist-area-mobile-nav-ready");
      return;
    }
    addMobileWorkflowNav();
    const root = document.querySelector("#root");
    if (!root) return;
    const rootLinks = [...root.querySelectorAll("a")];
    const homeCandidate = rootLinks.find((link) => ["בית", "Home"].includes(normalize(link.textContent)));
    const activitiesCandidate = rootLinks.find((link) => ["כל הפעילויות", "All activities"].includes(normalize(link.textContent)));
    const navigation = homeCandidate?.closest("nav") || activitiesCandidate?.closest("nav") || homeCandidate?.parentElement || activitiesCandidate?.parentElement;
    if (!navigation) return;

    const header = navigation.closest("header") || navigation.parentElement || root;
    const logoLink = header.querySelector('img[alt*="בואו נשחק"],img[alt*="Play"]')?.closest("a") ||
      root.querySelector('img[alt*="בואו נשחק"],img[alt*="Play"]')?.closest("a");
    if (logoLink) logoLink.href = "/";
    const links = [...navigation.querySelectorAll("a")];

    links.forEach((link) => {
      const text = normalize(link.textContent);
      if (["להורים", "הורים", "למטפלים", "מטפלים"].includes(text)) {
        link.hidden = true;
        link.style.setProperty("display", "none", "important");
      }
    });

    const home = links.find((link) => ["בית", "Home"].includes(normalize(link.textContent)));
    const allActivities = links.find((link) => ["כל הפעילויות", "All activities"].includes(normalize(link.textContent)));
    if (!home) return;

    if (allActivities) allActivities.remove();

    const desired = [
      { key: "board", text: text("לוח מובנה", "Session board"), href: "/therapist/build?view=session" },
      { key: "diary", text: text("יומן", "Diary"), href: "/therapist/diary" },
      { key: "search", text: text("מנוע חיפוש", "Search"), href: "/therapist/build?tab=search" },
      { key: "patients", text: text("המטופלים שלי", "My clients"), href: "/therapist/my-patients/" }
    ];
    let anchor = home;
    desired.forEach((item) => {
      let link = navigation.querySelector(`[data-therapist-link="${item.key}"]`);
      if (!link) {
        link = document.createElement("a");
        link.className = home.className || allActivities?.className || "";
        link.dataset.therapistLink = item.key;
      }
      link.href = item.href;
      if (normalize(link.textContent) !== item.text) link.textContent = item.text;
      link.dataset.therapistHeaderRoute = "true";
      if (anchor.nextElementSibling !== link) anchor.insertAdjacentElement("afterend", link);
      anchor = link;
    });

  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[data-therapist-header-route=true]");
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    location.assign(link.href);
  }, true);

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      adaptHeader();
      adaptHeading();
      markTherapistSearchPage();
    });
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  ["pushState", "replaceState"].forEach((method) => {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args);
      schedule();
      window.setTimeout(schedule, 0);
      return result;
    };
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest?.("a[href]")) return;
    window.setTimeout(schedule, 0);
  }, true);
  addEventListener("popstate", schedule);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
})();
