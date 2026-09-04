const BASE = "/icon-bank/motor-trail";
const MANUAL = "/icon-bank/manual";
const demoFrames = (id) => [1, 2, 3].map((frame) => `${BASE}/demos/${id}/frame-${frame}.webp`);

export const MOTOR_TRAIL_HERO = `${BASE}/hero.webp`;

export const MOTOR_TRAIL_ITEMS = [
  { id: "swing", label: "נדנדה", image: `${BASE}/swing.webp`, action: "מתיישבים במרכז הנדנדה ונשארים יציבים", demo: demoFrames("swing") },
  { id: "disc-swing", label: "צלחת וסטיבולרית", image: `${BASE}/disc-swing.webp`, action: "נכנסים לצלחת, מתיישבים בתוכה ומסתובבים בישיבה", demo: demoFrames("disc-swing") },
  { id: "balance-disc", label: "צלחת שיווי משקל", image: `${BASE}/balance-disc.webp`, action: "עולים על הצלחת בשתי רגליים ושומרים על שיווי משקל", demo: demoFrames("balance-disc") },
  { id: "hammock", label: "ערסל", image: `${BASE}/hammock.webp`, action: "מחזיקים בצדדים, נכנסים ומתיישבים בתוך הערסל", demo: demoFrames("hammock") },
  { id: "trampoline", label: "טרמפולינה", image: `${BASE}/trampoline.webp`, action: "קופצים ונוחתים בשתי רגליים במרכז הטרמפולינה", demo: [`${BASE}/demos/trampoline/frame-1.webp`, `${BASE}/demos/trampoline/frame-2.webp`, `${BASE}/demos/trampoline/frame-3.webp`] },
  { id: "tunnel", label: "מנהרה", image: `${BASE}/tunnel.webp`, action: "זוחלים על הידיים והברכיים ועוברים דרך המנהרה", demo: [`${BASE}/demos/tunnel/frame-1.webp`, `${BASE}/demos/tunnel/frame-2.webp`, `${BASE}/demos/tunnel/frame-3.webp`] },
  { id: "stepping-stones", label: "אבנים", image: `${BASE}/stepping-stones.webp`, action: "דורכים על האבנים אחת אחרי השנייה", demo: [`${BASE}/demos/stepping-stones/frame-1.webp`, `${BASE}/demos/stepping-stones/frame-2.webp`, `${BASE}/demos/stepping-stones/frame-3.webp`] },
  { id: "barrel", label: "חבית קשיחה", image: `${BASE}/barrel.webp`, action: "מחזיקים בשפת החבית, מכניסים רגל אחת ונעמדים בתוכה", demo: demoFrames("barrel") },
  { id: "ladder", label: "סולם", image: `${BASE}/ladder.webp`, action: "מחזיקים בשלבים ומטפסים שלב אחר שלב", demo: demoFrames("ladder") },
  { id: "stilts", label: "קביים", image: `${BASE}/stilts.webp`, action: "עומדים על הקביים, מותחים את החבלים ומתקדמים בצעדים קטנים", demo: demoFrames("stilts") },
  { id: "physio-ball", label: "כדור פיזיו", image: `${BASE}/physio-ball.webp`, action: "נשכבים על הבטן ומתקדמים קדימה בעזרת הידיים", demo: demoFrames("physio-ball") },
  { id: "small-ball", label: "כדור קטן", image: `${BASE}/small-ball.webp`, action: "מחזיקים בשתי ידיים, זורקים בעדינות ותופסים", demo: demoFrames("small-ball") },
  { id: "scooter", label: "סקוטר", image: `${BASE}/scooter.webp`, action: "שוכבים על הבטן במרכז הסקוטר ומתקדמים בדחיפת הרצפה בשתי הידיים", demo: demoFrames("scooter") },
  { id: "hoops", label: "חישוקים", image: `${BASE}/hoops.webp`, action: "קופצים בשתי רגליים מחישוק לחישוק", demo: demoFrames("hoops") },
];

// A small curated picker of "creative station" images already used elsewhere on the
// site, for therapists who want to end the motor trail at an art/creative activity.
export const CREATIVE_ACCESSORIES = [
  { id: "markers", label: "טושים", image: "/icon-bank/crafts-new/seed-100-independent/material-colored-markers.webp" },
  { id: "stickers", label: "מדבקות", image: "/icon-bank/crafts-new/seed-33-independent/material-stickers.webp" },
  { id: "glue", label: "דבק", image: "/icon-bank/crafts-new/shared-independent/glue.webp" },
  { id: "scissors", label: "מספריים", image: "/icon-bank/crafts-new/shared-independent/scissors.webp" },
  { id: "colored-paper", label: "דפי צבע", image: "/icon-bank/crafts-new/seed-33-independent/material-poster-paper.webp" },
];

// Everyday household items for building a motor trail without special equipment -
// no dedicated illustrations yet, so each item uses an emoji instead of an image.
export const HOME_ITEMS = [
  { id: "pillow", label: "כרית", emoji: "🛏️" },
  { id: "bottle", label: "בקבוק", emoji: "🧴" },
  { id: "chair", label: "כיסא", emoji: "🪑" },
  { id: "blanket", label: "שמיכה", emoji: "🛌" },
  { id: "cardboard-box", label: "קופסת קרטון", emoji: "📦" },
  { id: "couch-cushion", label: "כרית ספה", emoji: "🛋️" },
  { id: "broom", label: "מטאטא", emoji: "🧹" },
  { id: "rope", label: "חבל או סרט", emoji: "🪢" },
];
