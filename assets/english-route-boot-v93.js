(() => {
  "use strict";
  try { localStorage.setItem("boo_nesahek_language", "en"); } catch {}
  try { sessionStorage.setItem("boo_english_preview", "1"); } catch {}
  document.documentElement.lang = "en";
  document.documentElement.dir = "ltr";
  const path = location.pathname;
  const routeMap = [
    ["/en/therapist/", "/therapist/build?view=session"],
    ["/en/therapist/build/", "/therapist/build?view=session"]
  ];
  const mapped = routeMap.find(([englishPath]) => path === englishPath || path === englishPath.slice(0, -1));
  if (mapped) {
    location.replace(mapped[1]);
    return;
  }
  if (/^\/en\//.test(path)) {
    const appPath = path.slice(3) || "/";
    history.replaceState(history.state, "", `${appPath}${location.search}${location.hash}`);
  }
})();
