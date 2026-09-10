(() => {
  "use strict";

  const exact = new Map([
    ["Session Plan", "Session Plan"],
    ["Session Plan", "Session Plan"],
    ["Take a photo and add to the plan", "Add a Photo to the Plan"],
    ["Take a Photo and Add It to the Plan", "Add a Photo to the Plan"],
    ["No activities added yet. Select “Add to Session Plan” to get started.", "No activities yet. Add an activity to start building your session."],
    ["No activities selected yet. Add them through the session planner.", "No activities yet. Add activities from the Session Planner."],
    ["Start Session", "Start Session"],
    ["Session Plan Name", "Name Your Plan"],
    ["Save Plan", "Save Plan"],
    ["Saved Plans", "Saved Plans"],
    ["Clear Session Plan", "Clear Session Plan"],
    ["Treatment plan reset.", "Session plan cleared."],
    ["Add to Treatment Plan", "Add to Session Plan"],
    ["Remove from plan", "Remove from Plan"],
    ["Build a Visual Schedule for a Therapy Session", "Build a Visual Schedule for a Therapy Session"],
    ["Build a structured visual schedule for a session", "Build a Structured Session Plan"],
    ["Therapist calendar", "Therapist Calendar"],
    ["Obstacle Course", "Obstacle Course"],
    ["Obstacle course", "Obstacle Course Builder"],
    ["Start Course", "Start Course"],
    ["Start trail", "Start Course"],
    ["Our Motor Trail", "Our Obstacle Course"],
    ["Equipment Bank", "Equipment Library"],
    ["Return to Bank", "Return to Library"],
    ["Return All Equipment", "Return All Equipment to the Library"],
    ["The Archive is Empty", "The Archive Is Empty"],
    ["Daily Routine Visual Schedule Builder", "Daily Visual Schedule Builder"],
    ["Daily Routine Visual Schedule", "Daily Visual Schedule"],
    ["Morning Routine Visual Schedule", "Morning Visual Schedule"],
    ["Evening Routine Visual Schedule", "Evening Visual Schedule"],
    ["Weekly Visual Schedule", "Weekly Visual Schedule"],
    ["How does it work?", "How Does It Work?"],
    ["Craft activity", "Craft Activity"],
    ["הוספת מסלול מוטורי", "Add an Obstacle Course"],
    ["עריכת מסלול מוטורי", "Edit the Obstacle Course"],
    ["צילום תמונה והוספה לתכנית", "Add a Photo to the Plan"],
    ["הוסף לתכנית הטיפול", "Add to Session Plan"],
    ["הסר מהתוכנית", "Remove from Plan"],
    ["תכנית טיפול", "Session Plan"],
    ["תכנית הטיפול", "Session Plan"],
    ["שם התוכנית", "Name Your Plan"],
    ["התחל טיפול", "Start Session"],
    ["איפוס תוכנית הטיפול", "Clear Session Plan"]
  ]);

  const phrases = [
    [/^(\d+) items$/i, (_, count) => `${count} ${count === "1" ? "activity" : "activities"}`],
    [/\bAdd to Treatment Plan\b/g, "Add to Session Plan"],
    [/\btreatment plan\b/gi, "session plan"],
    [/\bmotor trail\b/gi, "obstacle course"],
    [/\bequipment bank\b/gi, "equipment library"],
    [/\bimage bank\b/gi, "image library"],
    [/\bcolourful\b/gi, "colorful"],
    [/\bcolouring\b/gi, "coloring"],
    [/\bcolours\b/gi, "colors"],
    [/\bcolour\b/gi, "color"],
    [/\bfavourites\b/gi, "favorites"],
    [/\bfavourite\b/gi, "favorite"],
    [/\bcentred\b/gi, "centered"],
    [/\bcentre\b/gi, "center"],
    [/\bpersonalised\b/gi, "personalized"],
    [/\borganised\b/gi, "organized"],
    [/\brecognising\b/gi, "recognizing"],
    [/\bpyjamas\b/gi, "pajamas"],
    [/\bnappies\b/gi, "diapers"],
    [/\bnappy\b/gi, "diaper"],
    [/\btrousers\b/gi, "pants"],
    [/\bsavoury\b/gi, "savory"],
    [/\baluminium\b/gi, "aluminum"],
    [/\bforwards\b/gi, "forward"],
    [/\bbackwards\b/gi, "backward"],
    [/\btorch\b/gi, "flashlight"],
    [/\bice loll(?:y|ies)\b/gi, (match) => /ies$/i.test(match) ? "popsicles" : "popsicle"]
  ];

  function isEnglish() {
    return location.pathname === "/en" || location.pathname.startsWith("/en/") || document.documentElement.lang === "en";
  }

  function polish(value) {
    if (!value || (!/[A-Za-z]/.test(value) && !/[\u0590-\u05FF]/.test(value))) return value;
    const leading = value.match(/^\s*/)?.[0] || "";
    const trailing = value.match(/\s*$/)?.[0] || "";
    let core = value.trim();
    core = exact.get(core) || core;
    phrases.forEach(([pattern, replacement]) => { core = core.replace(pattern, replacement); });
    return leading + core + trailing;
  }

  function polishRoot(root) {
    if (!isEnglish() || !root) return;
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (!node.parentElement || /^(SCRIPT|STYLE|TEXTAREA)$/.test(node.parentElement.tagName)) return;
      const next = polish(node.nodeValue || "");
      if (next !== node.nodeValue) node.nodeValue = next;
    });
    root.querySelectorAll?.("[title],[aria-label],[placeholder],[value]").forEach((element) => {
      ["title", "aria-label", "placeholder", "value"].forEach((name) => {
        const value = element.getAttribute(name);
        if (!value) return;
        const next = polish(value);
        if (next !== value) element.setAttribute(name, next);
      });
    });
  }

  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      polishRoot(document.body);
    });
  }

  function start() {
    schedule();
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["title", "aria-label", "placeholder", "value"]
    });
    window.addEventListener("boo_language_change", schedule);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
