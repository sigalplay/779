(function () {
  "use strict";

  const translations = {
    "התנסות במאכלים": "Food exploration",
    "רכבת האוכל": "The Food Train",
    "דובי על פרוסת לחם": "Teddy Bear Toast",
    "בונים על הצלחת רכבת ממאכלים מוכרים וממאכל אחד שעדיין לומדים להכיר — התנסות משחקית ללא חובה לטעום.": "Build a train on a plate using familiar foods and one food the child is still learning about — playful exploration with no pressure to taste.",
    "יוצרים פני דובי על פרוסת לחם בעזרת פרוסות בננה ואוכמניות — התנסות משחקית במאכלים ללא חובה לטעום.": "Create a teddy bear face on a slice of bread using banana slices and blueberries — playful food exploration with no pressure to taste.",
    "צלחת": "Plate",
    "קרקרים או ביסקוויטים מלוחים": "Crackers or savoury biscuits",
    "פרוסות מלפפון": "Cucumber slices",
    "מקלות בייגלה": "Pretzel sticks",
    "כמה מאכלים מוכרים": "A few familiar foods",
    "מאכל אחד שלומדים להכיר": "One food the child is learning about",
    "פרוסת לחם": "Slice of bread",
    "פרוסות בננה": "Banana slices",
    "אוכמניות או מאכל עגול אחר": "Blueberries or another round food",
    "ממרח מוכר — לבחירה": "A familiar spread — optional",
    "בוחרים יחד כמה מאכלים אהובים ומוסיפים מאכל אחד שהילד עדיין לומד להכיר. חותכים מראש בהתאם לגיל ובליווי מבוגר.": "Choose a few favourite foods together and add one food the child is still learning about. Cut everything in advance according to the child's age, with adult supervision.",
    "בוחרים יחד כמה מאכלים לבניית הרכבת.": "Choose several foods together for building the train.",
    "מסדרים מקרקרים או מביסקוויטים מלוחים קטר וכמה קרונות.": "Arrange crackers or savoury biscuits to make an engine and several carriages.",
    "מוסיפים לכל הקרונות גלגלים מפרוסות מלפפון ומחברים ביניהם במקלות בייגלה.": "Add cucumber-slice wheels to every carriage and connect the carriages with pretzel sticks.",
    "ממלאים כל קרון במטען אחד בלבד: למשל קורנפלקס, פרי, גבינה, בייגלה או ירק.": "Fill each carriage with one kind of cargo, such as cereal, fruit, cheese, pretzels, or vegetables.",
    "נותנים שמות לקרונות, סופרים אותם ומחליטים לאן הרכבת נוסעת.": "Name the carriages, count them, and decide where the train is going.",
    "בסיום הילד בוחר אם לטעום משהו מהרכבת. אין חובה לטעום.": "At the end, the child can choose whether to taste something from the train. Tasting is not required.",
    "מתחילים רק ממאכלים מוכרים ומניחים מאכל חדש ליד הרכבת. גם הסתכלות, בחירה, מגע, סידור או הרחה הם התנסות.": "Begin with familiar foods only and place a new food beside the train. Looking, choosing, touching, arranging, or smelling all count as exploration.",
    "אפשר ליצור תחנות, למיין מטענים או לבנות רכבת ארוכה יותר.": "Create stations, sort the cargo, or build a longer train.",
    "לא הופכים את הפעילות ל׳מי שטועם מנצח׳ ולא נותנים פרס על אכילה.": "Do not turn the activity into a tasting contest, and do not offer a reward for eating.",
    "מכינים את המאכלים וחותכים מראש בהתאם לגיל ובליווי מבוגר.": "Prepare the foods and cut them in advance according to the child's age, with adult supervision.",
    "מניחים פרוסת לחם במרכז הצלחת — זו הפנים של הדובי.": "Place a slice of bread in the centre of the plate — this is the teddy bear's face.",
    "אם רוצים, מורחים על הלחם ממרח שהילד מכיר.": "If desired, spread a familiar topping on the bread.",
    "מניחים שתי פרוסות בננה כאוזניים.": "Place two banana slices as ears.",
    "מניחים פרוסת בננה נוספת במרכז בתור אף.": "Place another banana slice in the centre as a nose.",
    "מוסיפים שתי אוכמניות, או מאכל עגול אחר, בתור עיניים ומשחקים עם הדובי.": "Add two blueberries, or another round food, as eyes and play with the teddy bear.",
    "אפשר להניח את הרכיבים ליד הלחם ולאפשר לילד לבחור במה לגעת ומה להניח. אין חובה לטעום.": "Place the ingredients beside the bread and let the child choose what to touch and what to add. Tasting is not required.",
    "אפשר לתת לדובי שם, להכין לו חבר או ליצור הבעות שונות.": "Give the teddy bear a name, make it a friend, or create different facial expressions.",
    "גם הסתכלות, בחירה, מגע, סידור או הרחה הם חלק מההתנסות.": "Looking, choosing, touching, arranging, or smelling are all part of the exploration.",
    "אוכל": "Food",
    "חשיפה": "Exposure",
    "רכבת": "Train",
    "דובי": "Teddy bear",
    "מחולל לוח התארגנות יומי": "Daily Routine Board Builder",
    "מחולל לוח התארגנות יומי — בואו נשחק": "Daily Routine Board Builder — Let's Play",
    "בחרו פעולות, סדרו אותן והכינו לוח יומי אישי עם תיבות סימון.": "Choose activities, arrange them, and create a personal daily board with checkboxes.",
    "חזרה לבית": "Back to Home",
    "כותרת הלוח": "Board title",
    "הלוח היומי שלי": "My Daily Routine",
    "פעולה אישית": "Custom activity",
    "הוספה": "Add",
    "הדפסה / הורדה": "Print / Download",
    "ניקוי הלוח": "Clear board",
    "בחרו פעולות כדי להתחיל לבנות את הלוח": "Choose activities to start building your board",
    "קימה": "Wake up",
    "צחצוח שיניים": "Brush teeth",
    "לבוש": "Get dressed",
    "ארוחת בוקר": "Breakfast",
    "ארגון התיק": "Pack the bag",
    "בית ספר": "School",
    "גן": "Preschool",
    "חזרה הביתה": "Return home",
    "ארוחת צהריים": "Lunch",
    "שיעורי בית": "Homework",
    "משחק עם חברים": "Play with friends",
    "גינה": "Playground",
    "יצירה": "Arts and crafts",
    "קריאה": "Reading",
    "סידור משחקים": "Tidy up toys",
    "זמן מסך": "Screen time",
    "מקלחת": "Bath",
    "לבישת פיג׳מה": "Put on pyjamas",
    "סיפור לפני השינה": "Bedtime story",
    "שינה": "Sleep",
    "© בואו נשחק — לשימוש אישי בלבד. המידע והפעילויות אינם מהווים תחליף לייעוץ, אבחון או טיפול מקצועי.": "© Let's Play — for personal use only. The information and activities are not a substitute for professional advice, assessment, or treatment."
  };

  function isEnglish() {
    try { return localStorage.getItem("boo_nesahek_language") === "en"; }
    catch (_) { return document.documentElement.lang === "en"; }
  }

  function translateText(text) {
    const exact = translations[text];
    if (exact) return exact;
    const trimmed = text.trim();
    if (!trimmed) return text;
    if (translations[trimmed]) return text.replace(trimmed, translations[trimmed]);
    if (trimmed.indexOf("סימון ") === 0) return "Mark " + translateText(trimmed.slice(6));
    if (trimmed === "העברה למעלה") return "Move up";
    if (trimmed === "העברה למטה") return "Move down";
    if (trimmed === "מחיקה") return "Delete";
    return text;
  }

  function translate(root) {
    if (!isEnglish()) return;
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    document.title = translateText(document.title);
    const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (node) {
      if (node.parentElement && !/^(SCRIPT|STYLE)$/.test(node.parentElement.tagName)) {
        node.nodeValue = translateText(node.nodeValue);
      }
    });
    (root || document).querySelectorAll("[placeholder],[aria-label],[title],[value]").forEach(function (el) {
      ["placeholder", "aria-label", "title", "value"].forEach(function (name) {
        const value = el.getAttribute(name);
        if (value) el.setAttribute(name, translateText(value));
      });
    });
  }

  function start() {
    translate(document.body);
    const observer = new MutationObserver(function (mutations) {
      if (!isEnglish()) return;
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) translate(node);
          else if (node.nodeType === 3) node.nodeValue = translateText(node.nodeValue);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
