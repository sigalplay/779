(() => {
  "use strict";

  const categoryLabels = new Set([
    "מנוע חיפוש", "כל הפעילויות", "פעילויות יצירה", "הכנת משחקים",
    "פעילויות סנסוריות", "פעילויות תנועה", "משחקי חברה", "ניסויים", "מתכונים"
  ]);

  function textOf(element) {
    return element?.textContent?.replace(/\s+/g, " ").trim() || "";
  }

  function findTitle(prefixes) {
    return [...document.querySelectorAll("div")].find((element) => {
      const text = textOf(element);
      return prefixes.some((prefix) => text.startsWith(prefix)) && !element.querySelector("button");
    });
  }

  function markFilterGroup(title, className) {
    const titleElement = [...document.querySelectorAll("div,span,label")].find((element) => textOf(element) === title);
    if (!titleElement) return;
    const section = titleElement.parentElement;
    if (!section) return;
    section.querySelectorAll("button").forEach((button) => button.classList.add("search-filter-chip", className));
  }

  function markParentFilterGroups() {
    const focusTitle = findTitle(["1. במה את/ה רוצה להתמקד?"]);
    const timeTitle = findTitle(["2. כמה זמן יש?"]);
    focusTitle?.parentElement?.querySelectorAll("button").forEach((button) => button.classList.add("search-filter-chip", "search-development-chip"));
    timeTitle?.parentElement?.querySelectorAll("button").forEach((button) => button.classList.add("search-filter-chip", "search-time-chip"));

    const ageTitle = findTitle(["1. גיל", "1. Age"]);
    const developmentTitle = findTitle(["2. תחום שתרצו לחזק", "2. Developmental area"]);
    const durationTitle = findTitle(["3. כמה זמן יש", "3. How much time"]);
    ageTitle?.parentElement?.querySelectorAll("button").forEach((button) => button.classList.add("search-filter-chip", "search-age-chip"));
    developmentTitle?.parentElement?.querySelectorAll("button").forEach((button) => button.classList.add("search-filter-chip", "search-development-chip"));
    durationTitle?.parentElement?.querySelectorAll("button").forEach((button) => button.classList.add("search-filter-chip", "search-time-chip"));
    [ageTitle, developmentTitle, durationTitle].forEach(makeParentAccordion);
  }

  function makeParentAccordion(title) {
    if (!title) return;
    const content = title.nextElementSibling;
    if (!content) return;
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    if (title.dataset.mobileAccordionReady === "true") {
      if (!mobile) {
        content.hidden = false;
        title.setAttribute("aria-expanded", "true");
        title.dataset.mobileAccordionMode = "desktop";
      } else if (title.dataset.mobileAccordionMode !== "mobile") {
        content.hidden = true;
        title.setAttribute("aria-expanded", "false");
        title.dataset.mobileAccordionMode = "mobile";
      }
      return;
    }
    title.dataset.mobileAccordionReady = "true";
    title.dataset.mobileAccordionMode = mobile ? "mobile" : "desktop";
    title.classList.add("parent-filter-accordion-title");
    title.setAttribute("role", "button");
    title.setAttribute("tabindex", "0");
    title.setAttribute("aria-expanded", mobile ? "false" : "true");
    content.classList.add("parent-filter-accordion-content");
    content.hidden = mobile;
    const arrow = document.createElement("span");
    arrow.className = "parent-filter-accordion-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "⌄";
    title.append(arrow);
  }

  function toggleParentAccordion(title) {
    const content = title?.nextElementSibling;
    if (!content?.classList.contains("parent-filter-accordion-content")) return;
    const open = content.hidden;
    content.hidden = !open;
    title.setAttribute("aria-expanded", String(open));
  }

  function markCategoryTabs() {
    const buttons = [...document.querySelectorAll("button")].filter((button) => categoryLabels.has(textOf(button).replace(/^[^\p{L}]+/u, "")));
    const groups = new Map();
    buttons.forEach((button) => {
      if (!button.parentElement) return;
      const group = groups.get(button.parentElement) || [];
      group.push(button);
      groups.set(button.parentElement, group);
    });
    groups.forEach((group, container) => {
      if (group.length < 3) return;
      container.classList.add("mobile-search-category-tabs");
      group.forEach((button) => button.classList.add("mobile-search-category-tab"));
    });
  }

  function adapt() {
    const path = location.pathname.replace(/\/$/, "");
    document.body?.classList.toggle("therapist-search-mobile-page", path === "/therapist/build");
    if (path === "/therapist/build") {
      markFilterGroup("מטרות טיפוליות", "search-development-chip");
      markFilterGroup("משך הפעילות", "search-time-chip");
    } else if (path === "/parent/play") {
      markParentFilterGroups();
    } else return;
    markCategoryTabs();
  }

  let queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      adapt();
    });
  }

  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener("click", (event) => {
    const title = event.target.closest?.(".parent-filter-accordion-title");
    if (title) toggleParentAccordion(title);
  });
  document.addEventListener("keydown", (event) => {
    const title = event.target.closest?.(".parent-filter-accordion-title");
    if (!title || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    toggleParentAccordion(title);
  });
  addEventListener("popstate", schedule);
  addEventListener("resize", schedule);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
})();
