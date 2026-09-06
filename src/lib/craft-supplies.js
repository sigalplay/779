// רשימת ציוד יצירה קנונית + התאמה לפעילויות לפי שדה ה-materials החופשי שלהן.
// כל פריט ברשימה מוגדר עם כמה מילות מפתח שמזהות אותו בטקסט החומרים של הפעילות.

export const CRAFT_SUPPLIES = [
  { key: "paper", label: "דפים / בריסטול / קרטון", keywords: ["דף", "דפים", "בריסטול", "קרטון", "כרטיסיות"] },
  { key: "colors", label: "טושים / צבעים / עפרונות", keywords: ["טוש", "צבעים", "צבעי מים", "עפרון", "עיפרון", "גואש", "פנדה", "שעווה", "לורד", "ארטליין"] },
  { key: "glue", label: "דבק", keywords: ["דבק פלסטי", "דבק נוזלי"], exact: ["דבק"] },
  { key: "scissors", label: "מספריים", keywords: ["מספריים"] },
  { key: "yarn", label: "חוטים, צמר וסרטים", keywords: ["חוט", "צמר", "סרט לתלייה"] },
  { key: "decorations", label: "מדבקות / נצנצים", keywords: ["מדבקות", "נצנצים"] },
  { key: "playdough", label: "פלסטלינה", keywords: ["פלסטלינה"] },
  { key: "chalk", label: "גירים", keywords: ["גירים"] },
  { key: "salt", label: "מלח", keywords: ["מלח"] },
  { key: "dish_soap", label: "סבון כלים", keywords: ["סבון כלים"] },
  { key: "cornstarch", label: "עמילן תירס", keywords: ["עמילן תירס"] },
  { key: "cling_wrap", label: "ניילון נצמד", keywords: ["ניילון נצמד"] },
  { key: "tape", label: "סלוטייפ / סרט דבק", keywords: ["סלוטייפ", "סרט דבק"] },
  { key: "popsicle_sticks", label: "מקלות ארטיק", keywords: ["מקלות ארטיק"] },
  { key: "straws", label: "קשיות צבעוניות", keywords: ["קשיות"] },
  { key: "transparent_pouch", label: "שמרדף / שקית זיפלוק", keywords: ["שמרדף", "זיפלוק"] },
  { key: "aluminum_foil", label: "נייר כסף", keywords: ["נייר כסף"] },
  { key: "printer", label: "מדפסת", keywords: ["מדפסת", "מודפס", "להדפיס"] },
  { key: "fabric", label: "חולצה חלקה", keywords: ["חולצה חלקה"] },
  { key: "iron", label: "מגהץ", keywords: ["מגהץ"] },
  { key: "sand", label: "חול", keywords: ["חול דק", "חול משחק"] },
];

// מחזיר את סט המפתחות (מתוך CRAFT_SUPPLIES) שנדרשים לפעילות נתונה,
// לפי רשימת ה-materials החופשית שלה. חומרים המסומנים "(רשות)" אינם נספרים כדרישה.
export function requiredSupplyKeys(materials = []) {
  const required = new Set();
  for (const raw of materials) {
    if (!raw || raw.includes("רשות")) continue;
    for (const supply of CRAFT_SUPPLIES) {
      if (supply.keywords.some((kw) => raw.includes(kw)) || supply.exact?.includes(raw.trim())) {
        required.add(supply.key);
      }
    }
  }
  return required;
}

// ממיין רשימת פעילויות לפי מספר הפריטים שחסרים ביחס לציוד שסומן כ"יש לי".
export function matchByCraftSupplies(activities, haveKeys) {
  return activities
    .map((activity) => {
      const required = requiredSupplyKeys(activity.materials);
      const missing = [...required].filter((k) => !haveKeys.has(k));
      return { activity, required, missing };
    })
    .filter((row) => row.required.size > 0)
    .sort((a, b) => a.missing.length - b.missing.length || a.required.size - b.required.size);
}
