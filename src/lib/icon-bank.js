/**
 * "בנק האיורים" - שכבת התאמה לפי מילות מפתח שמשתמשת בתמונות אמיתיות
 * (לא SVG מצויר) שהועלו על ידי המשתמשת, במקום ציור עצמי.
 * עדיפות בשרשרת ההתאמה: קודם ACTIVITY_ICON_SETS (מותאם לפעילות ספציפית),
 * אז הבנק הזה (תמונות אמיתיות לפי מילת מפתח), אחר כך icon-library.jsx
 * (SVG מצויר), ולבסוף אימוג'י כברירת מחדל.
 */

const BASE = "/icon-bank";

// מיפוי ישיר: מילת מפתח (regex) -> נתיב קובץ תמונה
const MATERIAL_BANK_RULES = [
  [/תפוח אדום|תפוח\b(?! אדמה)/, `${BASE}/fruits-vegetables/red-apple.webp`],
  [/בננה/, `${BASE}/manual/bananas.webp`],
  [/תפוז/, `${BASE}/fruits-vegetables/orange.webp`],
  [/אגס/, `${BASE}/fruits-vegetables/pear.webp`],
  [/אבטיח/, `${BASE}/fruits-vegetables/watermelon-slice.webp`],
  [/מלון/, `${BASE}/fruits-vegetables/melon.webp`],
  [/ענבים/, `${BASE}/fruits-vegetables/grapes.webp`],
  [/תות שדה|תות\b/, `${BASE}/manual/strawberry-2.webp`],
  [/פטל/, `${BASE}/fruits-vegetables/raspberry.webp`],
  [/אפרסק/, `${BASE}/fruits-vegetables/peach.webp`],
  [/שזיף/, `${BASE}/fruits-vegetables/plum.webp`],
  [/מנגו/, `${BASE}/fruits-vegetables/mango.webp`],
  [/עגבניה|עגבנייה/, `${BASE}/manual/tomato-2.webp`],
  [/מלפפון/, `${BASE}/manual/cucumber-2.webp`],
  [/פלפל/, `${BASE}/manual/red-pepper-2.webp`],
  [/חציל/, `${BASE}/fruits-vegetables/eggplant.webp`],
  [/קישוא/, `${BASE}/fruits-vegetables/zucchini.webp`],
  [/תירס/, `${BASE}/fruits-vegetables/corn.webp`],
  [/גזר/, `${BASE}/fruits-vegetables/carrot.webp`],
  [/תפוח אדמה|תפו"א/, `${BASE}/fruits-vegetables/potato.webp`],
  [/בצל/, `${BASE}/fruits-vegetables/onion.webp`],
  [/שום/, `${BASE}/fruits-vegetables/garlic.webp`],
  [/צנונית/, `${BASE}/fruits-vegetables/radish.webp`],
  [/סלק/, `${BASE}/fruits-vegetables/beet.webp`],
  [/חסה/, `${BASE}/manual/lettuce-2.webp`],
  [/כרוב\b/, `${BASE}/fruits-vegetables/cabbage.webp`],
  [/ברוקולי/, `${BASE}/fruits-vegetables/broccoli.webp`],
  [/כרובית/, `${BASE}/fruits-vegetables/cauliflower.webp`],
  [/תרד/, `${BASE}/fruits-vegetables/spinach.webp`],
  [/פטרוזיליה/, `${BASE}/fruits-vegetables/parsley.webp`],
  [/דלעת/, `${BASE}/fruits-vegetables/pumpkin.webp`],
  [/אבוקדו/, `${BASE}/fruits-vegetables/avocado.webp`],
  [/פטריות/, `${BASE}/fruits-vegetables/mushrooms.webp`],
  [/אפונה/, `${BASE}/fruits-vegetables/peas.webp`],
  [/אספרגוס/, `${BASE}/fruits-vegetables/asparagus.webp`],
  [/לימון/, `${BASE}/fruits-vegetables/lemon.webp`],

  // הערה: כללי kitchen-crafts ו-kitchen-toast-steps (הגליונות הגדולים)
  // הוסרו לצמיתות - התגלו כשלים בתמונות המקור עצמן. הכללים החדשים
  // למטה משתמשים בתמונות "manual" - כל אחת הועלתה ואומתה בנפרד.
  [/מטרפה|וויסק/, `${BASE}/manual/whisk-labeled.webp`],
  [/תבנית אפייה/, `${BASE}/manual/baking-tray-2.webp`],
  [/ביצ(ה|ים)/, `${BASE}/manual/egg-single.webp`],
  [/מרית/, `${BASE}/manual/spatula-red.webp`],
  [/סוכר/, `${BASE}/manual/sugar-bag.webp`],
  [/חלב/, `${BASE}/manual/milk-carton-2.webp`],
  [/קרואסון/, `${BASE}/manual/croissant-2.webp`],
  [/פנקייק/, `${BASE}/manual/pancakes-2.webp`],
  [/אגוזים/, `${BASE}/manual/nuts-2.webp`],
  [/קמח/, `${BASE}/manual/flour-bag.webp`],
  [/עיפרון|עט\b/, `${BASE}/manual/pencil-2.webp`],
  [/עפרונות צבעוניים|צבעי\s?עפרון/, `${BASE}/manual/colored-pencils-box.webp`],
  [/מחק/, `${BASE}/manual/eraser-2.webp`],
  [/קלמר/, `${BASE}/manual/pencil-case.webp`],
  [/מספריים/, `${BASE}/manual/scissors-2.webp`],
  [/חוט(ים)?\b/, `${BASE}/manual/yarn-ball.webp`],
  [/מדבק(ה|ות)|כפתור(ים)?/, `${BASE}/manual/buttons-grid.webp`],
  [/סרגל/, `${BASE}/manual/ruler-2.webp`],
  [/ממרח שוקולד|נוטלה/, `${BASE}/manual/chocolate-spread-jar-3.webp`],
  [/פומפונים|פונפונים/, `${BASE}/manual/pompoms-bag-2.webp`],
  [/מקלות ארטיק/, `${BASE}/manual/popsicle-sticks-2.webp`],
  [/דבק/, `${BASE}/crafts-new/shared-independent/glue.webp`],
  [/קרטון|בריסטול/, `${BASE}/manual/cardboard-sheets.webp`],
  [/נייר צבעוני/, `${BASE}/manual/colored-paper-sheets.webp`],
  [/נצנצים|glitter/, `${BASE}/manual/glitter-jars.webp`],
  [/פלסטלינה|בצק משחק/, `${BASE}/crafts-new/seed-63-independent/material-plasticine.webp`],
  [/בצק מרודד|מרודד/, `${BASE}/manual/rolled-dough.webp`],
  [/גיר(ים)?\b/, `${BASE}/manual/chalk-sticks-2.webp`],
  [/כרטיסיות|קלפים/, `${BASE}/manual/star-cards.webp`],
  [/שעון( חול)?|טיימר/, `${BASE}/manual/hourglass.webp`],
  [/קוצץ ציפורניים/, `${BASE}/manual/nail-clipper-pink.webp`],
  [/מקרר/, `${BASE}/manual/chocolate-lollipops-fridge-tool.webp`],
  [/מיקרוגל/, `${BASE}/manual/microwave-2.webp`],
  [/תנור|כיריים/, `${BASE}/manual/stove-oven.webp`],
  [/סביבון(ים)?/, `${BASE}/manual/dreidel.webp`],
  [/פאזל/, `${BASE}/manual/puzzle-pieces.webp`],
  [/פומפייה/, `${BASE}/manual/grater-2.webp`],
  [/שיפוד(ים)?/, `${BASE}/manual/skewers-bundle.webp`],
  [/כפית|כף\b/, `${BASE}/manual/spoon-simple.webp`],
  [/סכין/, `${BASE}/manual/knife-alone.webp`],
  [/קער(ה|ות)/, `${BASE}/manual/bowl-blue.webp`],
  [/שוקולית|קקאו/, `${BASE}/manual/cocoa-jar-small.webp`],
  [/ביסקוויט|עוגיות/, `${BASE}/manual/chocolate-balls-new/chocolate-balls-biscuits.webp`],
  [/כדורי שוקולד/, `${BASE}/manual/chocolate-balls-pile.webp`],
  [/פיצה/, `${BASE}/manual/pizza-round.webp`],
  [/חבילת שוקולד|שוקולד\b/, `${BASE}/manual/chocolate-chunks.webp`],
  [/סודה לשתייה|אבקת סודה/, `${BASE}/manual/experiments/lava-lamp-material-2.webp`],
  [/שמן צמחי|שמן\b/, `${BASE}/manual/experiments/lava-lamp-material-3.webp`],
  [/חומץ/, `${BASE}/manual/experiments/lava-lamp-material-4.webp`],
  [/צבעי? מאכל/, `${BASE}/manual/experiments/lava-lamp-material-5.webp`],
  [/סבון כלים|סבון נוזלי/, `${BASE}/embedded-v358/seed-84/material-soap.webp`],
  [/מקלון אוזניים|קיסם אוזניים/, `${BASE}/manual/experiments/new-experiments-cotton-swabs.webp`],
  [/נייר סופג/, `${BASE}/crafts-new/seed-101-illustrated/material-paper-towel.webp`],
  [/נר קטן|נר\b/, `${BASE}/manual/experiments/vacuum-lift-material-4.webp`],
  [/מצית/, `${BASE}/manual/experiments/vacuum-lift-material-6.webp`],
  [/דבש/, `${BASE}/manual/fruit-popsicles/honey.webp`],
  [/קורנפלור|אבקת טלק/, `${BASE}/embedded-v358/seed-84/material-cornstarch.webp`],

  [/חבית קשיחה|חבית מוטורית/, `${BASE}/motor-equipment/barrel-motor.webp`],
  [/טרמפולינה/, `${BASE}/motor-equipment/personal-trampoline.webp`],
  [/ערסל|נדנדה עוטפת/, `${BASE}/motor-equipment/hammock-swing.webp`],
  [/סולם חבלים/, `${BASE}/motor-equipment/rope-ladder.webp`],
  [/קוביית טיפוס|טיגרה/, `${BASE}/motor-equipment/climbing-cube-tiger.webp`],
  [/מנהרה|מנהרת זחילה/, `${BASE}/motor-equipment/crawl-tunnel.webp`],
  [/כדור פיזיו|כדור גדול/, `${BASE}/motor-equipment/big-physio-ball.webp`],
  [/קיר טיפוס|קיר טפוס/, `${BASE}/motor-equipment/small-climbing-wall-1.webp`],
  [/נדנדת קרש/, `${BASE}/motor-equipment/plank-swing.webp`],
  [/שיווי משקל/, `${BASE}/motor-equipment/balance-course.webp`],
  [/סליידר|לוח החלקה/, `${BASE}/motor-equipment/slide-board.webp`],
  [/אופני איזון|בייק/, `${BASE}/motor-equipment/balance-bike-1.webp`],
  [/מסלול זחילה|מכשולים/, `${BASE}/motor-equipment/obstacle-crawl-course.webp`],
  [/נדנדת ברך|כיסא נדנדה/, `${BASE}/motor-equipment/rocking-chair-swing.webp`],
  [/רשת טיפוס/, `${BASE}/motor-equipment/climbing-net-1.webp`],
  [/כדור איזון קטן|כדורון/, `${BASE}/motor-equipment/small-balance-ball.webp`],
];

const STEP_BANK_RULES = [
  [/מורח(ים)? שוקולד|ממרח שוקולד/, `${BASE}/manual/spreading-chocolate-knife-1.webp`],
  [/סוגר(ים)? עם.*ביסקוויט|סוגר(ים)? עם.*לחם/, `${BASE}/manual/bread-plain-2.webp`],
  [/קורצ(ים)? צורה|חיתוך צורה/, `${BASE}/manual/bread-heart-cutout.webp`],
  [/מכניס(ים)? לטוסטר/, `${BASE}/manual/toaster-open-heart-toasted.webp`],
  [/משחיל(ים)? חרוזים|השחלת חרוזים/, `${BASE}/manual/stringing-beads-hand.webp`],
  [/שמים בכוס.*סוכר|שוקולית/, `${BASE}/manual/cocoa-jar-small.webp`],
  [/מוסיפים.*חלב/, `${BASE}/manual/milk-carton-2.webp`],
  [/גוזר(ים)?|גזירה/, `${BASE}/manual/scissors-2.webp`],
  [/מדביק(ים)?|הדבקה/, `${BASE}/manual/glue-bottle.webp`],
  [/מגלגל(ים)? פלסטלינה/, `${BASE}/crafts-new/seed-63-independent/material-plasticine.webp`],
  [/שוברים ביסקוויטים|קוצץ/, `${BASE}/manual/cookie-stack.webp`],
  [/ממיסים.*מיקרו|שוקולד ושמנת/, `${BASE}/manual/chocolate-chunks.webp`],
  [/מכינים כדורים|טובלים בסוכריות/, `${BASE}/manual/chocolate-balls-pile.webp`],
];

export function bankMaterialIcon(text) {
  const t = text || "";
  for (const [re, path] of MATERIAL_BANK_RULES) if (re.test(t)) return path;
  return null;
}

export function bankStepIcon(text) {
  const t = text || "";
  for (const [re, path] of STEP_BANK_RULES) if (re.test(t)) return path;
  return null;
}
