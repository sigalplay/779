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
    "© בואו נשחק — לשימוש אישי בלבד. המידע והפעילויות אינם מהווים תחליף לייעוץ, אבחון או טיפול מקצועי.": "© Let's Play — for personal use only. The information and activities are not a substitute for professional advice, assessment, or treatment.",
    "מסלול מוטורי": "Motor Trail",
    "כלי יצירה": "Creative Tool",
    "לוחצים על המתקנים מהבנק בסדר הרצוי לבניית המסלול - ומקבלים רשימה ממוספרת מוכנה להדפסה.": "Choose equipment from the bank in the order you want to build a motor trail and get a numbered list ready to print.",
    "ניתן ללחוץ על סימן המשולש כדי לראות כיצד להשתמש במתקן.": "Select the triangle icon to see how to use each piece of equipment.",
    "בנק מתקנים": "Equipment Bank",
    "ארכיון מתקנים": "Equipment Archive",
    "לוחצים על מתקן כדי להוסיף אותו למסלול, בסדר שרוצים.": "Select a piece of equipment to add it to the trail in the order you want.",
    "ציוד בקליניקה": "Clinic Equipment",
    "🏠 מה יש לנו בבית?": "🏠 What do we have at home?",
    "כל המתקנים נוספו למסלול 🎉": "All equipment has been added to the trail 🎉",
    "הוסף אביזר יצירה": "Add a Creative Item",
    "המסלול שלנו": "Our Motor Trail",
    "איפוס": "Reset",
    "בחרו מתקנים מהבנק בצד כדי לבנות את המסלול.": "Choose equipment from the bank to build your motor trail.",
    "איך עושים?": "How do I do it?",
    "איך משתמשים ב": "How to use ",
    "הפעלה": "Play",
    "עצירה": "Pause",
    "הזז למעלה": "Move up",
    "הזז למטה": "Move down",
    "הסרה": "Remove",
    "התחל מסלול": "Start Trail",
    "חזרה לעריכה": "Back to Editing",
    "בהצלחה! עוברים תחנה אחרי תחנה, בסדר.": "Great! Move through the stations one at a time, in order.",
    "הוסף לתכנית הטיפול": "Add to Treatment Plan",
    "עדכון המסלול בתוכנית": "Update Trail in Treatment Plan",
    "הדפסה / שמירה כ-PDF": "Print / Save as PDF",
    "הוספת אביזר יצירה למסלול": "Add a Creative Item to the Trail",
    "בוחרים תחנת יצירה לסיום המסלול, מתוך מאגר התמונות של האתר.": "Choose a creative station from the site's image bank to finish the trail.",
    "כאן נשמרים המתקנים שהוסרת מבנק הקליניקה. אפשר להחזיר אותם למאגר בכל שלב.": "Equipment removed from the clinic bank is stored here. You can return it at any time.",
    "החזרה למאגר": "Return to Bank",
    "החזרת כל המתקנים למאגר": "Return All Equipment",
    "הארכיון ריק": "The Archive is Empty",
    "מתקנים שתסירי מבנק הקליניקה יופיעו כאן.": "Equipment removed from the clinic bank will appear here.",
    "נדנדה": "Swing",
    "מתיישבים במרכז הנדנדה ונשארים יציבים": "Sit in the centre of the swing and keep your body steady.",
    "צלחת וסטיבולרית": "Vestibular Disc Swing",
    "נכנסים לצלחת, מתיישבים בתוכה ומסתובבים בישיבה": "Climb into the disc, sit inside it and spin while seated.",
    "צלחת שיווי משקל": "Balance Board",
    "עולים על הצלחת בשתי רגליים ושומרים על שיווי משקל": "Stand on the board with both feet and keep your balance.",
    "ערסל": "Hammock",
    "מחזיקים בצדדים, נכנסים ומתיישבים בתוך הערסל": "Hold the sides, climb in and sit inside the hammock.",
    "טרמפולינה": "Trampoline",
    "קופצים ונוחתים בשתי רגליים במרכז הטרמפולינה": "Jump and land with both feet in the centre of the trampoline.",
    "מנהרה": "Tunnel",
    "זוחלים על הידיים והברכיים ועוברים דרך המנהרה": "Crawl on hands and knees through the tunnel.",
    "אבנים": "Stepping Stones",
    "דורכים על האבנים אחת אחרי השנייה": "Step on the stones one after another.",
    "חבית קשיחה": "Rigid Barrel",
    "מחזיקים בשפת החבית, מכניסים רגל אחת ונעמדים בתוכה": "Hold the rim, place one foot inside and stand in the barrel.",
    "סולם": "Ladder",
    "מחזיקים בשלבים ומטפסים שלב אחר שלב": "Hold the rungs and climb one step at a time.",
    "קביים": "Stilts",
    "עומדים על הקביים, מותחים את החבלים ומתקדמים בצעדים קטנים": "Stand on the stilts, pull the ropes tight and take small steps.",
    "כדור פיזיו": "Physio Ball",
    "נשכבים על הבטן ומתקדמים קדימה בעזרת הידיים": "Lie on your tummy and move forwards using your hands.",
    "כדור קטן": "Small Ball",
    "מחזיקים בשתי ידיים, זורקים בעדינות ותופסים": "Hold with both hands, throw gently and catch.",
    "סקוטר": "Scooter Board",
    "שוכבים על הבטן במרכז הסקוטר ומתקדמים בדחיפת הרצפה בשתי הידיים": "Lie on your tummy in the centre of the scooter board and push along the floor with both hands.",
    "חישוקים": "Hoops",
    "קופצים בשתי רגליים מחישוק לחישוק": "Jump with both feet from one hoop to the next.",
    "טושים": "Markers",
    "מדבקות": "Stickers",
    "דבק": "Glue",
    "מספריים": "Scissors",
    "דפי צבע": "Coloured Paper",
    "כרית": "Pillow",
    "בקבוק": "Bottle",
    "כיסא": "Chair",
    "שמיכה": "Blanket",
    "קופסת קרטון": "Cardboard Box",
    "כרית ספה": "Couch Cushion",
    "מטאטא": "Broom",
    "חבל או סרט": "Rope or Ribbon"
    ,"גיל 6–12 חודשים": "Ages 6–12 months"
    ,"Ages 6–12 חודשים": "Ages 6–12 months"
    ,"מסלול שקיות תחושה": "Sensory Bag Path"
    ,"מכינים שקיות תחושה במרקמים ובצבעים שונים, מקבעים אותן היטב לרצפה ומאפשרים לתינוק לגעת, ללחוץ, לזחול ולעבור ביניהן.": "Make sensory bags with different textures and colours, secure them firmly to the floor, and let the baby touch, press, crawl and move between them."
    ,"שקיות זיפלוק": "Zip-top Bags"
    ,"סלוטייפ רחב": "Wide Tape"
    ,"מבוגר ממלא כל שקית, מוציא ממנה ככל האפשר את האוויר, סוגר היטב, מחזק את הפתח בסלוטייפ ומדביק את כל ארבעת צדי השקית לרצפה.": "An adult fills each bag, removes as much air as possible, seals it firmly, reinforces the opening with tape, and tapes all four sides to the floor."
    ,"ממלאים שקית בפונפונים ובמים.": "Fill a bag with pom-poms and water."
    ,"ממלאים שקית בצבעי גואש.": "Fill a bag with gouache paint."
    ,"ממלאים שקית במים עם נצנצים או פאייטים.": "Fill a bag with water and glitter or sequins."
    ,"ממלאים שקית במים כחולים ומוסיפים חיות ים קטנות.": "Fill a bag with blue water and add small sea animals."
    ,"ממלאים שקית במים, שמן וצבע מאכל.": "Fill a bag with water, oil and food colouring."
    ,"ממלאים שקית בעדשים ובאורז, מחביאים בתוכה מדבקות ומחפשים אותן דרך השקית.": "Fill a bag with lentils and rice, hide stickers inside, and find them through the bag."
    ,"חקירה חושית": "Sensory exploration"
    ,"חיזוק חגורת כתפיים": "Shoulder-girdle strength"
    ,"חציית קו האמצע": "Crossing the midline"
    ,"תיאום עין–יד": "Hand–eye coordination"
    ,"עידוד זחילה ותנועה במרחב": "Encouraging crawling and movement"
    ,"לתינוק שעדיין אינו זוחל מציגים בכל פעם שקית אחת בזמן שכיבה על הבטן. לתינוק שמתחיל לזחול מסדרים את השקיות ברצף ומעודדים מעבר ביניהן.": "For a baby who is not yet crawling, offer one bag at a time during tummy time. For a baby who is beginning to crawl, arrange the bags in a row and encourage moving between them."
    ,"אפשר להניח צעצוע אהוב מעבר לשקית ולעודד הושטת יד, חציית קו האמצע או זחילה לכיוונו.": "Place a favourite toy beyond a bag to encourage reaching, crossing the midline, or crawling towards it."
    ,"הפעילות מתקיימת בהשגחת מבוגר בלבד. משתמשים בשקיות עבות, סוגרים ומחזקים אותן היטב, בודקים לפני כל שימוש שאין נזילה או קרע ולא מאפשרים לתינוק להכניס את השקית לפה.": "Adult supervision is required. Use strong bags, seal and reinforce them carefully, check for leaks or tears before every use, and do not let the baby put a bag in their mouth."
    ,"בטיחות:": "Safety:"
    ,"קישור לילד/ה — סימון בפלאפון": "Link for the child — tick tasks on a phone"
    ,"קישור ללוח האינטראקטיבי": "Link to the interactive board"
    ,"שלחו את הקישור לפלאפון של הילד/ה, או סרקו את קוד ה־QR. מסמנים כל משימה לאחר שמסיימים אותה.": "Send the link to the child's phone or scan the QR code. Tick each task when it is complete."
    ,"קישור ללוח": "Board link"
    ,"לוח התארגנות יומי": "Daily Routine Board"
    ,"סיימתם משימה? לחצו עליה כדי לסמן ✓": "Finished a task? Tap it to tick it ✓"
    ,"כל הכבוד! סיימתם את כל המשימות 🌟": "Well done! You finished all the tasks 🌟"
    ,"התחלה מחדש": "Start again"
    ,"הקישור אינו מכיל משימות. בקשו קישור חדש ללוח.": "This link has no tasks. Please ask for a new board link."
    ,"צור לוח משלך — בואו נשחק": "Create your own board — Let's Play"
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
    if (trimmed.indexOf("סימון ") === 0) return "Mark " + translateText(trimmed.slice("סימון ".length));
    if (trimmed.indexOf("הדגמת ") === 0) return "Show how to use " + translateText(trimmed.slice("הדגמת ".length));
    if (trimmed.indexOf("מחיקת ") === 0) return "Remove " + translateText(trimmed.slice("מחיקת ".length)).replace(" מהמאגר", " from the bank");
    if (trimmed.indexOf("איך משתמשים ב") === 0) return "How to use " + translateText(trimmed.slice("איך משתמשים ב".length));
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
    let lastLanguage = isEnglish() ? "en" : "he";
    translate(document.body);
    window.addEventListener("boo_language_change", function () {
      const nextLanguage = isEnglish() ? "en" : "he";
      if (lastLanguage === "en" && nextLanguage === "he") {
        window.location.reload();
        return;
      }
      lastLanguage = nextLanguage;
      if (nextLanguage === "en") translate(document.body);
    });
    const observer = new MutationObserver(function (mutations) {
      if (!isEnglish()) return;
      mutations.forEach(function (mutation) {
        if (mutation.type === "characterData") {
          const translated = translateText(mutation.target.nodeValue);
          if (translated !== mutation.target.nodeValue) mutation.target.nodeValue = translated;
          return;
        }
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) translate(node);
          else if (node.nodeType === 3) node.nodeValue = translateText(node.nodeValue);
        });
      });
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
