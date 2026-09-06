// כל הנתיבים כאן נבדקו מול הקבצים הקיימים בפועל בגרסה 548.
const TOOLS = {
  pencil: "/icon-bank/crafts-new/seed-71-independent/material-pencil.webp",
  markers: "/icon-bank/crafts-new/seed-100-independent/material-colored-markers.webp",
  scissors: "/icon-bank/crafts-new/shared-independent/scissors.webp",
  glue: "/icon-bank/crafts-new/shared-independent/glue.webp",
  spoon: "/icon-bank/manual/sandbottle-spoon.webp",
  knife: "/icon-bank/manual/pizza-new/pizza-knife.webp",
  whisk: "/icon-bank/manual/whisk-tool.webp",
  grater: "/icon-bank/manual/sandbottle-grater.webp",
  rollingPin: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-rolling-pin.webp",
  spatula: "/icon-bank/crafts-new/seed-84-independent/material-spatula.webp",
  yarn: "/icon-bank/crafts-new/seed-70-independent/material-yarn.webp",
  paper: "/icon-bank/crafts-new/seed-71-independent/material-sheets.webp",
  coloredPaper: "/icon-bank/kitchen-crafts/colored-paper.webp",
  bristol: "/icon-bank/crafts-new/seed-33-independent/material-poster-paper.webp",
  bowl: "/icon-bank/crafts-new/seed-84-independent/material-bowl.webp",
  cutters: "/icon-bank/manual/chocolate-toastie-new/chocolate-toastie-cutters.webp",
  glueStick: "/icon-bank/kitchen-crafts/glue-stick.webp",
  popsicleSticks: "/icon-bank/kitchen-crafts/popsicle-sticks.webp",
  crayons: "/icon-bank/crafts-new/seed-71-independent/material-crayons.webp",
  chalk: "/icon-bank/manual/sandbottle-chalks.webp",
  plate: "/icon-bank/kitchen-crafts/plate.webp",
  tray: "/icon-bank/fine-motor/seed-55/material-tray.webp",
  bottle: "/icon-bank/manual/sandbottle-bottle-empty.webp",
  box: "/icon-bank/fine-motor/seed-64-finger-soccer/material-shoebox.webp",
  straws: "/icon-bank/crafts-new/seed-102-illustrated/material-colored-straws.webp",
  skewers: "/icon-bank/crafts-new/seed-63-independent/material-skewers.webp",
  foil: "/icon-bank/crafts-new/seed-63-independent/material-foil.webp",
  parchment: "/icon-bank/manual/recipe-parchment-paper-flat.webp",
  pompoms: "/icon-bank/kitchen-crafts/pompoms-bag.webp",
  nailClipper: "/icon-bank/fine-motor/seed-55/material-nail-clipper.webp",
  earplugs: "/icon-bank/sensory-new/seed-31-illustrated/material-earplugs.webp",
  lentils: "/icon-bank/sensory-new/seed-78-illustrated/material-lentils.webp",
  rice: "/icon-bank/sensory/seed-9/material-rice-lentils.webp",
  sand: "/icon-bank/crafts-new/seed-84-independent/material-sand.webp",
  chair: "/icon-bank/movement/seed-2/material-chairs.webp",
  pillow: "/icon-bank/movement/seed-2/material-pillows.webp",
  blanket: "/icon-bank/movement/seed-2/material-blanket.webp",
  stickers: "/icon-bank/crafts-new/seed-33-independent/material-stickers.webp",
  buttons: "/icon-bank/crafts-new/seed-5-independent/material-eyes-buttons.webp",
  socks: "/icon-bank/crafts-new/seed-5-independent/material-socks.webp",
  cards: "/icon-bank/movement/seed-38/material-number-cards.webp",
  matches: "/icon-bank/crafts-new/seed-63-independent/material-matches.webp",
  measuring: "/icon-bank/crafts-new/seed-84-independent/material-measuring.webp",
  zipBag: "/icon-bank/crafts-new/seed-105-magic-ocean/material-zip-bag.webp",
  watercolors: "/icon-bank/kitchen-crafts/watercolors.webp",
  musicDevice: "/icon-bank/social-new/seed-30-illustrated/material-music-device.webp",
  puzzle: "/icon-bank/sensory/seed-85/material-puzzle.webp",
  pots: "/icon-bank/sensory-new/seed-31-illustrated/material-pots-boxes.webp",
  salt: "/icon-bank/manual/sandbottle-salt.webp",
  water: "/icon-bank/sensory-new/seed-41-sponge-game/material-water.webp",
  holePunch: "/icon-bank/crafts-new/seed-79-independent/material-hole-punch.webp",
  ruler: "/icon-bank/crafts-new/seed-79-independent/material-ruler.webp",
  cup: "/icon-bank/shared-new/material-water-cup.webp",
  tweezers: "/icon-bank/fine-motor-new/seed-37-tweezers-pompoms/material-tweezers.webp",
  microwave: "/icon-bank/manual/chocolate-balls-new/chocolate-balls-microwave.webp",
  fridge: "/icon-bank/manual/chocolate-lollipops-fridge-tool.webp",
  oven: "/icon-bank/manual/pizza-new/pizza-oven.webp",
  printer: "/icon-bank/crafts-new/seed-3-independent/material-printer.webp",
  flashlight: "/icon-bank/movement/seed-18/material-flashlight.webp",
  blindfold: "/icon-bank/sensory/seed-19/material-blindfold.webp",
  phone: "/icon-bank/sensory-new/seed-104-find-sound/material-phone-v3.webp",
  balloons: "/icon-bank/sensory/seed-85/material-balloons.webp",
  clothespins: "/icon-bank/manual/clothespin-material-2.webp",
  plasticine: "/icon-bank/crafts-new/seed-63-independent/material-plasticine.webp",
  sponge: "/icon-bank/sensory-new/seed-41-sponge-game/material-sponge.webp",
  funnel: "/icon-bank/manual/sandbottle-funnel.webp",
  dreidel: "/icon-bank/creative/seed-86/material-dreidel.webp",
  blocks: "/icon-bank/motor-equipment/climbing-cubes.webp",
  trampoline: "/icon-bank/motor-equipment/personal-trampoline.webp",
  hoops: "/icon-bank/motor-trail/hoops.webp",
  tunnel: "/icon-bank/motor-equipment/crawl-tunnel.webp",
  ropeLadder: "/icon-bank/motor-equipment/rope-ladder.webp",
  climbingWall: "/icon-bank/motor-equipment/small-climbing-wall-1.webp",
  hammock: "/icon-bank/motor-equipment/hammock-swing.webp",
  balance: "/icon-bank/motor-equipment/balance-course.webp",
  ball: "/icon-bank/movement-new/seed-90-illustrated/material-soft-ball.webp",
  timer: "/icon-bank/movement/seed-2/material-timer.webp",
  tape: "/icon-bank/crafts-new/seed-100-independent/material-tape.webp",
  eraser: "/icon-bank/kitchen-crafts/eraser.webp",
  chocolate: "/icon-bank/manual/chocolate-chunks.webp",
  bakingSoda: "/icon-bank/manual/experiments/lava-lamp-material-2.webp",
  oil: "/icon-bank/manual/experiments/lava-lamp-material-3.webp",
  vinegar: "/icon-bank/manual/experiments/lava-lamp-material-4.webp",
  foodColor: "/icon-bank/manual/experiments/lava-lamp-material-5.webp",
  dishSoap: "/icon-bank/embedded-v358/seed-84/material-soap.webp",
  cottonSwab: "/icon-bank/manual/experiments/new-experiments-cotton-swabs.webp",
  paperTowel: "/icon-bank/crafts-new/seed-101-illustrated/material-paper-towel.webp",
  candle: "/icon-bank/manual/experiments/vacuum-lift-material-4.webp",
  lighter: "/icon-bank/manual/experiments/vacuum-lift-material-6.webp",
  honey: "/icon-bank/manual/fruit-popsicles/honey.webp",
  cornstarch: "/icon-bank/embedded-v358/seed-84/material-cornstarch.webp",
};

const EXPLICIT_TOOLS = [
  [/נייר סופג/, "paperTowel"], [/צבעי? מאכל/, "foodColor"], [/סודה לשתייה|אבקת סודה/, "bakingSoda"],
  [/צבעי פנדה|צבעי שעווה|קריונים/, "crayons"], [/גירים?|גיר\b/, "chalk"],
  [/טושים?|לורד|מרקר|צבעי גואש|צבעים/, "markers"], [/עפרונות? צבעוניים/, "markers"], [/עיפרון|עפרון|עט/, "pencil"],
  [/מספריים/, "scissors"], [/מדבקה|מדבקות|דבקית|דבקיות|גליון מדבקות/, "stickers"], [/דבק סטיק|סטיק דבק|סטיק\b/, "glueStick"], [/דבק/, "glue"], [/קורצנים?|קורצן|חותכני? עוגיות/, "cutters"],
  [/מקלות? ארטיק/, "popsicleSticks"], [/מטרפה|וויסק/, "whisk"], [/פומפייה/, "grater"], [/מערוך/, "rollingPin"],
  [/מרית/, "spatula"], [/כפית|כפות|כף/, "spoon"], [/סכין|סכינים/, "knife"], [/חוט|חוטים|צמר|שרוך|שרוכים/, "yarn"],
  [/בריסטול|קרטון|דף עבה|גיליון/, "bristol"], [/דפים? צבעוניים|ניירות? צבעוניים|נייר צבעוני/, "coloredPaper"], [/דפים?|דף|ניירות?|נייר/, "paper"], [/קערה|קערות|קערית|קעריות/, "bowl"], [/צלחות?|צלחת/, "plate"], [/מגשים?|מגש|תבנית/, "tray"],
  [/בקבוקים?|בקבוק/, "bottle"], [/קופסאות?|קופסה/, "box"], [/קשיות?|קשית/, "straws"], [/שיפודים?|שיפוד/, "skewers"],
  [/נייר כסף|רדיד אלומיניום/, "foil"], [/נייר אפייה/, "parchment"], [/פומפונים?|פונפונים?/, "pompoms"], [/קוצץ ציפורניים/, "nailClipper"],
  [/אטמי אוזניים/, "earplugs"], [/עדשים/, "lentils"], [/אורז/, "rice"], [/חול/, "sand"], [/כיסאות?|כיסא/, "chair"], [/כריות?|כרית/, "pillow"], [/שמיכה/, "blanket"],
  [/כפתורים?|עיניים דביקות/, "buttons"], [/גרביים?|גרב/, "socks"], [/כרטיסיות?|קלפים?|פתקים ממוספרים/, "cards"],
  [/גפרורים?/, "matches"], [/כוסות? מדידה|כפות? מדידה|כלי מדידה/, "measuring"], [/שקית זיפלוק|שמרדף|שקית שקופה/, "zipBag"],
  [/צבעי מים|מכחול/, "watercolors"], [/רמקול|מכשיר מוזיקה|מוזיקה/, "musicDevice"], [/פאזל/, "puzzle"], [/סירים?|סיר/, "pots"],
  [/מלח/, "salt"], [/מים/, "water"], [/כוסות?|כוס/, "cup"],
  [/מנקב/, "holePunch"], [/סרגל/, "ruler"], [/פינצטה/, "tweezers"], [/מיקרוגל/, "microwave"], [/מקרר/, "fridge"],
  [/תנור/, "oven"], [/מדפסת/, "printer"], [/פנס/, "flashlight"], [/כיסוי עיניים|מטפחת/, "blindfold"], [/טלפון/, "phone"],
  [/בלונים?/, "balloons"], [/אטבי כביסה|אטב/, "clothespins"], [/פלסטלינה|בצק משחק/, "plasticine"], [/ספוג/, "sponge"],
  [/משפך/, "funnel"], [/סביבון/, "dreidel"], [/קוביות|לגו/, "blocks"], [/טרמפולינה/, "trampoline"], [/חישוקים?/, "hoops"],
  [/מנהרה/, "tunnel"], [/סולם חבלים/, "ropeLadder"], [/קיר טיפוס/, "climbingWall"], [/ערסל|נדנדה/, "hammock"],
  [/שיווי משקל/, "balance"], [/כדור/, "ball"], [/טיימר|שעון חול/, "timer"], [/סלוטייפ|מסקינטייפ|סרט דבק/, "tape"], [/מחק/, "eraser"],
  [/שוקולד|קוביות שוקולד|חבילת שוקולד/, "chocolate"], [/סודה לשתייה|אבקת סודה/, "bakingSoda"],
  [/שמן צמחי|שמן\b/, "oil"], [/חומץ/, "vinegar"], [/צבעי? מאכל/, "foodColor"],
  [/סבון כלים|סבון נוזלי/, "dishSoap"], [/מקלון אוזניים|קיסם אוזניים/, "cottonSwab"],
  [/נייר סופג/, "paperTowel"], [/נר קטן|נר\b/, "candle"], [/מצית/, "lighter"],
  [/דבש/, "honey"], [/קורנפלור|אבקת טלק/, "cornstarch"],
];

const ACTIONS = [
  [/צובע|צובעת|צובעים|צובעות|צביעה|לצבוע|מקשט.*צבע/, "markers"], [/מצייר|מציירת|מציירים|מציירות|ציור|לצייר|משרטט/, "pencil"], [/כותב|כותבת|כותבים|כותבות|כתיבה|לכתוב|רושם|רושמת|מסמן|מסמנת/, "pencil"],
  [/מוחק|מוחקת|מוחקים|מוחקות|מחיקה|למחוק/, "eraser"], [/גוזר|גוזרת|גוזרים|גוזרות|גזירה|לגזור/, "scissors"],
  [/(חותך|חותכ|חיתוך|לחתוך).*(פרי|ירק|בננה|תפוח|לחם|בצק|עוג|שוקולד|מזון)|(פרי|ירק|בננה|תפוח|לחם|בצק|עוג|שוקולד|מזון).*(חותך|חותכ|חיתוך|לחתוך)/, "knife"],
  [/חותך|חותכת|חותכים|חותכות|חיתוך|לחתוך/, "scissors"], [/מדביק|מדביקה|מדביקים|מדביקות|הדבקה|להדביק/, "glue"], [/מערבב|מערבבת|מערבבים|מערבבות|ערבוב|בוחש|בוחשת|בוחשים|לבחוש/, "spoon"], [/מקציף|מקציפה|מקציפים|טורף|טורפת|טורפים/, "whisk"],
  [/מגרד|מגרדת|מגרדים|גירוד|לגרד/, "grater"], [/מרדד|מרדדת|מרדדים|רידוד|לרדד/, "rollingPin"], [/מורח.*(דבק|צבע)/, "spatula"], [/מורח|מורחת|מורחים|מריחה|למרוח/, "knife"],
  [/משחיל|משחילה|משחילים|השחלה|קושר|קושרת|קושרים|קשירה|תולה|תולים|תולות/, "yarn"], [/מקפל|מקפלת|מקפלים|קיפול|לקפל/, "paper"], [/מחורר|מחוררת|מחוררים|ניקוב|לחורר/, "holePunch"],
  [/מודד.*(אורך|קו|סנטימטר)|מדידת.*אורך/, "ruler"], [/מודד|מודדת|מודדים|מדידה|למדוד/, "spoon"], [/מוזג|מוזגת|מוזגים|מזיגה|שופך|שופכת|שופכים|שפיכה|למזוג|לשפוך/, "cup"],
  [/מעביר.*(פומפון|חרוז|פריט קטן)|אוסף.*(פומפון|חרוז)|אוספ.*(פומפון|חרוז)/, "tweezers"], [/ממיס|ממיסה|ממיסים|המסה|להמיס|מכניס.*מיקרוגל/, "microwave"],
  [/מקרר|מקררת|מקררים|קירור|מצנן|מצננת|מצננים/, "fridge"], [/אופה|אופים|אופות|אפייה|לאפות|מכניס.*תנור/, "oven"], [/מדפיס|מדפיסה|מדפיסים|הדפסה|להדפיס/, "printer"], [/מאיר|מאירה|מאירים|מחפש.*בחושך/, "flashlight"],
  [/מכסה.*עיניים|מכסים.*עיניים|עוצם.*עיניים|עוצמים.*עיניים/, "blindfold"], [/מקליט|מקליטה|מקליטים|מצלם|מצלמת|מצלמים|משמיע.*מוזיקה/, "phone"], [/מנפח|מנפחת|מנפחים|ניפוח|לנפח/, "balloons"],
  [/פותח.*אטב|פותחים.*אטב|סוגר.*אטב|סוגרים.*אטב|מצמיד.*אטב/, "clothespins"], [/מגלגל.*פלסטלינה|לש.*פלסטלינה/, "plasticine"], [/סוחט|סוחטת|סוחטים|סחיטה|סופג|סופגת|סופגים|מנגב|מנגבת|מנגבים/, "sponge"],
  [/ממלא.*בקבוק|ממלאים.*בקבוק|מעביר.*לבקבוק/, "funnel"], [/מסובב|מסובבת|מסובבים|סיבוב|לסובב/, "dreidel"], [/בונה|בונים|בונות|בנייה|לבנות|מרכיב|מרכיבה|מרכיבים/, "blocks"],
  [/קופץ.*טרמפולינה|קופצים.*טרמפולינה/, "trampoline"], [/קופץ.*חישוק|קופצים.*חישוק|בין החישוקים/, "hoops"], [/זוחל.*מנהרה|זוחלים.*מנהרה/, "tunnel"],
  [/מטפס.*סולם|מטפסים.*סולם/, "ropeLadder"], [/מטפס.*קיר|מטפסים.*קיר/, "climbingWall"], [/מתנדנד|מתנדנדת|מתנדנדים/, "hammock"], [/שיווי משקל|הולך.*קו|הולכים.*קו/, "balance"],
  [/בועט|בועטת|בועטים|בעיטה|זורק|זורקת|זורקים|זריקה|תופס.*כדור|תופסים.*כדור/, "ball"], [/מודד.*זמן|מודדים.*זמן|מפעיל.*טיימר|מפעילים.*טיימר|סופר.*שניות|סופרים.*שניות/, "timer"], [/מקבע|מקבעת|מקבעים|מצמיד.*דבק/, "tape"],
];

function normalize(text) { return String(text || "").replace(/[\u0591-\u05c7]/g, ""); }

export function toolNameIcon(text) {
  return toolNameIcons(text)[0] || null;
}

export function toolNameIcons(text) {
  const value = normalize(text);
  return [...new Set(EXPLICIT_TOOLS.filter(([re]) => re.test(value)).map(([, key]) => TOOLS[key]).filter(Boolean))];
}

export function actionToolIcon(text) {
  return actionToolIcons(text)[0] || null;
}

export function actionToolIcons(text) {
  const value = normalize(text);
  const explicit = toolNameIcons(value);
  let actions = ACTIONS.filter(([re]) => re.test(value)).map(([, key]) => TOOLS[key]).filter(Boolean);
  // חיתוך מזון או אזכור מפורש של סכין/קורצן גוברים על ברירת המחדל של מספריים.
  if ((actions.includes(TOOLS.knife) || explicit.includes(TOOLS.knife) || explicit.includes(TOOLS.cutters)) && !explicit.includes(TOOLS.scissors)) {
    actions = actions.filter((path) => path !== TOOLS.scissors);
  }
  return [...new Set([...explicit, ...actions])];
}
