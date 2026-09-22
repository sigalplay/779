(() => {
  "use strict";

  const cleanPath = location.pathname.replace(/\/$/, "");
  const entryParams = new URLSearchParams(location.search);
  const oldBoardPath = cleanPath === "/therapist/board";
  const emptyBuildPath = cleanPath === "/therapist/build" && !entryParams.has("tab") && !entryParams.has("view");
  if (cleanPath === "/therapist" || oldBoardPath || emptyBuildPath) {
    location.replace("/therapist/build?view=session");
    return;
  }

  const tabs = [
    ["board", "/therapist/build?view=session", "לוח טיפול"],
    ["patients", "/therapist/my-patients/", "המטופלים שלי"],
    ["plans", "/therapist/plans", "תכניות טיפול"],
    ["diary", "/therapist/diary", "יומן"],
    ["tools", "/therapist/tools/", "כלים למטפלות"]
  ];

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const targetUrl = new URL(link.href, location.href);
    const targetPath = targetUrl.pathname.replace(/\/$/, "");
    const sameOrigin = targetUrl.origin === location.origin;
    const noQueryOrHash = !targetUrl.search && !targetUrl.hash;
    const bareTherapistEntry =
      sameOrigin &&
      targetPath === "/therapist/build" &&
      noQueryOrHash;
    const bareHomeReturn =
      sameOrigin &&
      location.pathname.startsWith("/therapist/") &&
      targetPath === "" &&
      noQueryOrHash;
    const therapistTab = link.matches(".therapist-tabs a[href]");
    if (!bareTherapistEntry && !bareHomeReturn && !therapistTab) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    const destination = bareTherapistEntry
      ? "/therapist/build?view=session"
      : bareHomeReturn
        ? "/"
        : link.href;
    window.location.assign(destination);
  }, true);

  function activeTab(pathname) {
    if (pathname.startsWith("/therapist/diary")) return "diary";
    if (pathname.startsWith("/therapist/my-patients")) return "patients";
    if (pathname.startsWith("/therapist/plans")) return "plans";
    if (pathname.startsWith("/therapist/tools") || pathname.startsWith("/therapist/all")) return "tools";
    if (pathname.startsWith("/therapist/build")) return "board";
    return "board";
  }

  function mount() {
    const pathname = location.pathname;
    const existing = document.querySelector(".therapist-tabs[data-global-tabs]");
    if (document.querySelector("#root")) {
      existing?.remove();
      return;
    }
    if (document.querySelector(".therapist-tabs:not([data-global-tabs])")) {
      existing?.remove();
      return;
    }
    if (!pathname.startsWith("/therapist/")) {
      existing?.remove();
      return;
    }
    const header = document.querySelector("#root header, body > header");
    if (!header) return;
    const active = activeTab(pathname);
    const nav = existing || document.createElement("nav");
    nav.className = "therapist-tabs";
    nav.dataset.globalTabs = "true";
    nav.setAttribute("aria-label", "ניווט באזור המטפלות");
    nav.innerHTML = tabs.map(([key, href, label]) => `<a href="${href}"${key === active ? ' class="active" aria-current="page"' : ""}>${label}</a>`).join("");
    if (!existing) header.insertAdjacentElement("afterend", nav);
  }

  let queued = false;
  function scheduleMount() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; mount(); });
  }

  new MutationObserver(scheduleMount).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener("popstate", scheduleMount);
  ["pushState", "replaceState"].forEach((method) => {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args);
      scheduleMount();
      return result;
    };
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
