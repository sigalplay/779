// Shared helpers for the standalone pages that sit outside the React app
// (routine boards, daily routine, ADL sequences, school holidays, game builder).
(() => {
  "use strict";

  // Safari on iPhone/iPad can open the print sheet before the page has painted
  // the printable layout. A short delay prevents a blank PDF.
  const nativePrint = window.print.bind(window);
  window.print = () => window.setTimeout(nativePrint, 400);

  // On phones, a read-only share-link field opens the link when tapped.
  const phone = window.matchMedia("(max-width: 767px)");
  const selector = "input[readonly], textarea[readonly]";
  const english = () => (document.documentElement.lang || "").toLowerCase().startsWith("en");

  const linkOf = (field) => {
    const raw = String(field.value || "").trim();
    if (!/^https?:\/\//i.test(raw)) return null;
    try {
      const url = new URL(raw, window.location.href);
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
    } catch {
      return null;
    }
  };

  const isShareField = (field) => Boolean(linkOf(field)) && Boolean(
    field.closest('[role="dialog"], .share-dialog, .share-overlay') ||
    /share|link|url/i.test(field.id || "") ||
    /קישור|link/i.test(field.getAttribute("aria-label") || "")
  );

  const markLinks = () => {
    if (!phone.matches) return;
    document.querySelectorAll(selector).forEach((field) => {
      if (!isShareField(field) || field.classList.contains("mobile-openable-board-link")) return;
      field.classList.add("mobile-openable-board-link");
      field.setAttribute("role", "link");
      field.setAttribute("tabindex", "0");
      field.setAttribute("title", english() ? "Open the board" : "פתיחת הלוח");
      field.setAttribute("aria-label", english() ? "Open the board link" : "פתיחת הקישור ללוח");
    });
  };

  const openField = (field) => {
    if (!phone.matches || !isShareField(field)) return false;
    window.location.assign(linkOf(field));
    return true;
  };

  document.addEventListener("click", (event) => {
    const field = event.target.closest?.(selector);
    if (!field || !openField(field)) return;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const field = event.target.closest?.(selector);
    if (field && openField(field)) event.preventDefault();
  });

  const style = document.createElement("style");
  style.textContent = "@media (max-width: 767px){.mobile-openable-board-link{cursor:pointer!important;color:#286149!important;font-weight:700!important;text-decoration:underline!important;text-underline-offset:2px}.mobile-openable-board-link:focus-visible{outline:2px solid #73b493!important;outline-offset:2px}}";
  document.head.appendChild(style);

  // The share field is filled in after the user asks for a link, so re-check on changes.
  document.addEventListener("focusin", markLinks);
  document.addEventListener("input", markLinks);
  new MutationObserver(markLinks).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["value", "class", "hidden", "open"] });
  phone.addEventListener?.("change", markLinks);
  markLinks();
})();
