const BASE = "/icon-bank/motor-trail";
const MANUAL = "/icon-bank/manual";
const demoFrames = (id) => [1, 2, 3].map((frame) => `${BASE}/demos/${id}/frame-${frame}.webp`);

export const MOTOR_TRAIL_HERO = `${BASE}/hero.webp`;

export const MOTOR_TRAIL_ITEMS = [
  { id: "swing", label: "נדנדה", labelEn: "Swing", image: `${BASE}/swing.webp`, action: "מתיישבים במרכז הנדנדה ונשארים יציבים", actionEn: "Sit in the center of the swing and keep your body steady.", demo: demoFrames("swing") },
  { id: "disc-swing", label: "צלחת וסטיבולרית", labelEn: "Vestibular Disc Swing", image: `${BASE}/disc-swing.webp`, action: "נכנסים לצלחת, מתיישבים בתוכה ומסתובבים בישיבה", actionEn: "Climb into the disc, sit inside it and spin while seated.", demo: demoFrames("disc-swing") },
  { id: "balance-disc", label: "צלחת שיווי משקל", labelEn: "Balance Board", image: `${BASE}/balance-disc.webp`, action: "עולים על הצלחת בשתי רגליים ושומרים על שיווי משקל", actionEn: "Stand on the board with both feet and keep your balance.", demo: demoFrames("balance-disc") },
  { id: "hammock", label: "ערסל", labelEn: "Hammock", image: `${BASE}/hammock.webp`, action: "מחזיקים בצדדים, נכנסים ומתיישבים בתוך הערסל", actionEn: "Hold the sides, climb in and sit inside the hammock.", demo: demoFrames("hammock") },
  { id: "trampoline", label: "טרמפולינה", labelEn: "Trampoline", image: `${BASE}/trampoline.webp`, action: "קופצים ונוחתים בשתי רגליים במרכז הטרמפולינה", actionEn: "Jump and land with both feet in the center of the trampoline.", demo: [`${BASE}/demos/trampoline/frame-1.webp`, `${BASE}/demos/trampoline/frame-2.webp`, `${BASE}/demos/trampoline/frame-3.webp`] },
  { id: "tunnel", label: "מנהרה", labelEn: "Tunnel", image: `${BASE}/tunnel.webp`, action: "זוחלים על הידיים והברכיים ועוברים דרך המנהרה", actionEn: "Crawl on hands and knees through the tunnel.", demo: [`${BASE}/demos/tunnel/frame-1.webp`, `${BASE}/demos/tunnel/frame-2.webp`, `${BASE}/demos/tunnel/frame-3.webp`] },
  { id: "stepping-stones", label: "אבנים", labelEn: "Stepping Stones", image: `${BASE}/stepping-stones.webp`, action: "דורכים על האבנים אחת אחרי השנייה", actionEn: "Step on the stones one after another.", demo: [`${BASE}/demos/stepping-stones/frame-1.webp`, `${BASE}/demos/stepping-stones/frame-2.webp`, `${BASE}/demos/stepping-stones/frame-3.webp`] },
  { id: "barrel", label: "חבית קשיחה", labelEn: "Rigid Barrel", image: `${BASE}/barrel.webp`, action: "מחזיקים בשפת החבית, מכניסים רגל אחת ונעמדים בתוכה", actionEn: "Hold the rim, place one foot inside and stand in the barrel.", demo: demoFrames("barrel") },
  { id: "ladder", label: "סולם", labelEn: "Ladder", image: `${BASE}/ladder.webp`, action: "מחזיקים בשלבים ומטפסים שלב אחר שלב", actionEn: "Hold the rungs and climb one step at a time.", demo: demoFrames("ladder") },
  { id: "stilts", label: "קביים", labelEn: "Stilts", image: `${BASE}/stilts.webp`, action: "עומדים על הקביים, מותחים את החבלים ומתקדמים בצעדים קטנים", actionEn: "Stand on the stilts, pull the ropes tight and take small steps.", demo: demoFrames("stilts") },
  { id: "physio-ball", label: "כדור פיזיו", labelEn: "Physio Ball", image: `${BASE}/physio-ball.webp`, action: "נשכבים על הבטן ומתקדמים קדימה בעזרת הידיים", actionEn: "Lie on your tummy and move forward using your hands.", demo: demoFrames("physio-ball") },
  { id: "small-ball", label: "כדור קטן", labelEn: "Small Ball", image: `${BASE}/small-ball.webp`, action: "מחזיקים בשתי ידיים, זורקים בעדינות ותופסים", actionEn: "Hold with both hands, throw gently and catch.", demo: demoFrames("small-ball") },
  { id: "scooter", label: "סקוטר", labelEn: "Scooter Board", image: `${BASE}/scooter.webp`, action: "שוכבים על הבטן במרכז הסקוטר ומתקדמים בדחיפת הרצפה בשתי הידיים", actionEn: "Lie on your tummy in the center of the scooter board and push along the floor with both hands.", demo: demoFrames("scooter") },
  { id: "hoops", label: "חישוקים", labelEn: "Hoops", image: `${BASE}/hoops.webp`, action: "קופצים בשתי רגליים מחישוק לחישוק", actionEn: "Jump with both feet from one hoop to the next.", demo: demoFrames("hoops") },
];

// Fine-motor stations (craft materials and table toys), to end the course at the table.
// Pictures already used elsewhere on the site.
export const CREATIVE_ACCESSORIES = [
  { id: "markers", label: "טושים", labelEn: "Markers", image: "/icon-bank/crafts-new/seed-100-independent/material-colored-markers.webp" },
  { id: "stickers", label: "מדבקות", labelEn: "Stickers", image: "/icon-bank/crafts-new/seed-33-independent/material-stickers.webp" },
  { id: "glue", label: "דבק", labelEn: "Glue", image: "/icon-bank/crafts-new/shared-independent/glue.webp" },
  { id: "scissors", label: "מספריים", labelEn: "Scissors", image: "/icon-bank/crafts-new/shared-independent/scissors.webp" },
  { id: "colored-paper", label: "דפי צבע", labelEn: "Colored Paper", image: "/icon-bank/crafts-new/seed-33-independent/material-poster-paper.webp" },
  { id: "crayons", label: "צבעי שעווה", labelEn: "Crayons", image: "/icon-bank/embedded-v359/seed-71/material-crayons.webp" },
  { id: "play-dough", label: "בצק", labelEn: "Play dough", image: "/icon-bank/crafts-new/seed-63-independent/material-plasticine.webp" },
  { id: "therapy-putty", label: "פלסטלינה טיפולית", labelEn: "Therapy putty", image: "/icon-bank/toys/therapy-putty.webp" },
  { id: "beads", label: "חרוזים ושרוך", labelEn: "Beads and lace", image: "/icon-bank/toys/beads.webp" },
  { id: "puzzle", label: "פאזל", labelEn: "Puzzle", image: "/icon-bank/toys/puzzle.webp" },
  { id: "lego", label: "לגו", labelEn: "Lego", image: "/icon-bank/toys/lego.webp" },
  { id: "tweezers", label: "פינצטה", labelEn: "Tweezers", image: "/icon-bank/fine-motor-new/seed-37-tweezers-pompoms/material-tweezers.webp" },
];

// Everyday household items for building a motor trail without special equipment -
// each with its own illustration (the emoji stays as a fallback).
export const HOME_ITEMS = [
  { id: "pillow", label: "כרית", labelEn: "Pillow", emoji: "🛏️", image: `${BASE}/home/pillow.webp` },
  { id: "bottle", label: "בקבוק", labelEn: "Bottle", emoji: "🧴", image: `${BASE}/home/bottle.webp` },
  { id: "chair", label: "כיסא", labelEn: "Chair", emoji: "🪑", image: `${BASE}/home/chair.webp` },
  { id: "blanket", label: "שמיכה", labelEn: "Blanket", emoji: "🛌", image: `${BASE}/home/blanket.webp` },
  { id: "cardboard-box", label: "קופסת קרטון", labelEn: "Cardboard Box", emoji: "📦", image: `${BASE}/home/cardboard-box.webp` },
  { id: "couch-cushion", label: "כרית ספה", labelEn: "Couch Cushion", emoji: "🛋️", image: `${BASE}/home/couch-cushion.webp` },
  { id: "broom", label: "מטאטא", labelEn: "Broom", emoji: "🧹", image: `${BASE}/home/broom.webp` },
  { id: "rope", label: "חבל או סרט", labelEn: "Rope or Ribbon", emoji: "🪢", image: `${BASE}/home/rope.webp` },
];
