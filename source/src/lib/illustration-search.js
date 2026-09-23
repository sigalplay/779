import { ILLUSTRATION_FILES } from "./illustration-files.generated.js";
import { actionToolIcons, toolNameIcons } from "./action-tool-icons.js";
import { bankMaterialIcon, bankStepIcon } from "./icon-bank.js";

const ALIASES = {
  "תפוח": ["apple", "apples"], "תפוחים": ["apple", "apples"],
  "שוקולד": ["chocolate", "choco", "cocoa", "cacao"],
  "קקאו": ["cocoa", "cacao"],
  "לחם": ["bread", "toast"], "פרוסת לחם": ["bread", "toast"], "פרוסות לחם": ["bread", "toast"],
  "טורטייה": ["tortilla", "wrap"], "טורטיה": ["tortilla", "wrap"],
  "זית": ["olive", "olives"], "זיתים": ["olive", "olives"],
  "גבינה": ["cheese"], "גבינה צהובה": ["cheese"],
  "ביסקוויט": ["biscuit", "biscuits", "cookie", "cookies"], "ביסקוויטים": ["biscuit", "biscuits", "cookie", "cookies"],
  "עוגיה": ["cookie", "cookies", "biscuit"], "עוגייה": ["cookie", "cookies", "biscuit"], "עוגיות": ["cookie", "cookies", "biscuits"],
  "מקרר": ["fridge", "refrigerator", "cooling"],
  "דבק": ["glue", "adhesive"], "הדבקה": ["glue", "adhesive", "paste"], "מדביקים": ["glue", "adhesive"],
  "מספריים": ["scissors", "cutting"], "גזירה": ["scissors", "cut"],
  "מים": ["water"], "כוס": ["cup", "glass"], "צלחת": ["plate", "dish"], "קערה": ["bowl"], "מגש": ["tray"],
  "דבש": ["honey"], "חלב": ["milk"], "קמח": ["flour"], "סוכר": ["sugar"], "מלח": ["salt"], "שמן": ["oil"],
  "ביצה": ["egg"], "ביצים": ["egg", "eggs"], "בננה": ["banana"], "תות": ["strawberry"], "פירות": ["fruit", "fruits"],
  "סבון": ["soap"], "ברז": ["faucet", "tap"], "מיקרוגל": ["microwave"], "תנור": ["oven"],
  "סכין": ["knife"], "כף": ["spoon"], "כפית": ["spoon"], "מטרפה": ["whisk"], "מערוך": ["rolling-pin", "rollingpin"],
  "נייר": ["paper", "sheet"], "קרטון": ["cardboard", "poster-paper"], "טוש": ["marker"], "טושים": ["marker", "markers"],
  "עיפרון": ["pencil"], "צבעים": ["colors", "paint", "markers", "crayons"], "מכחול": ["brush"],
  "בלון": ["balloon"], "בלונים": ["balloon", "balloons"], "נר": ["candle"], "מצית": ["lighter"],
  "חומץ": ["vinegar"], "סודה": ["baking-soda", "soda"], "פונפונים": ["pompom", "pompoms"],
  "חרוזים": ["bead", "beads"], "חוט": ["string", "thread", "yarn"], "מקל": ["stick"], "מקלות": ["stick", "sticks"],
  "ארטיק": ["popsicle"], "אטב": ["clothespin", "peg"], "פלסטלינה": ["plasticine", "playdough"],
  "כדור": ["ball"], "קוביה": ["dice", "cube"], "קובייה": ["dice", "cube"], "פאזל": ["puzzle"],
};

const PATH_PRIORITY = [
  /\/material[-_/]/, /\/ingredient[-_/]/, /-material-/, /-ingredient-/, /\/tools?\//,
  /\/manual\//, /\/experiments?\//, /\/recipes?\//, /\/kitchen-/,
];

// Common ingredients need a semantic match, not every file from a recipe folder
// whose name happens to contain the ingredient. These verified, clean cutouts are
// intentionally returned on their own for these queries.
const CURATED_MATERIAL_RESULTS = [
  { test: /(?:^|\s)ממרח שוקולד(?:\s|$)/, paths: ["/icon-bank/manual/sandwich-chocolate-spread.webp", "/icon-bank/manual/chocolate-spread-jar-3.webp"] },
  { test: /(?:^|\s)(?:שוקולד|חבילת שוקולד)(?:\s|$)/, paths: ["/icon-bank/manual/chocolate-chunks.webp", "/icon-bank/manual/chocolate-apple-slices/ingredient-chocolate-v2.png"] },
  { test: /(?:^|\s)קקאו(?:\s|$)/, paths: ["/icon-bank/manual/mug-cake-new/mug-cake-cocoa.webp"] },
  { test: /(?:^|\s)(?:פרוסת|פרוסות)?\s*לחם(?:\s|$)/, paths: ["/icon-bank/manual/chocolate-toastie-new/chocolate-toastie-bread.webp"] },
  { test: /(?:^|\s)טורטיי?ה(?:\s|$)/, paths: ["/icon-bank/manual/pizza-new/pizza-tortilla.webp"] },
  { test: /(?:^|\s)זיתים?(?:\s|$)/, paths: ["/icon-bank/manual/olive-muffins-new/olive-muffins-olives.webp"] },
  { test: /(?:^|\s)גבינה(?:\s|$)/, paths: ["/icon-bank/manual/pizza-new/pizza-cheese.webp"] },
];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u0591-\u05c7]/g, "")
    .replace(/[^a-z0-9\u05d0-\u05ea]+/g, " ")
    .trim();
}

function stems(value) {
  const words = normalize(value).split(/\s+/).filter((word) => word.length > 1);
  const result = new Set(words);
  for (const word of words) {
    if (word.length > 4 && word.endsWith("ים")) result.add(word.slice(0, -2));
    if (word.length > 4 && word.endsWith("ות")) result.add(word.slice(0, -2));
    if (word.length > 4 && word.startsWith("ה")) result.add(word.slice(1));
    if (word.length > 4 && word.startsWith("ל")) result.add(word.slice(1));
    if (word.length > 4 && word.endsWith("s")) result.add(word.slice(0, -1));
  }
  return [...result];
}

function queryTerms(text) {
  const base = stems(text);
  const expanded = new Set(base);
  for (const [hebrew, english] of Object.entries(ALIASES)) {
    const aliasStems = stems(hebrew);
    if (aliasStems.some((alias) => base.includes(alias) || base.some((word) => word.includes(alias) || alias.includes(word)))) {
      english.flatMap(stems).forEach((term) => expanded.add(term));
    }
  }
  return [...expanded];
}

function filenameSubject(file) {
  const segments = file.path.split("/");
  const basename = normalize(segments.at(-1));
  if (/^(?:ingredient|material|tool)\s/.test(basename)) return basename;
  const parentTokens = new Set(normalize(segments.at(-2)).split(/\s+/));
  return basename
    .replace(/^(?:chocolate lollipops|recipe choco)\s+/, "")
    .split(/\s+/)
    .filter((token) => !parentTokens.has(token) && !/^(?:new|flat|v\d+|illustrated|independent)$/.test(token))
    .join(" ");
}

function isUsableMaterial(file) {
  if (/(?:\/kitchen-crafts\/|\/kitchen-toast-steps\/)/.test(file.path)) return false;
  if (/(?:hero|cover|step|action|process|printable|worksheet|logo|banner|preview)/i.test(file.path)) return false;
  if (file.width && file.height) {
    const ratio = file.width / file.height;
    if (file.width < 96 || file.height < 96 || ratio > 2.2 || ratio < 0.45) return false;
  }
  return true;
}

function scorePath(file, terms, kind) {
  if (kind === "material" && !isUsableMaterial(file)) return 0;
  const subject = filenameSubject(file);
  const pathName = file.path;
  const haystack = kind === "material" ? subject : normalize(pathName.replace("/icon-bank/", ""));
  const basename = normalize(pathName.split("/").pop());
  const tokens = new Set(haystack.split(/\s+/));
  const matchesTerm = (term, value = haystack, valueTokens = tokens) => valueTokens.has(term) || (term.length >= 5 && value.includes(term));
  if (kind === "material" && !terms.some((term) => matchesTerm(term))) return 0;
  const basenameTokens = new Set(basename.split(/\s+/));
  const basenameMatches = terms.some((term) => matchesTerm(term, basename, basenameTokens));
  // A recipe folder may mention apples/chocolate while a sibling file is actually a tray
  // or another ingredient. Keep process/hero images as useful context, but never present a
  // differently named ingredient/material/tool as though it were the searched object.
  if (kind === "material" && /(?:ingredient|material|tool)/.test(basename) && !basenameMatches) return 0;
  let score = 0;
  for (const term of terms) {
    if (tokens.has(term)) score += 30;
    else if (term.length >= 5 && haystack.includes(term)) score += 14;
  }
  if (!score) return 0;
  PATH_PRIORITY.forEach((pattern, index) => { if (pattern.test(pathName)) score += PATH_PRIORITY.length - index; });
  if (kind === "step" && /(?:step|action|process)/i.test(pathName)) score += 6;
  return score;
}

function canonicalKey(file) {
  return filenameSubject(file).replace(/\b(?:flat|small|large|new|v\d+|\d+)\b/g, "").trim();
}

export function searchIllustrations(text, kind = "material") {
  const normalizedText = normalize(text);
  if (kind === "material") {
    const curated = CURATED_MATERIAL_RESULTS.find(({ test }) => test.test(normalizedText));
    if (curated) return curated.paths;
  }
  const terms = queryTerms(text);
  const preferred = kind === "material"
    ? [...toolNameIcons(text), bankMaterialIcon(text)]
    : [...actionToolIcons(text), bankStepIcon(text)];
  const rankedFiles = ILLUSTRATION_FILES
    .map((file) => ({ file, score: scorePath(file, terms, kind) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.file.path.localeCompare(b.file.path));
  const seenHashes = new Set();
  const seenSubjects = new Set();
  const ranked = rankedFiles.filter(({ file }) => {
    const key = canonicalKey(file);
    if (seenHashes.has(file.hash) || (kind === "material" && key && seenSubjects.has(key))) return false;
    seenHashes.add(file.hash);
    if (key) seenSubjects.add(key);
    return true;
  }).map(({ file }) => file.path);
  const knownPaths = new Set(ILLUSTRATION_FILES.filter((file) => kind !== "material" || isUsableMaterial(file)).map((file) => file.path));
  return [...new Set([...preferred.filter((path) => path && knownPaths.has(path)), ...ranked])];
}

export function illustrationCount() { return ILLUSTRATION_FILES.length; }
