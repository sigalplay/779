const daily = (sequence, image) => `/icon-bank/daily-sequences/${sequence}/${image}.webp`;
const character = (sequence, gender, image) => `/icon-bank/daily-sequences/${sequence}/${gender}/${image}.webp`;

export const DAILY_SEQUENCE_TEMPLATES = [
  { id: "toilet", title: "סדר פעולות בשירותים", description: "מהכניסה לשירותים ועד שטיפת הידיים", cover: daily("toilet", "enter") },
  { id: "hands", title: "שטיפת ידיים", description: "רצף חזותי קצר וברור ליד הכיור", cover: daily("hands", "rub") },
  { id: "shower", title: "סדר פעולות במקלחת", description: "הכנה, רחצה, ניגוב ולבוש", cover: daily("shower", "water") },
  { id: "dressing", title: "סדר פעולות לבוש", description: "לבישת הבגדים לפי סדר", cover: daily("dressing", "done") },
];

export function stepsForDailySequence(templateId, gender = "girl") {
  const steps = {
    toilet: [
      ["toilet-go", "נכנסים לשירותים", character("toilet", gender, "enter")],
      ["toilet-clothes", "מורידים מכנסיים ותחתונים", daily("toilet", "clothes")],
      ["toilet-sit", "יושבים בנוחות", daily("toilet", "sit")],
      ["toilet-wipe", "מנגבים", daily("toilet", "wipe")],
      ["toilet-flush", "מורידים את המים", daily("toilet", "flush")],
      ["toilet-hands", "שוטפים ידיים", daily("toilet", "hands")],
    ],
    hands: [
      ["hands-open", "פותחים את הברז", daily("hands", "open")],
      ["hands-water", "מרטיבים ידיים", daily("hands", "water")],
      ["hands-soap", "שמים סבון", daily("hands", "soap")],
      ["hands-rub", "משפשפים כפות ידיים, אצבעות וגב היד", daily("hands", "rub")],
      ["hands-rinse", "שוטפים את הסבון במים", daily("hands", "rinse")],
      ["hands-close", "סוגרים את הברז", daily("hands", "close")],
      ["hands-dry", "מנגבים ידיים", daily("hands", "dry")],
    ],
    shower: [
      ["shower-undress", "מורידים חולצה", character("shower", gender, "undress")],
      ["shower-pants", "מורידים מכנסיים", daily("shower", "pants"), true],
      ["shower-socks", "מורידים גרביים", daily("shower", "socks"), true],
      ["shower-shoes", "חולצים נעליים", daily("shower", "shoes"), true],
      ["shower-basket", "מכניסים את הבגדים לסל", daily("shower", "basket"), true],
      ["shower-water", "נכנסים למקלחת ופותחים מים נעימים", daily("shower", "water")],
      ["shower-soap", "מסבנים את הגוף", daily("shower", "soap")],
      ["shower-rinse", "שוטפים את הסבון", daily("shower", "rinse")],
      ["shower-shampoo", "חופפים את השיער בשמפו", character("shower", gender, "shampoo")],
      ["shower-shampoo-rinse", "שוטפים את השמפו במים", character("shower", gender, "shampoo-rinse")],
      ["shower-conditioner", "שמים מרכך על השיער", character("shower", gender, "conditioner")],
      ["shower-conditioner-rinse", "שוטפים את המרכך במים", character("shower", gender, "conditioner-rinse")],
      ["shower-dry", "סוגרים את המים ומתנגבים", daily("shower", "dry")],
      ["shower-dress", "לובשים בגדים נקיים", daily("shower", "dress")],
    ],
    dressing: [
      ["dress-underwear", "לובשים תחתונים", character("dressing", gender, "underwear")],
      ["dress-shirt", "לובשים חולצה", daily("dressing", "shirt")],
      ["dress-pants", "לובשים מכנסיים", daily("dressing", "pants")],
      ["dress-socks", "לובשים גרביים", daily("dressing", "socks")],
      ["dress-shoes", "נועלים נעליים", daily("dressing", "shoes")],
      ["dress-done", "בודקים במראה — סיימנו", character("dressing", gender, "done")],
    ],
  };
  return (steps[templateId] || []).map(([id, label, image, optional = false]) => ({ id, label, image, optional }));
}
