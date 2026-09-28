/**
 * "בנק האיורים" - שכבת התאמה לפי מילות מפתח שמשתמשת בתמונות אמיתיות
 * (לא SVG מצויר) שהועלו על ידי המשתמשת, במקום ציור עצמי.
 * עדיפות בשרשרת ההתאמה: קודם ACTIVITY_ICON_SETS (מותאם לפעילות ספציפית),
 * אז הבנק הזה (תמונות אמיתיות לפי מילת מפתח), אחר כך icon-library.jsx
 * (SVG מצויר), ולבסוף אימוג'י כברירת מחדל.
 */

const BASE = "/icon-bank";

// בנק המזון: פירות, ירקות, מצרכים וכלי מטבח שצוירו לבנק. מילה שלמה בלבד,
// כדי ש"גזרו" לא יקבל גזר ו"תפוח אדמה" לא יקבל תפוח.
// אפשר אות שימוש אחת לפני המילה: "ומחק", "הקמח", "בסיר", "לגזר", "כחמאה".
const W = "(?<![א-ת])[והבלכ]?";
const E = "(?![א-ת])";
export const FOOD_ITEMS = [
  // ריבה ראשונה, כדי ש"ריבת תות" תקבל ריבה ולא תות.
  // עגבניות שרי לפני עגבנייה, חמאת בוטנים לפני חמאה, מסחטה לפני לימון.
  { label: "עגבניות שרי", image: `${BASE}/food/cherry-tomatoes.webp`, re: new RegExp(`${W}עגבני(ות|יות|ית|יית) שרי${E}`) },
  { label: "חמאת בוטנים", image: `${BASE}/food/peanut-butter.webp`, re: new RegExp(`${W}חמאת בוטנים${E}`) },
  { label: "מסחטת לימון", image: `${BASE}/food/lemon-squeezer.webp`, re: new RegExp(`${W}מסחט(ה|ת)${E}`) },
  { label: "ריבה", image: `${BASE}/food/jam.webp`, re: new RegExp(`${W}ריב(ה|ת|ות)${E}`) },
  { label: "תפוח", image: `${BASE}/food/apple.webp`, re: new RegExp(`${W}תפוח(ים)?${E}(?! אדמה)`) },
  { label: "תפוז", image: `${BASE}/food/orange.webp`, re: new RegExp(`${W}תפוז(ים)?${E}`) },
  { label: "גזר", image: `${BASE}/food/carrot.webp`, re: new RegExp(`${W}גזר(ים)?${E}`) },
  { label: "עגבנייה", image: `${BASE}/food/tomato.webp`, re: new RegExp(`${W}עגבני(ה|יה|ות|יות|ת שרי)${E}`) },
  { label: "ענבים", image: `${BASE}/food/grapes.webp`, re: new RegExp(`${W}ענב(ים)?${E}`) },
  { label: "תות", image: `${BASE}/food/strawberry.webp`, re: new RegExp(`${W}תות(ים)?${E}`) },
  { label: "אבטיח", image: `${BASE}/food/watermelon.webp`, re: new RegExp(`${W}אבטיח(ים)?${E}`) },
  { label: "פלפל", image: `${BASE}/food/red-pepper.webp`, re: new RegExp(`${W}פלפל(ים)?${E}(?! שחור)`) },
  { label: "גבינה", image: `${BASE}/food/cheese.webp`, re: new RegExp(`${W}גבינ(ה|ת|ות)${E}`) },
  { label: "יוגורט", image: `${BASE}/food/yogurt.webp`, re: new RegExp(`${W}יוגורט(ים)?${E}`) },
  { label: "ביצה", image: `${BASE}/food/egg.webp`, re: new RegExp(`${W}ביצ(ה|ים)${E}`) },
  { label: "פסטה", image: `${BASE}/food/pasta.webp`, re: new RegExp(`${W}פסטה${E}`) },
  { label: "סוכר", image: `${BASE}/food/sugar.webp`, re: new RegExp(`${W}סוכר${E}`) },
  { label: "חמאה", image: `${BASE}/food/butter.webp`, re: new RegExp(`${W}חמאה${E}`) },
  { label: "לימון", image: `${BASE}/food/lemon.webp`, re: new RegExp(`${W}לימו(ן|נים)${E}`) },
  { label: "בננה", image: `${BASE}/food/banana.webp`, re: new RegExp(`${W}בננ(ה|ות)${E}`) },
  { label: "תפוח אדמה", image: `${BASE}/food/potato.webp`, re: new RegExp(`${W}תפוח(י)? אדמה${E}`) },
  { label: "בצל", image: `${BASE}/food/onion.webp`, re: new RegExp(`${W}בצל(ים)?${E}`) },
  { label: "חסה", image: `${BASE}/food/lettuce.webp`, re: new RegExp(`${W}חס(ה|ות)${E}`) },
  { label: "אבוקדו", image: `${BASE}/food/avocado.webp`, re: new RegExp(`${W}אבוקדו${E}`) },
  { label: "ברוקולי", image: `${BASE}/food/broccoli.webp`, re: new RegExp(`${W}ברוקולי${E}`) },
  { label: "קיווי", image: `${BASE}/food/kiwi.webp`, re: new RegExp(`${W}קיווי${E}`) },
  { label: "אננס", image: `${BASE}/food/pineapple.webp`, re: new RegExp(`${W}אננס${E}`) },
  { label: "אגס", image: `${BASE}/food/pear.webp`, re: new RegExp(`${W}אגס(ים)?${E}`) },
  { label: "צימוקים", image: `${BASE}/food/raisins.webp`, re: new RegExp(`${W}צימוק(ים)?${E}`) },
  { label: "שיבולת שועל", image: `${BASE}/food/oats.webp`, re: new RegExp(`${W}שיבולת שועל${E}`) },
  { label: "קורנפלקס", image: `${BASE}/food/cornflakes.webp`, re: new RegExp(`${W}קורנפלקס${E}`) },
  { label: "פיתה", image: `${BASE}/food/pita.webp`, re: new RegExp(`${W}פית(ה|ות)${E}`) },
  { label: "טחינה", image: `${BASE}/food/tahini.webp`, re: new RegExp(`${W}טחינה${E}`) },
  { label: "קוקוס", image: `${BASE}/food/coconut.webp`, re: new RegExp(`${W}(קוקוס|אגוז קוקוס)${E}`) },
  { label: "שקדים", image: `${BASE}/food/almonds.webp`, re: new RegExp(`${W}שקד(ים)?${E}`) },
  { label: "קולפן", image: `${BASE}/food/peeler.webp`, re: new RegExp(`${W}קולפן${E}`) },
  { label: "סיר", image: `${BASE}/food/pot.webp`, re: new RegExp(`${W}סיר(ים)?${E}`) },
  { label: "מחבת", image: `${BASE}/food/frying-pan.webp`, re: new RegExp(`${W}מחבת${E}`) },
  { label: "כוס מדידה", image: `${BASE}/food/measuring-cup.webp`, re: new RegExp(`${W}כו(ס|סות) מדידה${E}`) },
  { label: "מזלג", image: `${BASE}/food/fork.webp`, re: new RegExp(`${W}מזלג(ות)?${E}`) },
  { label: "בטטה", image: `${BASE}/food/sweet-potato.webp`, re: new RegExp(`${W}בטט(ה|ות)${E}`) },
  { label: "קישוא", image: `${BASE}/food/zucchini.webp`, re: new RegExp(`${W}קישוא(ים)?${E}`) },
  { label: "חציל", image: `${BASE}/food/eggplant.webp`, re: new RegExp(`${W}חציל(ים)?${E}`) },
  { label: "כרובית", image: `${BASE}/food/cauliflower.webp`, re: new RegExp(`${W}כרובית${E}`) },
  // "שום" לבד הוא גם "שום דבר", אז רק בצירופים של מטבח.
  { label: "שום", image: `${BASE}/food/garlic.webp`, re: new RegExp(`${W}((שן|שיני|ראש|ראשי) שום|שום (כתוש|קצוץ|טחון))${E}|^שום$`) },
  { label: "רימון", image: `${BASE}/food/pomegranate.webp`, re: new RegExp(`${W}רימו(ן|נים)${E}`) },
  { label: "מלון", image: `${BASE}/food/melon.webp`, re: new RegExp(`${W}מלו(ן|נים)${E}`) },
  { label: "אפרסק", image: `${BASE}/food/peach.webp`, re: new RegExp(`${W}אפרסק(ים)?${E}`) },
  // "תמר" לבד הוא גם שם, אז רק ברבים.
  { label: "תמרים", image: `${BASE}/food/dates.webp`, re: new RegExp(`${W}תמרים${E}`) },
  { label: "פריכיות", image: `${BASE}/food/rice-cakes.webp`, re: new RegExp(`${W}פריכי(ה|ת|ות)${E}`) },
  { label: "קצפת", image: `${BASE}/food/whipped-cream.webp`, re: new RegExp(`${W}קצפת${E}`) },
  { label: "לחמנייה", image: `${BASE}/food/bun.webp`, re: new RegExp(`${W}לחמני(ה|יה|ות|יות)${E}`) },
  { label: "חומוס", image: `${BASE}/food/chickpeas.webp`, re: new RegExp(`${W}חומוס${E}`) },
  { label: "מטרפה", image: `${BASE}/food/whisk.webp`, re: new RegExp(`${W}מטרפ(ה|ות)${E}`) },
  { label: "מצקת", image: `${BASE}/food/ladle.webp`, re: new RegExp(`${W}מצק(ת|ות)${E}`) },
  { label: "מלקחיים", image: `${BASE}/food/tongs.webp`, re: new RegExp(`${W}מלקחיים${E}`) },
  { label: "סינר", image: `${BASE}/food/apron.webp`, re: new RegExp(`${W}סינר(ים)?${E}`) },
  { label: "כפפת תנור", image: `${BASE}/food/oven-mitt.webp`, re: new RegExp(`${W}כפפ(ה|ת|ות) (תנור|אפייה)${E}`) },
  { label: "מגבת מטבח", image: `${BASE}/food/kitchen-towel.webp`, re: new RegExp(`${W}מגב(ת|ות)${E}`) },
  { label: "קיסמים", image: `${BASE}/food/toothpicks.webp`, re: new RegExp(`${W}קיס(ם|מים)${E}`) },
  { label: "צנצנת", image: `${BASE}/food/empty-jar.webp`, re: new RegExp(`${W}צנצנ(ת|ות)${E}`) },
  { label: "מגש", image: `${BASE}/food/tray.webp`, re: new RegExp(`${W}מגש(ים)?${E}`) },
  { label: "אפונה", image: `${BASE}/food/peas.webp`, re: new RegExp(`${W}אפונה${E}`) },
  { label: "פטריות", image: `${BASE}/food/mushrooms.webp`, re: new RegExp(`${W}פטרי(ה|ות)${E}`) },
  { label: "דלעת", image: `${BASE}/food/pumpkin.webp`, re: new RegExp(`${W}דלע(ת|ות)${E}`) },
  { label: "פטרוזיליה", image: `${BASE}/food/parsley.webp`, re: new RegExp(`${W}פטרוזיליה${E}`) },
  { label: "דובדבנים", image: `${BASE}/food/cherries.webp`, re: new RegExp(`${W}דובדב(ן|נים)${E}`) },
  { label: "שזיפים", image: `${BASE}/food/plums.webp`, re: new RegExp(`${W}שזי(ף|פים)${E}`) },
  { label: "אגוזי מלך", image: `${BASE}/food/walnuts.webp`, re: new RegExp(`${W}(אגוז(י)? מלך|אגוזים)${E}`) },
  { label: "גלידה", image: `${BASE}/food/ice-cream.webp`, re: new RegExp(`${W}גליד(ה|ות)${E}`) },
  { label: "מאפין", image: `${BASE}/food/muffin.webp`, re: new RegExp(`${W}(?<!תבנית )מאפי(ן|נים|נס)${E}`) },
  { label: "עוגה", image: `${BASE}/food/cake-slice.webp`, re: new RegExp(`${W}עוג(ה|ת|ות)${E}`) },
  { label: "כיריים", image: `${BASE}/food/stove.webp`, re: new RegExp(`${W}(כיריים|גז)${E}`) },
  { label: "כיור", image: `${BASE}/food/sink.webp`, re: new RegExp(`${W}כיור(ים)?${E}`) },
  { label: "מדיח כלים", image: `${BASE}/food/dishwasher.webp`, re: new RegExp(`${W}מדיח${E}`) },
  { label: "קומקום", image: `${BASE}/food/kettle.webp`, re: new RegExp(`${W}קומקום${E}`) },
  { label: "מעבד מזון", image: `${BASE}/food/food-processor.webp`, re: new RegExp(`${W}מעבד מזון${E}`) },
  { label: "מלחייה", image: `${BASE}/food/salt-shaker.webp`, re: new RegExp(`${W}מלחי(ה|יה)${E}`) },
  { label: "ספוג", image: `${BASE}/food/sponge.webp`, re: new RegExp(`${W}ספוג(ים)?${E}`) },
  { label: "מגבונים", image: `${BASE}/food/wet-wipes.webp`, re: new RegExp(`${W}מגבו(ן|נים)${E}`) },
  { label: "קופסת אוכל", image: `${BASE}/food/lunch-box.webp`, re: new RegExp(`${W}קופס(ת|אות) (אוכל|אחסון)${E}`) },
  { label: "טיימר", image: `${BASE}/food/kitchen-timer.webp`, re: new RegExp(`${W}טיימר${E}`) },
  { label: "קמח", image: `${BASE}/food/flour.webp`, re: new RegExp(`${W}קמח${E}`) },
  { label: "מלח", image: `${BASE}/food/salt-jar.webp`, re: new RegExp(`${W}מלח${E}`) },
  { label: "שמן", image: `${BASE}/food/oil.webp`, re: new RegExp(`${W}שמן${E}`) },
  { label: "מחק", image: `${BASE}/food/eraser.webp`, re: new RegExp(`${W}מחק(ים)?${E}`) },
];

// מיפוי ישיר: מילת מפתח (regex) -> נתיב קובץ תמונה
const MATERIAL_BANK_RULES = [

  // הערה: כללי kitchen-crafts ו-kitchen-toast-steps (הגליונות הגדולים)
  // הוסרו לצמיתות - התגלו כשלים בתמונות המקור עצמן. הכללים החדשים
  // למטה משתמשים בתמונות "manual" - כל אחת הועלתה ואומתה בנפרד.
  [/מדבק(ה|ות)/, `${BASE}/crafts-new/seed-33-independent/material-stickers.webp`],
  [/כפתור(ים)?/, `${BASE}/crafts-new/seed-5-independent/material-eyes-buttons.webp`],
  [/פומפונים|פונפונים/, `${BASE}/manual/pompoms-sorting-step.webp`],
  [/דבק/, `${BASE}/crafts-new/shared-independent/glue.webp`],
  [/פלסטלינה|בצק משחק/, `${BASE}/crafts-new/seed-63-independent/material-plasticine.webp`],
  [/מקרר/, `${BASE}/manual/chocolate-lollipops-fridge-tool.webp`],
  [/קער(ה|ות)/, `${BASE}/embedded-v358/seed-84/material-bowl.webp`],
  [/ביסקוויט|עוגיות/, `${BASE}/manual/chocolate-balls-new/chocolate-balls-biscuits.webp`],
  [/חבילת שוקולד|שוקולד\b/, `${BASE}/manual/chocolate-chunks.webp`],
  [/סודה לשתייה|אבקת סודה/, `${BASE}/manual/experiments/lava-lamp-material-2.webp`],
  [/חומץ/, `${BASE}/manual/experiments/lava-lamp-material-4.webp`],
  [/צבעי? מאכל/, `${BASE}/manual/experiments/lava-lamp-material-5.webp`],
  [/סבון כלים|סבון נוזלי/, `${BASE}/embedded-v358/seed-84/material-soap.webp`],
  [/מקלון אוזניים|קיסם אוזניים/, `${BASE}/manual/experiments/new-experiments-cotton-swabs.webp`],
  [/נייר סופג/, `${BASE}/crafts-new/seed-101-illustrated/material-paper-towel.webp`],
  [/נר קטן|נר\b/, `${BASE}/manual/experiments/vacuum-lift-material-4.webp`],
  [/מצית/, `${BASE}/manual/experiments/vacuum-lift-material-6.webp`],
  [/דבש/, `${BASE}/manual/fruit-popsicles/honey.webp`],
  [/קורנפלור|אבקת טלק/, `${BASE}/embedded-v358/seed-84/material-cornstarch.webp`],
  ...FOOD_ITEMS.map((item) => [item.re, item.image]),
];

const STEP_BANK_RULES = [
  [/מדביק(ים)?|הדבקה/, `${BASE}/crafts-new/shared-independent/glue.webp`],
  [/מגלגל(ים)? פלסטלינה/, `${BASE}/crafts-new/seed-63-independent/material-plasticine.webp`],
  [/ממיסים.*מיקרו|שוקולד ושמנת/, `${BASE}/manual/chocolate-chunks.webp`],
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
