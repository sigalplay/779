(() => {
  "use strict";

  function sessionExists() {
    try {
      const value = JSON.parse(localStorage.getItem("boo_cloud_session") || "null");
      return Boolean(value && (value.access_token || value.user));
    } catch {
      return false;
    }
  }

  function updateAccountLinks() {
    const signedIn = sessionExists();
    document.querySelectorAll("[data-patients-account]").forEach((link) => {
      link.textContent = signedIn ? "החשבון שלי" : "כניסה";
      link.href = signedIn ? "/profile" : `/auth?mode=login&redirect=${encodeURIComponent(location.pathname)}`;
    });
  }

  function init() {
    const button = document.querySelector(".standard-site-header__menu-button");
    const menu = document.getElementById("patientsSiteMenu");
    if (button && menu) {
      button.addEventListener("click", () => {
        const open = menu.hidden;
        menu.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
      });
      document.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || menu.hidden) return;
        menu.hidden = true;
        button.setAttribute("aria-expanded", "false");
        button.focus();
      });
    }
    updateAccountLinks();
    addEventListener("pp_auth_change", updateAccountLinks);
    const workflowNav = document.createElement("nav");
    workflowNav.className = "therapist-mobile-workflow-nav";
    workflowNav.setAttribute("aria-label", "ניווט מהיר באזור המטפלות");
    workflowNav.innerHTML = `<div class="therapist-mobile-workflow-nav__inner"><a href="/therapist/build?tab=search&boardMode=1"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg><strong>מנוע חיפוש</strong></a><a href="/therapist/build?view=session"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="3"></rect><path d="M8 8h8M8 12h8M8 16h5"></path></svg><strong>לוח המפגש</strong></a><a aria-current="page" href="/therapist/my-patients/"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.5"></circle><path d="M3.5 20c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M14 15c3.7-.7 5.8 1 6.5 4"></path></svg><strong>המטופלים שלי</strong></a><a href="/therapist/diary"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M7 3v4M17 3v4M3 10h18M8 14h3M13 14h3M8 17h3"></path></svg><strong>יומן</strong></a><button type="button" data-workflow-menu><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"></path></svg><strong>תפריט</strong></button></div>`;
    workflowNav.querySelector("[data-workflow-menu]")?.addEventListener("click", () => {
      document.querySelector(".standard-site-header__menu-button")?.click();
    });
    document.body.append(workflowNav);
    document.body.classList.add("therapist-area-mobile-nav-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
