(() => {
  "use strict";

  const routinePaths = [
    "/parent/daily-routine",
    "/parent/weekly-board",
    "/parent/morning-routine",
    "/parent/evening-routine",
  ];

  function normalizePath(href) {
    try {
      return new URL(href, window.location.origin).pathname.replace(/\/$/, "");
    } catch {
      return "";
    }
  }

  function groupRoutineCards() {
    const path = normalizePath(window.location.href) || "/";
    const isEn = path === "/en" || document.documentElement.lang === "en";
    if (path !== "/" && path !== "/en") return false;

    const englishRoutinePaths = routinePaths.map((item) => `/en${item}`);
    const cards = [...document.querySelectorAll("#root a[href]")].filter((link) => {
      const linkPath = normalizePath(link.getAttribute("href") || "");
      return (routinePaths.includes(linkPath) || (isEn && englishRoutinePaths.includes(linkPath))) &&
        link.parentElement?.classList.contains("grid-cols-2");
    });
    const existingHub = document.querySelector('#root a[data-routine-hub="true"]');
    if (existingHub) {
      cards.forEach((card) => card.remove());
      return true;
    }
    if (cards.length !== routinePaths.length) return false;

    const copy = isEn ? {
      href: "/en/parent/routine-boards/",
      label: "Routine Boards for Children",
      alt: "Illustration of routine boards for children",
      imageTitle: "Routine Boards for Children — Let's Play",
      title: "Routine Boards for Children",
    } : {
      href: "/parent/routine-boards/",
      label: "לוחות התארגנות לילדים",
      alt: "איור של לוחות התארגנות לילדים",
      imageTitle: "לוחות התארגנות לילדים — בואו נשחק",
      title: "לוחות התארגנות לילדים",
    };

    const hubCard = cards[0].cloneNode(true);
    hubCard.href = copy.href;
    hubCard.setAttribute("aria-label", copy.label);
    hubCard.dataset.routineHub = "true";
    const image = hubCard.querySelector("img");
    if (image) {
      image.src = "/icon-bank/navigation-v2/daily-routine-checklist.webp";
      image.alt = copy.alt;
      image.title = copy.imageTitle;
      image.dataset.seoName = copy.title;
    }
    const title = hubCard.querySelector("h2");
    if (title) title.textContent = copy.title;
    cards[0].replaceWith(hubCard);
    cards.slice(1).forEach((card) => card.remove());
    return true;
  }

  let queued = false;
  const nextFrame = window.requestAnimationFrame?.bind(window) || ((callback) => window.setTimeout(callback, 0));
  function schedule() {
    if (queued) return;
    queued = true;
    nextFrame(() => {
      queued = false;
      groupRoutineCards();
    });
  }

  const root = document.getElementById("root") || document.documentElement;
  new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  addEventListener("popstate", schedule);
  addEventListener("pageshow", schedule);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
})();
