(() => {
  "use strict";

  const pagePath = window.location.pathname.replace(/\/+$/, "") || "/";
  if (pagePath !== "/" && pagePath !== "/en") return;

  const isEn = pagePath === "/en" || document.documentElement.lang === "en" ||
    localStorage.getItem("boo_nesahek_language") === "en";

  const t = isEn ? {
    hubHref: "/en/parent/routine-boards/",
    ariaLabel: "Routine Boards for Children",
    imgAlt: "Illustration of routine boards for children",
    imgTitle: "Routine Boards for Children — Let's Play",
    seoName: "Routine Boards for Children",
    title: "Routine Boards for Children",
  } : {
    hubHref: "/parent/routine-boards/",
    ariaLabel: "לוחות התארגנות לילדים",
    imgAlt: "איור של לוחות התארגנות לילדים",
    imgTitle: "לוחות התארגנות לילדים — בואו נשחק",
    seoName: "לוחות התארגנות לילדים",
    title: "לוחות התארגנות לילדים",
  };

  const routinePaths = [
    "/parent/daily-routine",
    "/parent/weekly-board",
    "/parent/morning-routine",
    "/parent/evening-routine",
  ];

  const englishRoutinePaths = routinePaths.map((path) => `/en${path}`);

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
      return (routinePaths.includes(path) || (isEn && englishRoutinePaths.includes(path))) &&
        link.parentElement?.classList.contains("grid-cols-2");
    });

    if (cards.length !== routinePaths.length) return false;

    const hubCard = cards[0].cloneNode(true);
    hubCard.setAttribute("href", t.hubHref);
    hubCard.setAttribute("aria-label", t.ariaLabel);
    hubCard.dataset.routineHub = "true";

    const image = hubCard.querySelector("img");
    if (image) {
      image.src = "/icon-bank/navigation-v2/daily-routine-checklist.webp";
      image.alt = t.imgAlt;
      image.title = t.imgTitle;
      image.dataset.seoName = t.seoName;
    }

    const title = hubCard.querySelector("h2");
    if (title) title.textContent = t.title;

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
