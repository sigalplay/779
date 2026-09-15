(() => {
  "use strict";
  try { localStorage.setItem("boo_nesahek_language", "en"); } catch {}
  try { sessionStorage.setItem("boo_english_preview", "1"); } catch {}
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
  const path = location.pathname;
  if (/^\/en\//.test(path)) {
    const appPath = path.slice(3) || "/";
    history.replaceState(history.state, "", `${appPath}${location.search}${location.hash}`);
  }
})();
