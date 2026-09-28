/**
 * "בנק האיורים" - שכבת התאמה לפי מילות מפתח שמשתמשת בתמונות אמיתיות
 * (לא SVG מצויר) שהועלו על ידי המשתמשת, במקום ציור עצמי.
 * עדיפות בשרשרת ההתאמה: קודם ACTIVITY_ICON_SETS (מותאם לפעילות ספציפית),
 * אז הבנק הזה (תמונות אמיתיות לפי מילת מפתח), אחר כך icon-library.jsx
 * (SVG מצויר), ולבסוף אימוג'י כברירת מחדל.
 */

const BASE = "/icon-bank";

// בנק המזון: פירות, ירקות ומוצרי חלב שצוירו לבנק. מילה שלמה בלבד,
// כדי ש"גזרו" לא יקבל גזר ו"תפוח אדמה" לא יקבל תפוח.
const W = "(?<![א-ת])";
const E = "(?![א-ת])";
export const FOOD_ITEMS = [
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
