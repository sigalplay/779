(() => {
  "use strict";

  const DRAFT_KEY = "pp_draft_plan";
  const games = [
    { id: "play-kitchen", label: "מטבח ילדים", asset: "/assets/therapist-games/play-kitchen.png" },
    { id: "paper-pencil", label: "דף ועיפרון", asset: "/assets/therapist-games/paper-pencil.png" },
    { id: "board-game", label: "משחק קופסה", asset: "/assets/therapist-games/board-game.png" },
    { id: "doll", label: "בובה", asset: "/assets/therapist-games/doll.png" },
    { id: "kinetic-sand", label: "חול קינטי", asset: "/assets/therapist-games/kinetic-sand.png" },
    { id: "play-dough", label: "בצק", asset: "/assets/therapist-games/play-dough.png" },
    { id: "markers", label: "טושים", asset: "/assets/therapist-games/markers.png" },
    { id: "chef-hat", label: "כובע שף", asset: "/assets/therapist-games/chef-hat.png" }
  ];

  function isBoard() {
    const params = new URLSearchParams(location.search);
    return location.pathname.replace(/\/$/, "") === "/therapist/build" && params.get("view") === "session";
  }

  function gameMarkup(game) {
    return `<span class="board-game-choice"><span><img src="${game.asset}" alt=""></span><strong>${game.label}</strong></span>`;
  }

  function addGame(game) {
    let items = [];
    try { items = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]"); } catch {}
    if (!Array.isArray(items)) items = [];
    items.push({
      kind: "photo",
      uid: `game-${game.id}-${Date.now()}`,
      image: game.asset,
      label: game.label,
      boardGame: game.id
    });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("boo_draft_plan_changed", { detail: { items, source: "meeting-board-game" } }));
    document.querySelector("[data-games-palette]")?.remove();
    window.setTimeout(() => location.reload(), 180);
  }

  function openPalette(button) {
    const existing = document.querySelector("[data-games-palette]");
    if (existing) {
      existing.remove();
      button.setAttribute("aria-expanded", "false");
      return;
    }
    document.querySelector("[data-signs-palette]")?.remove();
    document.querySelector("[data-board-signs]")?.setAttribute("aria-expanded", "false");
    const palette = document.createElement("div");
    palette.className = "meeting-games-palette";
    palette.dataset.gamesPalette = "true";
    palette.setAttribute("role", "dialog");
    palette.setAttribute("aria-label", "בחירת משחק ללוח");
    palette.innerHTML = `<strong>בחירת משחק ללוח</strong><div>${games.map((game) => `<button type="button" data-add-board-game="${game.id}" aria-label="הוספת ${game.label} ללוח">${gameMarkup(game)}</button>`).join("")}</div><button type="button" class="meeting-games-close" data-close-games>סגירה</button>`;
    button.closest("[data-games-tools]").append(palette);
    button.setAttribute("aria-expanded", "true");
  }

  function install() {
    if (!isBoard()) return;
    const actions = document.querySelector("[data-meeting-board-actions]");
    if (!actions || actions.querySelector("[data-games-tools]")) return;
    const wrap = document.createElement("div");
    wrap.className = "meeting-games-tools";
    wrap.dataset.gamesTools = "true";
    wrap.innerHTML = `<button type="button" class="meeting-games-button" data-board-games aria-expanded="false" title="הוספת משחק ללוח"><img class="meeting-tool-image-icon" src="/assets/therapist-games/board-game.png" alt=""><span>משחקים</span></button>`;
    const timer = actions.querySelector(".meeting-timer");
    actions.insertBefore(wrap, timer || actions.querySelector(".meeting-photo"));
  }

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest?.("[data-board-games]");
    if (trigger) {
      event.preventDefault();
      event.stopPropagation();
      openPalette(trigger);
      return;
    }
    if (event.target.closest?.("[data-close-games]")) {
      document.querySelector("[data-games-palette]")?.remove();
      document.querySelector("[data-board-games]")?.setAttribute("aria-expanded", "false");
      return;
    }
    const choice = event.target.closest?.("[data-add-board-game]");
    if (!choice) return;
    const game = games.find((item) => item.id === choice.dataset.addBoardGame);
    if (game) addGame(game);
  }, true);

  let queued = false;
  const refresh = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      install();
    });
  };
  new MutationObserver(refresh).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh, { once: true });
  else refresh();
})();
