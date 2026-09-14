(() => {
  "use strict";

  if (window.location.pathname !== "/") return;

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
    const cards = [...document.querySelectorAll("#root a")].filter((link) => {
      const path = normalizePath(link.getAttribute("href") || "");
      return routinePaths.includes(path) && link.parentElement?.classList.contains("grid-cols-2");
    });

    if (cards.length !== routinePaths.length) return false;

    const hubCard = cards[0].cloneNode(true);
    hubCard.setAttribute("href", "/parent/routine-boards/");
    hubCard.setAttribute("aria-label", "לוחות התארגנות לילדים");
    hubCard.dataset.routineHub = "true";

    const image = hubCard.querySelector("img");
    if (image) {
      image.src = "/icon-bank/navigation-v2/daily-routine-checklist.webp";
      image.alt = "איור של לוחות התארגנות לילדים";
      image.title = "לוחות התארגנות לילדים — בואו נשחק";
      image.dataset.seoName = "לוחות התארגנות לילדים";
    }

    const title = hubCard.querySelector("h2");
    if (title) title.textContent = "לוחות התארגנות לילדים";

    cards[0].replaceWith(hubCard);
    cards.slice(1).forEach((card) => card.remove());
    return true;
  }

  if (groupRoutineCards()) return;

  const observer = new MutationObserver(() => {
    if (groupRoutineCards()) observer.disconnect();
  });
  observer.observe(document.getElementById("root"), { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 10000);
})();
