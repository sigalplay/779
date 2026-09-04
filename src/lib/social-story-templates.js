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
  { id: "losing-game", title: "לפעמים מפסידים במשחק", emoji: "🎲", illustration: `${ILLUSTRATIONS}/losing-game/girl/cover.webp`, description: "מבינים מה מרגישים כשמפסידים ואילו אפשרויות יכולות לעזור.", personalized: false, style1Only: true },
  { id: "waiting-turn", title: "מחכים לתור", emoji: "⏳", illustration: `${ILLUSTRATIONS}/waiting-turn/girl/cover.webp`, description: "מכירים את ההמתנה לתור ואת הסימנים שמראים מתי התור מתקרב.", personalized: false, style1Only: true },
  { id: "not-getting-want", title: "כשלא מקבלים את מה שרוצים", emoji: "💭", illustration: `${ILLUSTRATIONS}/not-getting-want/girl/cover.webp`, description: "נותנים מקום לאכזבה ומכירים דרכים להתמודד איתה.", personalized: false, style1Only: true },
  { id: "personal-space", title: "שומרים על מרחב אישי", emoji: "↔️", illustration: `${ILLUSTRATIONS}/personal-space/girl/cover.webp`, description: "לומדים לזהות מרחב אישי, לבקש רשות ולהקשיב לסימנים של האחר.", personalized: false, style1Only: true },
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
    "losing-game": {
      title: "לפעמים מפסידים במשחק",
      pages: [
        ["במשחק יש כללים, תורות ותוצאה. לפעמים ילד אחד מנצח וילד אחר מפסיד.", "🎲"],
        ["הפסד יכול לעורר אכזבה, כעס או עצב. אלה רגשות טבעיים, ולכל אחד הם מרגישים קצת אחרת.", "😔"],
        ["כשהרגש חזק, אפשר לעצור לרגע, לנשום ולתת לגוף זמן להירגע.", "🌬️"],
        ["גם כשמאוכזבים, אפשר להשאיר את המשחק והחלקים במקומם ולשמור על הגוף של כולם.", "🧩"],
        ["אפשר לומר: ‘אני מאוכזב/ת שהפסדתי’, לבקש הפסקה קצרה או להציע משחק נוסף.", "💬"],
        ["אפשר לפרגן למי שניצח. הפסד הוא חלק ממשחק, ועם הזמן אפשר ללמוד להתמודד איתו.", "🤝"],
      ],
    },
    "waiting-turn": {
      title: "מחכים לתור",
      pages: [
        ["לפעמים כמה ילדים רוצים להשתמש באותו משחק או מתקן. כשמישהו כבר משתמש בו, האחרים מחכים לתורם.", "⏳"],
        ["המתנה יכולה להיות קשה. אפשר להרגיש חוסר סבלנות, התרגשות או חשש שהתור לא יגיע.", "🙂"],
        ["אפשר לבדוק מי בתור עכשיו ומי אחריו. סימן, רשימה או מבוגר יכולים לעזור להבין את הסדר.", "👀"],
        ["בזמן ההמתנה שומרים מרחק בטוח ומשאירים מקום לילד שמשתמש במתקן.", "↔️"],
        ["אפשר להסתכל, לנשום, לספור בשקט או לבחור משהו קטן לעשות עד שהתור מתפנה.", "🌬️"],
        ["כשהילד שלפנינו מסיים, התור מתקדם. עכשיו אפשר להשתמש במתקן, ואחר כך לפנות אותו לילד הבא.", "🛝"],
      ],
    },
    "not-getting-want": {
      title: "כשלא מקבלים את מה שרוצים",
      pages: [
        ["לפעמים רוצים מאוד חפץ, פעילות או תשובה מסוימת, אבל אי אפשר לקבל אותם באותו רגע.", "💭"],
        ["כששומעים ‘לא’ או ‘לא עכשיו’, אפשר להרגיש אכזבה, עצב או כעס. הרגש אמיתי גם כשהתשובה נשארת כפי שהיא.", "😞"],
        ["כשהאכזבה גדולה, הגוף עשוי להיות מתוח או חסר שקט. עצירה ונשימה יכולות לתת לרגש מעט מקום.", "🌬️"],
        ["אפשר לספר מה רצינו ומה אנחנו מרגישים: ‘רציתי את זה, ואני מאוכזב/ת’.", "💬"],
        ["לפעמים אפשר לברר אם הדבר יתאפשר בזמן אחר. לפעמים אפשר לבחור בין שתי אפשרויות אחרות.", "🔄"],
        ["בחירה אחרת אינה מוחקת את האכזבה, אבל היא יכולה לעזור להמשיך הלאה עד שהרגש נחלש.", "🧸"],
      ],
    },
    "personal-space": {
      title: "שומרים על מרחב אישי",
      pages: [
        ["לכל אדם יש מרחב אישי סביב הגוף. זהו המרחק שבו נעים ובטוח לו להיות ליד אנשים אחרים.", "↔️"],
        ["המרחב שמתאים לאדם אחד לא תמיד מתאים לאחר. הוא יכול להשתנות לפי המקום, הפעילות וההיכרות.", "👫"],
        ["פנים שמתרחקות, גוף שנסוג, יד שמסמנת לעצור או המילים ‘לא’ ו‘די’ יכולים לומר שצריך יותר מרחק.", "✋"],
        ["כשמבחינים בסימן כזה, אפשר לעצור ולזוז מעט לאחור. כך נותנים מקום ומראים שהקשבנו.", "👣"],
        ["לפני חיבוק, מגע או לקיחת חפץ אישי אפשר לשאול. האדם האחר יכול להסכים או לבחור שלא.", "❓"],
        ["אפשר להציע דרך אחרת להיות יחד, כמו נפנוף, כיף או משחק זה לצד זה. שמירה על מרחב עוזרת לכולם להרגיש בטוחים.", "🙌"],
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
    "losing-game": { title: "Sometimes We Lose a Game", pages: [
      ["Games have rules, turns, and an outcome. Sometimes one child wins and another child loses.", "🎲"], ["Losing can bring disappointment, anger, or sadness. These feelings are natural and can feel different for everyone.", "😔"],
      ["When a feeling is strong, it can help to pause, breathe, and give the body time to settle.", "🌬️"], ["Even when disappointed, the game pieces can stay in place and everyone's body can stay safe.", "🧩"],
      ["A child can say, ‘I feel disappointed that I lost,’ ask for a short break, or suggest another game.", "💬"], ["It is possible to congratulate the winner. Losing is part of playing, and coping with it can become easier with practice.", "🤝"],
    ]},
    "waiting-turn": { title: "Waiting for a Turn", pages: [
      ["Sometimes several children want the same game or piece of equipment. When someone is using it, the others wait for their turn.", "⏳"], ["Waiting can be difficult. A child may feel impatient, excited, or worried that the turn will not come.", "🙂"],
      ["It can help to check whose turn it is and who comes next. A visual sign, list, or adult can make the order clear.", "👀"], ["While waiting, children keep a safe distance and leave room for the child using the equipment.", "↔️"],
      ["A child can watch, breathe, count quietly, or choose a small activity until the turn is free.", "🌬️"], ["When the child ahead finishes, the turn moves forward. After using it, the equipment becomes available for the next child.", "🛝"],
    ]},
    "not-getting-want": { title: "When We Do Not Get What We Want", pages: [
      ["Sometimes a child really wants an object, activity, or particular answer, but cannot have it at that moment.", "💭"], ["Hearing ‘no’ or ‘not now’ can bring disappointment, sadness, or anger. The feeling is real even when the answer stays the same.", "😞"],
      ["When disappointment is big, the body may feel tense or restless. Pausing and breathing can make room for the feeling.", "🌬️"], ["A child can explain what they wanted and how they feel: ‘I wanted that, and I feel disappointed.’", "💬"],
      ["Sometimes it is possible to ask about another time. Sometimes there are two different choices available now.", "🔄"], ["Another choice does not erase disappointment, but it can help a child continue until the feeling becomes smaller.", "🧸"],
    ]},
    "personal-space": { title: "Respecting Personal Space", pages: [
      ["Every person has personal space around their body. It is the distance that feels comfortable and safe near other people.", "↔️"], ["The space that suits one person may not suit another. It can change with the place, activity, and relationship.", "👫"],
      ["A face turning away, a body stepping back, an open hand, or the words ‘no’ and ‘stop’ can mean that more space is needed.", "✋"], ["When someone notices such a sign, they can pause and step back. This gives space and shows that they listened.", "👣"],
      ["Before a hug, touch, or taking a personal object, it is helpful to ask. The other person may agree or choose not to.", "❓"], ["People can choose another way to connect, such as waving, a high-five, or playing side by side. Personal space helps everyone feel safe.", "🙌"],
    ]},
  };
  const story = language === "en" ? (englishTemplates[templateId] || englishTemplates.kindergarten) : (templates[templateId] || templates.kindergarten);
  const isGeneralSocialStory = ["losing-game", "waiting-turn", "not-getting-want", "personal-space"].includes(templateId);
  const pages = story.pages.map(([text, emoji], index) => {
    if (isGeneralSocialStory) {
      return [text, emoji, `${ILLUSTRATIONS}/${templateId}/${gender}/page-${index + 1}.webp`, [], null, null];
    }
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
    personalized: !isGeneralSocialStory,
    cover: isGeneralSocialStory
      ? `${ILLUSTRATIONS}/${templateId}/${gender}/cover.webp`
      : illustrationStyle === "old"
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
    coverIntegrated: isGeneralSocialStory || illustrationStyle === "old" || templateId === "kindergarten" || templateId === "toilet",
    coverFaceReplacement: illustrationStyle === "new" && (templateId === "kindergarten" || (templateId === "toilet" && gender === "girl")) ? ["child"] : [],
    coverFaceLayout: illustrationStyle === "new" ? (templateId === "kindergarten" ? `kindergarten-cover-${gender}` : templateId === "toilet" && gender === "girl" ? "toilet-cover-girl" : null) : null,
    coverFaceBase: illustrationStyle === "new" ? (templateId === "kindergarten" ? `${ILLUSTRATIONS}/kindergarten/kindergarten-cover-${gender}-headless.png` : templateId === "toilet" && gender === "girl" ? `${ILLUSTRATIONS}/toilet-cover-girl.webp` : null) : null,
    pages,
  };
}
