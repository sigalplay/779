import fs from "node:fs";

const path = "src/lib/activities-data.js";
const source = fs.readFileSync(path, "utf8");
const start = source.indexOf("[");
const end = source.lastIndexOf("];" ) + 1;
const activities = Function(`return ${source.slice(start, end)}`)();

const byId = (id) => activities.find((activity) => activity.id === id);

const littleEye = byId("seed-44");
littleEye.short_description = "משחק שמתאים לנסיעות, למקלחת ולזמנים \"מתים\" ללא הכנה מראש וללא מסכים.";
littleEye.short_descriptionN = "מִשְׂחָק שֶׁמַּתְאִים לִנְסִיעוֹת, לַמִּקְלַחַת וְלִזְמַנִּים \"מֵתִים\" לְלֹא הֲכָנָה מֵרֹאשׁ וּלְלֹא מַסָּכִים.";
littleEye.description = littleEye.short_description;
littleEye.descriptionN = littleEye.short_descriptionN;
littleEye.preparation = "";
littleEye.preparationN = "";
littleEye.steps = [];
littleEye.flow_text = "המשתתף הראשון בוחר חפץ בסביבה מבלי לגלות מהו. הוא מתאר אותו לפי מאפיין אחד (צבע, גודל, אות פותחת...). שאר המשתתפים מנחשים מה החפץ. מי שניחש נכון, בוחר את החפץ הבא.";
littleEye.flow_textN = "הַמִּשְׁתַּתֵּף הָרִאשׁוֹן בּוֹחֵר חֵפֶץ בַּסְּבִיבָה מִבְּלִי לְגַלּוֹת מַהוּ. הוּא מְתָאֵר אוֹתוֹ לְפִי מְאַפְיֵן אֶחָד (צֶבַע, גֹּדֶל, אוֹת פּוֹתַחַת...). שְׁאָר הַמִּשְׁתַּתְּפִים מְנַחֲשִׁים מָה הַחֵפֶץ. מִי שֶׁנִּחֵשׁ נָכוֹן, בּוֹחֵר אֶת הַחֵפֶץ הַבָּא.";

const suitcase = byId("seed-45");
suitcase.short_description = "משחק שמתאים לנסיעות, למקלחת ולזמנים \"מתים\" ללא הכנה מראש וללא מסכים.";
suitcase.short_descriptionN = "מִשְׂחָק שֶׁמַּתְאִים לִנְסִיעוֹת, לַמִּקְלַחַת וְלִזְמַנִּים \"מֵתִים\" לְלֹא הֲכָנָה מֵרֹאשׁ וּלְלֹא מַסָּכִים.";
suitcase.description = suitcase.short_description;
suitcase.descriptionN = suitcase.short_descriptionN;
suitcase.preparation = "";
suitcase.preparationN = "";
suitcase.steps = [];
suitcase.flow_text = "השחקן הראשון פותח: \"נסעתי לטיול ולקחתי במזוודה... (פריט)\". השחקן הבא חוזר על הפריט הקודם ומוסיף פריט חדש משלו. כך ממשיכים את השרשרת עד שמישהו מתבלבל ברצף.";
suitcase.flow_textN = "הַשַּׂחְקָן הָרִאשׁוֹן פּוֹתֵחַ: \"נָסַעְתִּי לְטִיּוּל וְלָקַחְתִּי בַּמִּזְוָדָה... (פְּרִיט)\". הַשַּׂחְקָן הַבָּא חוֹזֵר עַל הַפְּרִיט הַקּוֹדֵם וּמוֹסִיף פְּרִיט חָדָשׁ מִשֶּׁלּוֹ. כָּךְ מַמְשִׁיכִים אֶת הַשַּׁרְשֶׁרֶת עַד שֶׁמִּישֶׁהוּ מִתְבַּלְבֵּל בָּרֶצֶף.";

const rattles = byId("seed-88");
rattles.short_description = "כשהרעשן מסתובב נעים בחדר ורוקדים. כשהרעשן עוצר, עוצרים ונשארים קפואים במקום.";
rattles.short_descriptionN = "כְּשֶׁהָרַעֲשָׁן מִסְתּוֹבֵב נָעִים בַּחֶדֶר וְרוֹקְדִים. כְּשֶׁהָרַעֲשָׁן עוֹצֵר, עוֹצְרִים וְנִשְׁאָרִים קְפוּאִים בַּמָּקוֹם.";
rattles.description = rattles.short_description;
rattles.descriptionN = rattles.short_descriptionN;
rattles.steps = [
  {
    n: 1,
    text: "כשהרעשן מסתובב - נעים בחדר ורוקדים.",
    textN: "כְּשֶׁהָרַעֲשָׁן מִסְתּוֹבֵב - נָעִים בַּחֶדֶר וְרוֹקְדִים.",
  },
  {
    n: 2,
    text: "כשהרעשן עוצר - צריך לעצור ולהישאר קפואים במקום.",
    textN: "כְּשֶׁהָרַעֲשָׁן עוֹצֵר - צָרִיךְ לַעֲצֹר וּלְהִשָּׁאֵר קְפוּאִים בַּמָּקוֹם.",
  },
];

const withoutBag = activities.filter((activity) => activity.id !== "seed-42");
withoutBag.push({
  id: "seed-104",
  title: "מאיפה הרעש?",
  titleN: "מֵאֵיפֹה הָרַעַשׁ?",
  short_description: "מחביאים בבית חפץ מרעיש, והילד צריך למצוא מהיכן מקור הקול.",
  short_descriptionN: "מַחְבִּיאִים בַּבַּיִת חֵפֶץ מַרְעִישׁ, וְהַיֶּלֶד צָרִיךְ לִמְצֹא מֵהֵיכָן מְקוֹר הַקּוֹל.",
  description: "מחביאים בבית חפץ מרעיש, והילד צריך למצוא מהיכן מקור הקול.",
  descriptionN: "מַחְבִּיאִים בַּבַּיִת חֵפֶץ מַרְעִישׁ, וְהַיֶּלֶד צָרִיךְ לִמְצֹא מֵהֵיכָן מְקוֹר הַקּוֹל.",
  age_min: 3,
  age_max: 9,
  duration_min: 10,
  difficulty: "easy",
  equipment: "home",
  categories: ["ויסות חושי", "בקרה"],
  emoji: "🔔",
  goals: ["ויסות חושי", "בקרה"],
  difficulties: ["רגישות לרעש"],
  materials: ["חפץ מרעיש (למשל רעשן, פעמון או טלפון)"],
  materialsN: ["חֵפֶץ מַרְעִישׁ (לְמָשָׁל רַעֲשָׁן, פַּעֲמוֹן אוֹ טֵלֵפוֹן)"],
  preparation: "",
  preparationN: "",
  steps: [],
  flow_text: "מחביאים בבית חפץ מרעיש, והילד צריך למצוא מהיכן מקור הקול.",
  flow_textN: "מַחְבִּיאִים בַּבַּיִת חֵפֶץ מַרְעִישׁ, וְהַיֶּלֶד צָרִיךְ לִמְצֹא מֵהֵיכָן מְקוֹר הַקּוֹל.",
  adaptations: "מניחים את החפץ במקום גלוי. משתמשים ברמזים לפי הקרבה לחפץ: \"חם\" - במידה וקרובים; \"קר\" - במידה ורחוקים.",
  adaptationsN: "מַנִּיחִים אֶת הַחֵפֶץ בְּמָקוֹם גָּלוּי. מִשְׁתַּמְּשִׁים בִּרְמָזִים לְפִי הַקִּרְבָה לַחֵפֶץ: \"חַם\" - בְּמִדָּה וּקְרוֹבִים; \"קַר\" - בְּמִדָּה וּרְחוֹקִים.",
  extensions: "מחביאים מספר חפצים מרעישים ומבקשים מהילד למצוא בכל פעם חפץ מסוים.",
  extensionsN: "מַחְבִּיאִים מִסְפַּר חֲפָצִים מַרְעִישִׁים וּמְבַקְּשִׁים מֵהַיֶּלֶד לִמְצֹא בְּכָל פַּעַם חֵפֶץ מְסֻיָּם.",
  functions: ["בקרה"],
  sensory_systems: ["שמיעתית"],
  moments: ["משעמם בבית", "אחרי המסגרת"],
  tags: ["שמיעה", "חיפוש", "ויסות חושי"],
  audience: "both",
  ai_generated: false,
  created_at: "2026-08-10T00:00:00Z",
  searchStatus: "active",
});

fs.writeFileSync(path, `// נתוני ${withoutBag.length} הפעילויות המלאים של האפליקציה.\nexport const SEED_ACTIVITIES = ${JSON.stringify(withoutBag, null, 2)};\n`);
