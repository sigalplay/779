(() => {
  "use strict";

  const exact = new Map([
    ["Let's Play – ideas and tools in one place for home, preschool, and the clinic.", "Practical ideas and tools for home, preschool, and the therapy clinic."],
    ["Build a structured visual schedule for a session", "Plan a Therapy Session"],
    ["Choose a developmental area and duration to plan a structured session.", "Choose a skill area and session length to find activities that support your therapy goals."],
    ["Choose an age, developmental area, and duration to find a suitable activity.", "Choose a skill area and how much time you have to find an activity that fits your child."],
    ["Daily Routine Visual Schedule", "Daily Visual Schedule"],
    ["ADL החזותי", "Daily Living Skills: Step-by-Step Visuals"],
    ["Create a Family Calendar", "Create a Family Calendar"],
    ["Experiments", "Kids’ Science Experiments"],
    ["Recipes", "Kid-Friendly Recipes"],

    ["My saved plans", "Saved Plans"],
    ["My Saved Plans", "Saved Plans"],
    ["Obstacle course", "Obstacle Course Builder"],
    ["Activity search", "Find Activities"],
    ["Creative activities", "Creative Activities"],
    ["Make-and-play games", "Games to Make and Play"],
    ["Sensory activities", "Sensory Activities"],
    ["Movement activities", "Movement Activities"],
    ["Social games", "Social Play Activities"],
    ["Developmental area", "Skill Area"],
    ["Grading force", "Force Modulation"],
    ["Force grading", "Force Modulation"],
    ["Activity duration", "Activity Length"],
    ["Up to 15 minutes", "Up to 15 Minutes"],
    ["15 minutes or more", "15 Minutes or Longer"],
    ["Matching activities", "Matching Activities"],
    ["Full view", "View Details"],
    ["Treatment plan", "Session Plan"],
    ["Treatment Plan", "Session Plan"],
    ["Take a photo and add it to the plan", "Take a Photo and Add It to the Plan"],
    ["No activities have been added yet. Select Add to Treatment Plan to begin.", "No activities added yet. Select “Add to Session Plan” to get started."],
    ["Start session", "Start Session"],
    ["Plan name", "Session Plan Name"],
    ["Save plan", "Save Plan"],
    ["Reset treatment plan", "Clear Session Plan"],
    ["Add to plan", "Add to Session Plan"],
    ["Add to Plan", "Add to Session Plan"],

    ["חזרה לבניית טיפול", "Back to Session Planner"],
    ["חזרה לבניית הטיפול", "Back to Session Planner"],
    ["חזרה לבניית תכנית טיפול", "Back to Session Planner"],
    ["הוספת מסלול מוטורי", "Add an Obstacle Course"],
    ["יצירה", "Creative Activity"],
    ["ניסויים", "Science Experiment"],
    ["תנועה", "Movement"],
    ["תפקודים ניהוליים", "Executive Function"],
    ["הכנה לכיתה א׳", "School Readiness"],
    ["הכנה לכיתה א'", "School Readiness"],
    ["ויסות כוח", "Force Modulation"],
    ["טקטילית", "Tactile Processing"],
    ["🖼️ איורי ציוד ושלבים", "🖼️ Illustrations"],
    ["איורי ציוד ושלבים", "Illustrations"],
    ["מוצגים", "On"],
    ["מוסתרים", "Off"],

    ["Activity description", "About This Activity"],
    ["Downloads and printables", "Downloads and Printables"],
    ["How to play", "How to Play"],
    ["Make it easier", "Make It Easier"],
    ["Add a challenge", "Make It More Challenging"],
    ["Developmental skills supported", "Skills Practiced"],
    ["Show tags", "Show Tags"],
    ["Hide tags", "Hide Tags"],
    ["Touch", "Tactile Processing"],

    ["Shark Teeth", "Shark Teeth Play Dough Activity"],
    ["Fill the shark’s large round mouth with playdough, then insert short pieces of cotton buds around the edge to make teeth.", "Cover the shark’s large, round mouth with red play dough. Then push short pieces of cotton swabs around the edge to create the shark’s teeth."],
    ["Shark sheet with a large round mouth", "Printable shark template with a large, round mouth"],
    ["Red playdough", "Red play dough"],
    ["Cotton buds cut into short pieces", "Cotton swabs, cut into short pieces by an adult"],
    ["Colour shark printable — PDF", "Color Shark Printable (PDF)"],
    ["Color shark printable — PDF", "Color Shark Printable (PDF)"],
    ["Black-and-white shark printable — PDF", "Black-and-White Shark Printable (PDF)"],
    ["An adult prints the friendly shark sheet and cuts the cotton buds into short pieces in advance. Small pieces must be used with adult supervision and are not suitable for children who put objects in their mouths.", "Before the activity, an adult should print the shark template and cut the cotton swabs into short pieces. Always supervise children closely. This activity includes small pieces and is not appropriate for children who may put them in their mouths."],
    ["Colour the shark, leaving the large round mouth area blank.", "Color the shark, leaving the large, round mouth area blank."],
    ["Color the shark, leaving the large round mouth area blank.", "Color the shark, leaving the large, round mouth area blank."],
    ["Press and spread red playdough across the whole circle.", "Press and spread the red play dough to cover the entire circle."],
    ["Insert the short cotton-bud pieces around the edge of the circle to make the shark’s teeth.", "Push the short cotton-swab pieces into the play dough around the edge of the circle to create the shark’s teeth."],
    ["Prepare a thick layer of playdough, use fewer pieces, or mark dots around the mouth to show where each tooth should go.", "Use a thicker layer of play dough, offer fewer pieces, or add dots around the mouth to show where each tooth goes."],
    ["Count the teeth, compare the two sides, make a repeating pattern, or remove the teeth with tweezers and insert them again.", "Have the child count the teeth, compare the two sides, create a repeating pattern, or use tweezers to remove and replace the teeth."],

    ["Pomegranate Seeds Craft", "Pomegranate Seed Counting Craft"],
    ["Make pomegranate seeds from red crepe paper, roll a die, and glue on the matching number of seeds each turn.", "Roll small pieces of red crepe paper into pomegranate seeds. Roll the die, then glue on the matching number of seeds."],
    ["Printable pomegranate sheet — PDF", "Pomegranate Printable (PDF)"],
    ["Print the pomegranate sheet or prepare paper and a black marker for drawing one.", "Print the pomegranate template, or draw a pomegranate on a sheet of paper using a black marker."],
    ["Draw a pomegranate or use the printable.", "Draw a pomegranate, or use the printable template."],
    ["Cut red crepe paper into small pieces and roll them into seeds using the fingers.", "Cut the red crepe paper into small pieces. Roll each piece into a small ball to make a seed."],
    ["Roll the die and glue on that number of seeds each turn.", "Roll the die and glue that number of seeds onto the pomegranate. Repeat until the pomegranate is full."],
    ["Prepare small crepe-paper pieces, use a die with quantities 1–3, or ask an adult to help apply glue.", "Cut the crepe paper into small pieces ahead of time. Use a die showing only 1–3, or have an adult help with the glue."],
    ["Continue until the pomegranate is full, compare quantities, or add the totals from two dice.", "Compare the number of seeds on each side of the pomegranate, create a pattern, or roll two dice and add the numbers together."],

    ["Surprise in a Jar", "What’s Hiding in the Jar?"],
    ["Use a flashlight to reveal illustrations hidden inside paper jars.", "Shine a flashlight behind the paper jars to reveal the hidden pictures."],
    ["Illustration sheet", "Picture Sheet"],
    ["Jar sheet", "Jar Template"],
    ["Print the jar and illustration sheets.", "Print the jar template and picture sheet."],
    ["Glue the jar sheet over the illustration sheet, aligning the boxes.", "Glue the jar template on top of the picture sheet, making sure the boxes line up."],
    ["Cut out each jar separately.", "Cut out each jar separately."],
    ["Shine a flashlight beneath the jar to reveal the hidden picture.", "Hold a flashlight behind each jar to reveal the hidden picture."],
    ["School readiness: Use letters or numbers as the hidden pictures.", "School Readiness Tip: Hide letters or numbers inside the jars for extra practice."],
    ["Prepare and cut fewer jars.", "Prepare the jars in advance and use fewer of them."],
    ["Use the jars to practice letters and numbers.", "Ask the child to name each hidden letter or number, match it to another card, or find it in a word."],

    ["Colourful Flower", "Rainbow Paper Towel Flower"],
    ["Colorful Flower", "Rainbow Paper Towel Flower"],
    ["Prepare a dry plate and a small cup of water with a dropper.", "Set out a dry plate, a small cup of water, and a dropper."],
    ["Draw a large flower with wide petals on a paper towel.", "Draw a large flower with wide petals on a paper towel."],
    ["Cut around the outline.", "Cut around the outline of the flower."],
    ["Color a ring around the center.", "Use the markers to color a thick ring around the center of the flower."],
    ["Place the flat flower on a dry plate.", "Lay the flower flat on a dry plate."],
    ["Drop water into the center and watch the colors travel to the petal tips.", "Use the dropper to add a few drops of water to the center. Watch the colors spread toward the tips of the petals."],
    ["Prepare a pre-cut flower for the child to color and add water to.", "Provide a pre-cut flower for the child to color and add water to."],
    ["Make flowers in different sizes and compare which reaches the petal tips first.", "Make flowers in different sizes and predict which flower’s colors will reach the petal tips first."]
  ]);

  const rules = [
    [/^Check off each item when ready · Select an item to enlarge it · (\d+)\/(\d+)$/, "Check off each material as you gather it. Select an item to enlarge it. $1 of $2 ready."],
    [/^Check off each step when completed · Select a step to enlarge it · Select a word to highlight it · (\d+)\/(\d+)$/, "Check off each step as you go. Select an illustration to enlarge it or a word to highlight it. $1 of $2 complete."],
    [/^(\d+) Other activities$/, "$1 More Activities"],
    [/^(\d+) items$/, "$1 Activities"],
    [/\bcotton buds\b/gi, "cotton swabs"],
    [/\bcotton-bud\b/gi, "cotton-swab"],
    [/\bplaydough\b/gi, "play dough"]
  ];

  function isEnglish() {
    try { return document.documentElement.lang === "en" || localStorage.getItem("boo_nesahek_language") === "en"; }
    catch (_) { return document.documentElement.lang === "en"; }
  }

  function improve(value) {
    if (!value) return value;
    const before = value.match(/^\s*/)?.[0] || "";
    const after = value.match(/\s*$/)?.[0] || "";
    let core = value.trim();
    core = exact.get(core) || core;
    if (/\/activity\/seed-110\/?$/.test(location.pathname) && core === "Water") core = "Small Cup of Water";
    rules.forEach(([pattern, replacement]) => { core = core.replace(pattern, replacement); });
    return before + core + after;
  }

  function improveRoot(root) {
    if (!isEnglish() || !root) return;
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      if (!node.parentElement || /^(SCRIPT|STYLE|TEXTAREA)$/.test(node.parentElement.tagName)) return;
      const next = improve(node.nodeValue || "");
      if (next !== node.nodeValue) node.nodeValue = next;
      if (node.nodeValue.trim() === "You can return to this page at any time and move between tools using the top menu.") {
        node.parentElement.hidden = true;
      }
    });
    root.querySelectorAll?.("[title],[aria-label],[placeholder],[value]").forEach((element) => {
      ["title", "aria-label", "placeholder", "value"].forEach((name) => {
        const value = element.getAttribute(name);
        if (!value) return;
        const next = improve(value);
        if (next !== value) element.setAttribute(name, next);
      });
    });
  }

  let pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; improveRoot(document.body); });
  }

  function start() {
    schedule();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
    window.addEventListener("boo_language_change", schedule);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
