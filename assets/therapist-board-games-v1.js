(() => {
  "use strict";

  const DRAFT_KEY = "pp_draft_plan";
  const games = [
    { id: "play-kitchen", label: "מטבח ילדים", labelEn: "Play kitchen", asset: "/assets/therapist-games/play-kitchen.png" },
    { id: "paper-pencil", label: "דף ועיפרון", labelEn: "Paper and pencil", asset: "/assets/therapist-games/paper-pencil.png" },
    { id: "board-game", label: "משחק קופסה", labelEn: "Board game", asset: "/assets/therapist-games/board-game.png" },
    { id: "doll", label: "בובה", labelEn: "Doll", asset: "/assets/therapist-games/doll.png" },
    { id: "kinetic-sand", label: "חול קינטי", labelEn: "Kinetic sand", asset: "/assets/therapist-games/kinetic-sand.png" },
    { id: "play-dough", label: "בצק", labelEn: "Play dough", asset: "/assets/therapist-games/play-dough.png" },
    { id: "markers", label: "טושים", labelEn: "Markers", asset: "/assets/therapist-games/markers.png" },
    { id: "chef-hat", label: "כובע שף", labelEn: "Chef hat", asset: "/assets/therapist-games/chef-hat.png" }
  ];

  function isEnglish() {
    try { return sessionStorage.getItem("boo_english_preview") === "1" && localStorage.getItem("boo_nesahek_language") === "en"; }
    catch { return document.documentElement.lang === "en"; }
  }

  const text = (hebrew, english) => isEnglish() ? english : hebrew;
  const gameLabel = (game) => isEnglish() ? game.labelEn : game.label;

  function isBoard() {
    const params = new URLSearchParams(location.search);
    return location.pathname.replace(/\/$/, "") === "/therapist/build" && params.get("view") === "session";
  }

  function gameMarkup(game) {
    return `<span class="board-game-choice"><span><img src="${game.asset}" alt=""></span><strong>${gameLabel(game)}</strong></span>`;
  }

  function addGame(game) {
    let items = [];
    try { items = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]"); } catch {}
    if (!Array.isArray(items)) items = [];
    items.push({
      kind: "photo",
      uid: `game-${game.id}-${Date.now()}`,
      image: game.asset,
      label: gameLabel(game),
      boardGame: game.id
    });
    localStorage.setItem(DRAFT_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("boo_draft_plan_changed", { detail: { items, source: "meeting-board-game" } }));
    document.querySelector("[data-games-palette]")?.remove();
    window.setTimeout(() => location.reload(), 180);
  }

  function localizeSavedGameCards() {
    let items = [];
    try { items = JSON.parse(localStorage.getItem(DRAFT_KEY) || "[]"); } catch {}
    if (!Array.isArray(items)) return;
    const rows = [...document.querySelectorAll("ol.space-y-3 > li")];
    items.forEach((item, index) => {
      if (!item?.boardGame || !rows[index]) return;
      const game = games.find((candidate) => candidate.id === item.boardGame);
      if (!game) return;
      const label = gameLabel(game);
      const heading = rows[index].querySelector("h2,h3,h4");
      if (heading) heading.textContent = label;
      const completion = rows[index].querySelector(":scope > button[aria-label]");
      if (completion) completion.setAttribute("aria-label", text(`סימון ${game.label} כפעילות שבוצעה`, `Mark ${game.labelEn} as completed`));
    });
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
    palette.setAttribute("aria-label", text("בחירת משחק ללוח", "Choose a game for the board"));
    palette.innerHTML = `<strong>${text("בחירת משחק ללוח", "Choose a game for the board")}</strong><div>${games.map((game) => `<button type="button" data-add-board-game="${game.id}" aria-label="${text(`הוספת ${game.label} ללוח`, `Add ${game.labelEn} to the board`)}">${gameMarkup(game)}</button>`).join("")}</div><button type="button" class="meeting-games-close" data-close-games>${text("סגירה", "Close")}</button>`;
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
    wrap.innerHTML = `<button type="button" class="meeting-games-button" data-board-games aria-expanded="false" title="${text("הוספת משחק ללוח", "Add a game to the board")}"><img class="meeting-tool-image-icon" src="/assets/therapist-games/board-game.png" alt=""><span>${text("משחקים", "Games")}</span></button>`;
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
      localizeSavedGameCards();
    });
  };
  new MutationObserver(refresh).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", refresh, { once: true });
  else refresh();
})();
