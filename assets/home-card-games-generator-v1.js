(() => {
  "use strict";

  const generatorHref = "/parent/card-games-generator/";

  function isHome() {
    return window.location.pathname === "/" || window.location.pathname === "/index.html";
  }

  function addGeneratorCard() {
    if (!isHome()) return false;
    if (document.querySelector(`a[href="${generatorHref}"]`)) return true;

    const templates = [...document.querySelectorAll('main a[href="/parent/experiments"], main a[href="/parent/social-stories"]')];
    const template = templates.find((link) => link.querySelector("h2")) || templates[0];
    if (!template?.parentElement) return false;

    const card = template.cloneNode(true);
    card.href = generatorHref;
    card.setAttribute("aria-label", "מחולל משחקים להדפסה");
    card.dataset.cardGamesGenerator = "true";
    const image = card.querySelector("img");
    if (image) {
      image.src = "/assets/card-generator-home-v2.png";
      image.alt = "איור של מחולל משחקים להדפסה";
      image.title = "מחולל משחקים להדפסה — בואו נשחק";
      image.style.removeProperty("object-fit");
    }
    const title = card.querySelector("h2");
    if (title) title.textContent = "מחולל משחקים להדפסה";
    template.parentElement.appendChild(card);
    return true;
  }

  let queued = false;
  const nextFrame = window.requestAnimationFrame?.bind(window) || ((callback) => window.setTimeout(callback, 0));
  function schedule() {
    if (queued) return;
    queued = true;
    nextFrame(() => {
      queued = false;
      addGeneratorCard();
    });
  }

  const root = document.getElementById("root") || document.documentElement;
  new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  addEventListener("popstate", schedule);
  addEventListener("pageshow", schedule);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
})();
