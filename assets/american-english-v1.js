(() => {
  "use strict";

  const exact = new Map([
    ["What Shall We Play Today?", "What Should We Play Today?"],
    ["What shall we play today?", "What should we play today?"],
    ["Daily Routine Board Builder", "Daily Routine Visual Schedule Builder"],
    ["Daily Routine Board", "Daily Routine Visual Schedule"],
    ["Morning Routine Board", "Morning Routine Visual Schedule"],
    ["Evening Routine Board", "Evening Routine Visual Schedule"],
    ["Weekly Visual Planner", "Weekly Visual Schedule"],
    ["Our board", "Our visual schedule"],
    ["Board title", "Visual schedule title"],
    ["Board link", "Visual schedule link"],
    ["Link to the interactive board", "Link to the interactive visual schedule"],
    ["Create your own board — Let's Play", "Create your own visual schedule — Let's Play"],
    ["Choose activities to start building your board", "Choose activities to start building your visual schedule"],
    ["Choose activities to start building the daily routine board", "Choose activities to start building the daily routine visual schedule"],
    ["Choose steps from the library to build your board.", "Choose steps to build your visual schedule."],
    ["Select a picture to add it to the board in any order.", "Tap a picture to add it to the visual schedule. Add the steps in the order you want."],
    ["How does a morning routine board help?", "How can a morning routine visual schedule help?"],
    ["Visual timer for the session board", "Visual timer for the session schedule"],
    ["Build a Therapy Session Board", "Build a Visual Schedule for a Therapy Session"],
    ["Build a structured session board", "Build a structured visual schedule for a session"],
    ["Motor Trail", "Obstacle Course"],
    ["Motor trail", "Obstacle course"],
    ["Station library", "Equipment bank"],
    ["Our trail", "Our obstacle course"],
    ["Start Trail", "Start Course"],
    ["Good luck! Move through the stations one at a time.", "Ready, set, go! Complete one station at a time."],
    ["Therapist diary", "Therapist calendar"],
    ["Diary", "Calendar"],
    ["How do I do it?", "How does it work?"],
    ["Creative Tool", "Craft activity"],
    ["No suitable illustration found", "We couldn't find a matching illustration"],
    ["Well done! You finished everything 🎉", "Great job! You finished everything 🎉"],
    ["Well done! You finished all the tasks 🌟", "Great job! You finished every task 🌟"],
    ["Does your child nap at preschool?", "Does your child take a nap at preschool?"],
    ["Enter setting name", "Enter the school or program name"],
    ["Search clients", "Search for a client"],
    ["Delete from diary", "Remove from calendar"],
    ["Session completed and saved to the diary.", "Session completed and saved to the calendar."],
    ["Session removed from the diary.", "Session removed from the calendar."],
    ["The preparation often continues after the working day ends.", "Preparation often continues after the workday ends."],
    ["A future space for recording a parent, teacher, or colleague conversation. This is currently part of the demo only.", "A future space for documenting conversations with parents, teachers, or other providers. This feature is currently available for demonstration only."],
    ["This is currently a demo with sample data only. Appropriate secure storage must be connected before using real records.", "This demo uses sample data only. Secure storage must be set up before you enter real client information."],
    ["You can explore this demo. Secure storage must be connected before using real records.", "Feel free to explore using the sample data. Secure storage must be set up before you enter real client information."],
    ["The free plan includes one saved board. The full plan allows unlimited boards.", "The free plan includes one saved visual schedule. The full plan includes unlimited visual schedules."],
    ["Create a Family Calendar", "Create a Family Calendar"],
    ["Independent search", "Activity search"],
    ["Drawing is challenging", "Drawing support"],
    ["Drawing a person is challenging", "Drawing a person"],
    ["Clumsy or often bumps into things", "Coordination and body awareness"],
    ["Seeks movement throughout the day", "Movement seeking"],
    ["Force grading", "Grading force"],
    ["Graphomotor skills", "Handwriting readiness"],
    ["Recognising letters", "Recognizing letters"],
    ["Recognising numbers", "Recognizing numbers"],
    ["Recognising colours", "Recognizing colors"]
  ]);

  const phraseRules = [
    [/\bcolourful\b/gi, "colorful"], [/\bcolouring\b/gi, "coloring"], [/\bcolours\b/gi, "colors"], [/\bcolour\b/gi, "color"],
    [/\bfavourites\b/gi, "favorites"], [/\bfavourite\b/gi, "favorite"],
    [/\bcentred\b/gi, "centered"], [/\bcentre\b/gi, "center"],
    [/\bpersonalised\b/gi, "personalized"], [/\bpersonalise\b/gi, "personalize"],
    [/\borganisations\b/gi, "organizations"], [/\borganisation\b/gi, "organization"], [/\borganised\b/gi, "organized"], [/\borganise\b/gi, "organize"],
    [/\bbehaviours\b/gi, "behaviors"], [/\bbehaviour\b/gi, "behavior"],
    [/\bpyjamas\b/gi, "pajamas"], [/\bnappies\b/gi, "diapers"], [/\bnappy\b/gi, "diaper"], [/\btrousers\b/gi, "pants"],
    [/\bprogramme\b/gi, "program"], [/\bgrey\b/gi, "gray"], [/\bpractise\b/gi, "practice"],
    [/\bsavoury\b/gi, "savory"], [/\bforwards\b/gi, "forward"], [/\bbackwards\b/gi, "backward"],
    [/\btorches\b/gi, "flashlights"], [/\btorch\b/gi, "flashlight"],
    [/\bice lollies\b/gi, "popsicles"], [/\bice lolly\b/gi, "popsicle"],
    [/\btowards\b/gi, "toward"], [/\bwhilst\b/gi, "while"], [/\bamongst\b/gi, "among"],
    [/\btick each\b/gi, "check off each"], [/\btick tasks\b/gi, "check off tasks"], [/\btick it\b/gi, "check it off"],
    [/\bcling film\b/gi, "plastic wrap"], [/\baluminium foil\b/gi, "aluminum foil"],
    [/\bat the clinic\b/gi, "in the clinic"], [/\bthe child's setting\b/gi, "the child's school or program"],
    [/\bmotor trail\b/gi, "obstacle course"], [/\broutine board\b/gi, "routine visual schedule"], [/\bweekly board\b/gi, "weekly visual schedule"]
  ];

  function isEnglish() {
    return location.pathname === "/en" || location.pathname.startsWith("/en/") || document.documentElement.lang === "en";
  }

  function polish(value) {
    if (!value || !/[A-Za-z]/.test(value)) return value;
    const leading = value.match(/^\s*/)?.[0] || "";
    const trailing = value.match(/\s*$/)?.[0] || "";
    let core = value.trim();
    core = exact.get(core) || core;
    phraseRules.forEach(([pattern, replacement]) => {
      core = core.replace(pattern, (match) => {
        if (match === match.toUpperCase()) return replacement.toUpperCase();
        if (match[0] === match[0].toUpperCase()) return replacement[0].toUpperCase() + replacement.slice(1);
        return replacement;
      });
    });
    return leading + core + trailing;
  }

  function polishText(node) {
    if (!node?.parentElement || /^(SCRIPT|STYLE|TEXTAREA)$/.test(node.parentElement.tagName)) return;
    const original = node.nodeValue || "";
    const next = polish(original);
    if (next !== original) node.nodeValue = next;
  }

  function polishAttributes(element) {
    if (!element?.getAttribute) return;
    ["title", "aria-label", "placeholder"].forEach((name) => {
      const value = element.getAttribute(name);
      const next = polish(value || "");
      if (value && next !== value) element.setAttribute(name, next);
    });
  }

  function polishRoot(root) {
    if (!isEnglish() || !root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      polishText(root);
      return;
    }
    polishAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) polishText(walker.currentNode);
    root.querySelectorAll?.('[title],[aria-label],[placeholder]').forEach(polishAttributes);
  }

  const queued = new Set();
  let scheduled = false;
  function schedule(root) {
    if (root) queued.add(root);
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const roots = [...queued];
      queued.clear();
      roots.forEach(polishRoot);
    });
  }

  function start() {
    polishRoot(document.body);
    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData" || mutation.type === "attributes") {
          schedule(mutation.target);
        } else {
          mutation.addedNodes.forEach((node) => schedule(node));
        }
      });
    }).observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["title", "aria-label", "placeholder"]
    });
    window.addEventListener("boo_language_change", () => polishRoot(document.body));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
