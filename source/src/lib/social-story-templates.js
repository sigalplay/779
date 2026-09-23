const n = (name) => name?.trim() || "אני";
const ILLUSTRATIONS = "/icon-bank/social-stories";
const forms = (gender) => gender === "boy"
  ? { big: "אח גדול", can: "יכול", start: "מתחיל", go: "הולך", wear: "לובש", child: "ילד" }
  : { big: "אחות גדולה", can: "יכולה", start: "מתחילה", go: "הולכת", wear: "לובשת", child: "ילדה" };

function genderize(text, gender) {
  const boy = gender === "boy";
  const pairs = {
    "מרגיש/ה": ["מרגיש", "מרגישה"], "יכול/ה": ["יכול", "יכולה"], "הולך/ת": ["הולך", "הולכת"],
    "מוריד/ה": ["מוריד", "מורידה"], "מתיישב/ת": ["מתיישב", "מתיישבת"], "מנגב/ת": ["מנגב", "מנגבת"],
    "שוטף/ת": ["שוטף", "שוטפת"], "לומד/ת": ["לומד", "לומדת"], "חייב/ת": ["חייב", "חייבת"],
  };
  return Object.entries(pairs).reduce((value, [token, forms]) => value.replaceAll(token, boy ? forms[0] : forms[1]), text);
}

export const STORY_TEMPLATES = [
  { id: "toilet", title: "נפרדים מהחיתול", emoji: "🚽", illustration: `${ILLUSTRATIONS}/toilet-cover-girl.webp`, description: "סיפור רגוע על מעבר לתחתונים, בקשת עזרה ופספוסים." },
  { id: "sibling", title: "נולד לי אח או אחות", emoji: "👶", illustration: `${ILLUSTRATIONS}/sibling-cover-girl.webp`, description: "מתכוננים לתינוק חדש ולשינויים בבית." },
  { id: "kindergarten", title: "אני מתחיל/ה גן חדש", emoji: "🧸", illustration: `${ILLUSTRATIONS}/kindergarten-cover-girl.png`, description: "היכרות עם הגן, הפרידה והחזרה הביתה." },
  { id: "school", title: "אני מתחיל/ה בית ספר חדש", emoji: "🎒", illustration: `${ILLUSTRATIONS}/school-cover-girl.webp`, description: "מתכוננים לכיתה, לצוות ולשגרה החדשה." },
];

export function createTemplateStory(templateId, childName, gender = "girl", kindergartenRest = "sleep", illustrationStyle = "new", language = "he") {
  const f = forms(gender);
  const name = n(childName);
  const templates = {
    toilet: {
      title: `${name === "אני" ? "אני" : name} נפרד${gender === "boy" ? "" : "ת"} מהחיתול`,
      pages: [
        [`${name === "אני" ? "אני" : `קוראים לי ${name}. אני`} ${f.child} שגדל${gender === "boy" ? "" : "ה"} ולומד${gender === "boy" ? "" : "ת"} דברים חדשים.`, "😊"],
        [`עכשיו אני נפרד${gender === "boy" ? "" : "ת"} מהחיתול ו${f.wear} תחתונים.`, "✨"],
        ["כשאני מרגיש/ה שיש לי פיפי או קקי, אני יכול/ה לספר לאמא, לאבא או למבוגר שעוזר לי.", "🤝"],
        ["אני הולך/ת לשירותים, מוריד/ה את המכנסיים ומתיישב/ת בנוחות.", "🚽"],
        ["אני יכול/ה לשבת בנחת ולתת לגוף שלי זמן. מבוגר יכול לחכות לידי ולעזור לי.", "🙂"],
        ["לפעמים הפיפי או הקקי יוצאים בשירותים, ולפעמים עדיין לא. הגוף שלי לומד.", "🙂"],
        ["אם בורח לי, זה לא נורא. מנקים, מחליפים בגדים וממשיכים הלאה.", "😌"],
        ["אחרי השירותים אני מנגב/ת, מוריד/ה את המים ושוטף/ת ידיים.", "🧼"],
        ["אחר כך אני יכול/ה לחזור לשחק. בכל פעם אני לומד/ת עוד קצת.", "🧸"],
      ],
    },
    sibling: {
      title: `${name === "אני" ? "אני" : name} ${f.big}`,
      pages: [
        ["במשפחה שלנו עומד להיוולד תינוק חדש.", "👶"],
        ["כשהתינוק ייוולד, אמא תהיה בבית החולים לזמן מה ומבוגר מוכר יהיה איתי.", "🏥"],
        ["התינוק עדיין לא יודע לאכול לבד. אמא או אבא יאכילו אותו.", "🍽️"],
        ["התינוק עדיין לא יודע ללכת לשירותים. אמא או אבא יחליפו לו חיתול.", "🧷"],
        ["התינוק עדיין לא יודע לישון לבד, אז המבוגרים יחזיקו וירדימו אותו.", "🛁"],
        ["לפעמים אמא או אבא יהיו עסוקים עם התינוק. אני יכול/ה לחכות, לבקש עזרה או לבחור משהו לעשות בינתיים.", "😌"],
        ["אני יכול/ה ללטף בעדינות, לשיר, להביא מוצץ או לעזור בדרך שמתאימה לי.", "❤️"],
        ["זה שינוי גדול, ומותר לי להרגיש שמחה, סקרנות, געגוע, כעס או כמה רגשות ביחד.", "🙂"],
        ["יש דברים שישתנו, ויש דברים שיישארו אותו הדבר.", "✨"],
        ["גם אחרי שהתינוק ייוולד, נמשיך להתחבק, לשחק ולבלות יחד.", "🧸"],
        ["אמא ואבא תמיד יאהבו אותי. המקום שלי במשפחה נשאר מיוחד ובטוח.", "❤️"],
      ],
    },
    kindergarten: {
      title: `${name === "אני" ? "אני" : name} ${f.start} גן חדש`,
      pages: [
        [`בקרוב אני ${f.start} ללכת לגן חדש.`, "🧸"],
        ["בגן יהיו גננות שיעזרו לי, ילדים שאוכל לשחק איתם ומשחקים חדשים שאוכל לשחק בהם.", "🤝"],
        ["בבוקר אגיע לגן עם אמא או עם אבא.", "👋"],
        [`אם אתגעגע, אני ${gender === "boy" ? "יכול" : "יכולה"} להסתכל על תמונה, לחבק בובה, או לפנות לגננת לעזרה.`, "😌"],
        ["במהלך היום אני אשחק במשחקים, אוכל עם כולם, אשתתף במפגש ואוכל לנוח כשאצטרך.", "✨"],
        ["לאט לאט אכיר את סדר היום, את הגננות ואת הילדים בגן.", "🙂"],
        ["בסוף היום, אמא או אבא יבואו לקחת אותי, ואחזור הביתה.", "🏠"],
      ],
    },
    school: {
      title: `${name === "אני" ? "אני" : name} ${f.start} בית ספר חדש`,
      pages: [
        [`בקרוב אני ${f.start} ללמוד בבית ספר חדש.`, "🎒"],
        ["בבית הספר יהיו כיתה, מורה, ילדים ומקומות חדשים שאכיר בהדרגה.", "🏫"],
        ["בבוקר אגיע עם התיק ואיפרד מהמבוגר שמלווה אותי.", "👋"],
        ["בכיתה אקשיב, אלמד, אשאל שאלות ואקבל עזרה כשאצטרך.", "🤝"],
        ["יהיו גם הפסקות. אוכל לשחק, לאכול או לפנות למבוגר אם לא אדע מה לעשות.", "🧸"],
        ["מותר לי להתרגש וגם לחשוש. הרבה ילדים מרגישים כך כשהם מתחילים מקום חדש.", "😌"],
        ["לאט לאט אלמד את הדרך, את סדר היום ואת שמות האנשים.", "🙂"],
        ["בסוף יום הלימודים אחזור הביתה ואוכל לספר מה היה לי היום.", "🏠"],
      ],
    },
  };
  const englishTemplates = {
    toilet: { title: `${name === "אני" ? "I" : name} Say Goodbye to Nappies`, pages: [
      [`${name === "אני" ? "I am" : `My name is ${name}. I am`} a growing child, and I am learning new things.`, "😊"],
      ["Now I am saying goodbye to nappies and wearing underwear.", "✨"], ["When I feel that I need a wee or a poo, I can tell Mum, Dad, or another adult who helps me.", "🤝"],
      ["I go to the toilet, pull down my trousers, and sit comfortably.", "🚽"], ["I can sit calmly and give my body time. An adult can wait nearby and help me.", "🙂"],
      ["Sometimes the wee or poo goes in the toilet, and sometimes it does not yet. My body is learning.", "🙂"], ["If I have an accident, it is okay. We clean up, change clothes, and carry on.", "😌"],
      ["After using the toilet, I wipe, flush, and wash my hands.", "🧼"], ["Then I can go back to playing. Each time, I learn a little more.", "🧸"],
    ]},
    sibling: { title: `${name === "אני" ? "I Am" : name + " Is"} a Big ${gender === "boy" ? "Brother" : "Sister"}`, pages: [
      ["A new baby is going to be born into our family.", "👶"], ["When the baby is born, Mum will be in hospital for a while and a familiar adult will stay with me.", "🏥"],
      ["The baby cannot eat independently yet. Mum or Dad will feed the baby.", "🍽️"], ["The baby cannot use the toilet yet. Mum or Dad will change the baby's nappy.", "🧷"],
      ["The baby cannot fall asleep alone yet, so adults will hold and settle the baby.", "🛁"], ["Sometimes Mum or Dad will be busy with the baby. I can wait, ask for help, or choose something to do meanwhile.", "😌"],
      ["I can stroke the baby gently, sing, bring a dummy, or help in a way that feels right for me.", "❤️"], ["This is a big change. I may feel happy, curious, sad, angry, or several feelings at once.", "🙂"],
      ["Some things will change, and some things will stay the same.", "✨"], ["After the baby is born, we will still cuddle, play, and spend time together.", "🧸"],
      ["Mum and Dad will always love me. My place in the family remains special and secure.", "❤️"],
    ]},
    kindergarten: { title: `${name === "אני" ? "I Am" : name + " Is"} Starting a New Preschool`, pages: [
      ["Soon I will start going to a new preschool.", "🧸"], ["There will be teachers who help me, children I can play with, and new toys and games.", "🤝"],
      ["In the morning, I will arrive with Mum or Dad.", "👋"], ["If I miss home, I can look at a photo, cuddle a toy, or ask a teacher for help.", "😌"],
      ["During the day, I will play, eat with everyone, join group time, and rest when I need to.", "✨"], ["Little by little, I will learn the routine and get to know the teachers and children.", "🙂"],
      ["At the end of the day, Mum or Dad will collect me and I will go home.", "🏠"],
    ]},
    school: { title: `${name === "אני" ? "I Am" : name + " Is"} Starting a New School`, pages: [
      ["Soon I will start learning at a new school.", "🎒"], ["At school, there will be a classroom, teacher, children, and new places that I will get to know gradually.", "🏫"],
      ["In the morning, I will arrive with my bag and say goodbye to the adult who brings me.", "👋"], ["In class, I will listen, learn, ask questions, and get help when I need it.", "🤝"],
      ["There will also be breaks. I can play, eat, or ask an adult if I do not know what to do.", "🧸"], ["It is okay to feel excited and worried. Many children feel this way when they start somewhere new.", "😌"],
      ["Little by little, I will learn the way, the daily routine, and people's names.", "🙂"], ["At the end of the school day, I will go home and can tell someone about my day.", "🏠"],
    ]},
  };
  const story = language === "en" ? (englishTemplates[templateId] || englishTemplates.kindergarten) : (templates[templateId] || templates.kindergarten);
  const pages = story.pages.map(([text, emoji], index) => {
    const oldIllustrationNumber = index + 1 + (templateId === "sibling" ? 1 : 0);
    const oldIllustration = `${ILLUSTRATIONS}/${templateId}-${oldIllustrationNumber}.webp`;
    const kindergartenRoutine = templateId === "kindergarten" && index === 4;
    const kindergartenArrival = templateId === "kindergarten" && index === 0;
    const kindergartenCustomIllustrations = templateId === "kindergarten"
      ? gender === "girl" ? {
          1: `${ILLUSTRATIONS}/kindergarten/kindergarten-teachers-two-children.png`,
          2: `${ILLUSTRATIONS}/kindergarten/kindergarten-arrival-with-parent.png`,
          3: `${ILLUSTRATIONS}/kindergarten/kindergarten-missing-home.png`,
        } : {
          1: `${ILLUSTRATIONS}/kindergarten/kindergarten-teachers-two-children.png`,
          2: `${ILLUSTRATIONS}/kindergarten/kindergarten-arrival-boy.png`,
          3: `${ILLUSTRATIONS}/kindergarten/boy-missing-home.png`,
          5: `${ILLUSTRATIONS}/kindergarten/boy-visual-schedule.png`,
          6: `${ILLUSTRATIONS}/kindergarten/boy-going-home.png`,
        }
      : {};
    const newIllustration = kindergartenArrival
      ? `${ILLUSTRATIONS}/kindergarten/kindergarten-arrival-${gender}.png`
      : kindergartenCustomIllustrations[index]
      ? kindergartenCustomIllustrations[index]
      : kindergartenRoutine
      ? `${ILLUSTRATIONS}/kindergarten/${gender === "boy" ? "boy-" : ""}daily-routine-${kindergartenRest === "no-sleep" ? "no-sleep" : "with-sleep"}.png`
      : `${ILLUSTRATIONS}/${templateId}-${index + 1 + (templateId === "sibling" ? 1 : 0)}-${gender}.webp`;
    const illustration = illustrationStyle === "old" ? oldIllustration : newIllustration;
    return [language === "en" ? text : genderize(text, gender), emoji, illustration, [], null, null];
  });
  return {
    ...story,
    illustrationStyle,
    cover: illustrationStyle === "old"
      ? `${ILLUSTRATIONS}/${templateId}.webp`
      : templateId === "kindergarten"
      ? `${ILLUSTRATIONS}/kindergarten-cover-${gender}.png`
      : templateId === "toilet"
      ? `${ILLUSTRATIONS}/toilet-cover-${gender}.webp`
      : templateId === "sibling"
      ? `${ILLUSTRATIONS}/sibling-cover-${gender}.webp`
      : templateId === "school"
      ? `${ILLUSTRATIONS}/school-cover-${gender}.webp`
      : `${ILLUSTRATIONS}/${templateId}.webp`,
    coverIntegrated: illustrationStyle === "old" || templateId === "kindergarten" || templateId === "toilet",
    coverFaceReplacement: illustrationStyle === "new" && (templateId === "kindergarten" || (templateId === "toilet" && gender === "girl")) ? ["child"] : [],
    coverFaceLayout: illustrationStyle === "new" ? (templateId === "kindergarten" ? `kindergarten-cover-${gender}` : templateId === "toilet" && gender === "girl" ? "toilet-cover-girl" : null) : null,
    coverFaceBase: illustrationStyle === "new" ? (templateId === "kindergarten" ? `${ILLUSTRATIONS}/kindergarten/kindergarten-cover-${gender}-headless.png` : templateId === "toilet" && gender === "girl" ? `${ILLUSTRATIONS}/toilet-cover-girl.webp` : null) : null,
    pages,
  };
}
