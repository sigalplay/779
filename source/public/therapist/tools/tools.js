// Therapist tools page: quick navigation bar at the bottom on phones and tablets
// (same bar as the rest of the therapist area).
(() => {
  "use strict";

  function isEnglish() {
    try { return sessionStorage.getItem("boo_english_preview") === "1" && localStorage.getItem("boo_nesahek_language") === "en"; }
    catch { return document.documentElement.lang === "en"; }
  }
  const text = (hebrew, english) => (isEnglish() ? english : hebrew);

  const nav = document.createElement("nav");
  nav.className = "therapist-mobile-workflow-nav";
  nav.setAttribute("aria-label", text("ניווט מהיר באזור המטפלות", "Quick therapist navigation"));
  nav.innerHTML = `<div class="therapist-mobile-workflow-nav__inner">`
    + `<a href="/therapist/build?tab=search&boardMode=1"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"></circle><path d="m15.5 15.5 5 5"></path></svg><strong>${text("מנוע חיפוש", "Search")}</strong></a>`
    + `<a href="/therapist/build?view=session"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="3"></rect><path d="M8 8h8M8 12h8M8 16h5"></path></svg><strong>${text("לוח המפגש", "Session board")}</strong></a>`
    + `<a href="/therapist/my-patients/"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"></circle><circle cx="17" cy="9" r="2.5"></circle><path d="M3.5 20c.4-4 2.2-6 5.5-6s5.1 2 5.5 6M14 15c3.7-.7 5.8 1 6.5 4"></path></svg><strong>${text("המטופלים שלי", "My clients")}</strong></a>`
    + `<a href="/therapist/diary"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"></rect><path d="M7 3v4M17 3v4M3 10h18M8 14h3M13 14h3M8 17h3"></path></svg><strong>${text("יומן", "Diary")}</strong></a>`
    + `<button type="button" data-workflow-menu><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"></path></svg><strong>${text("תפריט", "Menu")}</strong></button>`
    + `</div>`;
  // This page has no site menu, so "Menu" goes to the home page (as on the live site).
  nav.querySelector("[data-workflow-menu]").addEventListener("click", () => location.assign("/"));
  document.body.append(nav);
  document.body.classList.add("therapist-area-mobile-nav-ready");
})();
