(() => {
  "use strict";

  const PREFIX = "/en";

  function isEnglish() {
    if (location.pathname === PREFIX || location.pathname.startsWith(PREFIX + "/")) return true;
    try {
      if (sessionStorage.getItem("boo_english_preview") === "1") return true;
    } catch {}
    return document.documentElement.lang === "en";
  }

  function appPath() {
    let p = location.pathname || "/";
    if (p === PREFIX) return "/";
    if (p.startsWith(PREFIX + "/")) p = p.slice(PREFIX.length) || "/";
    return p;
  }

  function englishUrl() {
    let p = appPath();
    if (p === "/") return PREFIX + "/";
    if (!p.endsWith("/")) p += "/";
    return PREFIX + p;
  }

  function label() {
    return isEnglish() ? "עברית" : "English";
  }

  function goHebrew() {
    try {
      localStorage.setItem("boo_nesahek_language", "he");
      sessionStorage.removeItem("boo_english_preview");
    } catch {}
    reloadInLanguage();
  }

  function goEnglish() {
    try {
      localStorage.setItem("boo_nesahek_language", "en");
      sessionStorage.setItem("boo_english_preview", "1");
    } catch {}
    reloadInLanguage();
  }

  function reloadInLanguage() {
    const destination = appPath() + location.search + location.hash;
    if (destination === location.pathname + location.search + location.hash) location.reload();
    else location.assign(destination);
  }

  const globeIcon =
    '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1em;height:1em;flex:none"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z"></path></svg>';

  function injectStyles() {
    if (document.getElementById("boo-lang-switch-style")) return;
    const style = document.createElement("style");
    style.id = "boo-lang-switch-style";
    style.textContent = `
      [data-boo-lang-switch]{display:none!important;align-items:center;justify-content:center;gap:.4rem;
        border-radius:9999px;border:1px solid rgba(0,0,0,.12);background:#fff;color:inherit;
        font-size:.8rem;font-weight:700;line-height:1;padding:.5rem .75rem;min-height:2.25rem;
        text-decoration:none;white-space:nowrap;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.05)}
      [data-boo-lang-switch]:hover{background:#f4f4f5}
      [data-boo-lang-switch][data-boo-lang-place="menu"]{display:inline-flex!important;width:100%;justify-content:center;padding:.7rem 1rem;
        min-height:2.75rem;font-size:.95rem;margin:0}
      [data-boo-lang-menu-row]{padding:.75rem 1.25rem 0}
      @media (max-width:639px){[data-boo-lang-switch][data-boo-lang-place="header"]{display:inline-flex!important;padding:.5rem .6rem;font-size:.75rem}}
    `;
    document.head.appendChild(style);
  }

  function makeSwitch(place) {
    const a = document.createElement("a");
    a.setAttribute("data-boo-lang-switch", "1");
    a.setAttribute("data-boo-lang-place", place);
    a.setAttribute("dir", "auto");
    a.href = isEnglish() ? appPath() : englishUrl();
    a.innerHTML = globeIcon + "<span>" + label() + "</span>";
    a.setAttribute("aria-label", isEnglish() ? "מעבר לעברית" : "Switch to English");
    a.addEventListener("click", (event) => {
      event.preventDefault();
      if (isEnglish()) goHebrew();
      else goEnglish();
    });
    return a;
  }

  function mountHeader() {
    const header = document.querySelector("header");
    if (!header) return;
    const menuButton = header.querySelector('button[aria-controls="site-navigation-menu"]');
    const cluster = menuButton ? menuButton.parentElement : header.querySelector("div.flex.shrink-0.items-center");
    if (!cluster) return;
    if (cluster.querySelector('[data-boo-lang-switch][data-boo-lang-place="header"]')) return;
    const node = makeSwitch("header");
    if (menuButton) cluster.insertBefore(node, menuButton);
    else cluster.appendChild(node);
  }

  function mountMenu() {
    const menu = document.getElementById("site-navigation-menu");
    if (!menu) return;
    if (menu.querySelector('[data-boo-lang-switch][data-boo-lang-place="menu"]')) return;
    const row = document.createElement("div");
    row.setAttribute("data-boo-lang-menu-row", "1");
    row.appendChild(makeSwitch("menu"));
    menu.insertBefore(row, menu.firstChild);
  }

  function unhideOurs() {
    document.querySelectorAll("[data-boo-lang-switch]").forEach((el) => {
      el.hidden = false;
      const span = el.querySelector("span");
      if (span && span.textContent !== label()) {
        span.textContent = label();
        el.href = isEnglish() ? appPath() : englishUrl();
        el.setAttribute("aria-label", isEnglish() ? "מעבר לעברית" : "Switch to English");
      }
      delete el.dataset.englishSwitchHidden;
    });
  }

  function unhideNativeSwitches() {
    document.querySelectorAll("button").forEach((button) => {
      const value = (button.textContent || "").replace(/\s+/g, " ").trim();
      if (!["English", "Hebrew", "עברית"].includes(value)) return;
      button.hidden = false;
      button.style.removeProperty("display");
      delete button.dataset.englishSwitchHidden;
    });
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("button");
    if (!button || button.closest("[data-boo-lang-switch]")) return;
    const value = (button.textContent || "").replace(/\s+/g, " ").trim();
    if (!["English", "Hebrew", "עברית"].includes(value)) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    if (value === "English") goEnglish();
    else goHebrew();
  }, true);

  let queued = false;
  function refresh() {
    if (queued) return;
    queued = true;
    setTimeout(() => {
      queued = false;
      injectStyles();
      mountHeader();
      mountMenu();
      unhideOurs();
      unhideNativeSwitches();
    }, 200);
  }

  new MutationObserver(refresh).observe(document.body || document.documentElement, { childList: true, subtree: true });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh, { once: true });
  else refresh();
})();
