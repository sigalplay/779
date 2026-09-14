(() => {
  "use strict";

  const icons = {
    home: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m3 11 9-8 9 8"></path><path d="M5 10v10h14V10M9 20v-6h6v6"></path></svg>',
    search: '<svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg>',
    activities: '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="2"></rect><rect x="14" y="3" width="7" height="7" rx="2"></rect><rect x="3" y="14" width="7" height="7" rx="2"></rect><rect x="14" y="14" width="7" height="7" rx="2"></rect></svg>',
    favorites: '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg>'
  };

  function isParentContext() {
    const path = location.pathname;
    if (path.startsWith("/parent/")) return true;
    if (path.startsWith("/activity/") || path.startsWith("/board-game/")) {
      return new URLSearchParams(location.search).get("mode") === "parent";
    }
    return false;
  }

  function isTherapistContext() {
    if (location.pathname.startsWith("/therapist/")) return true;
    if (!location.pathname.startsWith("/activity/") && !location.pathname.startsWith("/board-game/")) return false;
    const params = new URLSearchParams(location.search);
    return params.get("mode") === "therapist" || (params.get("returnPath") || "").startsWith("/therapist/");
  }

  function genericMobileNav() {
    return [...document.querySelectorAll("#root nav.fixed.inset-x-0.bottom-0")]
      .find((nav) => !nav.classList.contains("therapist-mobile-workflow-nav"));
  }

  function configureLink(link, key, label, href, icon) {
    const active = location.pathname.replace(/\/$/, "") === href.replace(/\/$/, "");
    if (link.dataset.contextKey !== key || link.textContent.trim() !== label) {
      link.innerHTML = `${icons[icon]}<span>${label}</span>`;
      link.dataset.contextKey = key;
    }
    link.dataset.contextHref = href;
    link.setAttribute("href", href);
    link.classList.toggle("text-primary", active);
    link.classList.toggle("text-muted-foreground", !active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }

  function apply() {
    if (isTherapistContext()) return;
    const nav = genericMobileNav();
    if (!nav) return;
    const links = [...nav.querySelectorAll(":scope > div > a")];
    if (links.length < 3) return;

    if (isParentContext()) {
      configureLink(links[0], "parent-home", "בית", "/", "home");
      configureLink(links[1], "parent-search", "מנוע חיפוש", "/parent/play", "search");
      configureLink(links[2], "parent-activities", "כל הפעילויות", "/parent/all", "activities");
    } else {
      configureLink(links[0], "home-home", "בית", "/", "home");
      configureLink(links[1], "home-activities", "פעילויות", "/parent/all", "activities");
      configureLink(links[2], "home-favorites", "מועדפים", "/favorites", "favorites");
    }

    nav.querySelectorAll("svg").forEach((svg) => {
      svg.style.width = "20px";
      svg.style.height = "20px";
      svg.style.flex = "0 0 20px";
      svg.style.fill = "none";
      svg.style.stroke = "currentColor";
      svg.style.strokeWidth = "1.8";
      svg.style.strokeLinecap = "round";
      svg.style.strokeLinejoin = "round";
    });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[data-context-href]");
    if (!link) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    location.assign(link.dataset.contextHref);
  }, true);

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      apply();
    });
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  addEventListener("popstate", schedule);
  addEventListener("boo_language_change", schedule);
  schedule();
})();
