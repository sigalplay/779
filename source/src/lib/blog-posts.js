// The blog's articles. Each article has:
//   slug      the address (/blog/<slug>), in English letters
//   category  one of BLOG_CATEGORIES in blog.js
//   date      publish date (Israel time); until then the article is not on the site
//   keyword   the one search phrase this article targets, in each language. It must not be the
//             main phrase of any page of the site (see the SEO keyword map) or of another article.
//   image     the illustration at the top of the article
//   links     the site pages the article sends readers to (the pages that own the broader phrase)
//   he / en   title, description (for search results, up to about 155 characters) and body
//
// Body blocks: ["p", text], ["h2", text], ["ul", [items]], ["ol", [items]], ["tip", text].
// Inside text, [words](/path) is a link to a page of the site.
export const BLOG_POSTS = [
  {
    slug: "how-to-write-a-social-story",
    category: "social-stories",
    date: "2026-09-28",
    keyword: { he: "איך כותבים סיפור חברתי", en: "how to write a social story" },
    image: "/icon-bank/navigation-v2/social-stories-flat.webp",
    links: ["/parent/social-stories"],
    he: {
      title: "איך כותבים סיפור חברתי לילד – מדריך בשלבים",
      description: "איך כותבים סיפור חברתי שילד באמת מבין: בחירת מצב אחד, משפטים שמתארים ולא מטיפים, תמונות, ומתי לקרוא. מדריך קצר של מרפאה בעיסוק.",
      body: [
        ["p", "ילד שיודע מה עומד לקרות מרגיש בטוח יותר. זה כל הרעיון מאחורי סיפור חברתי: סיפור קצר ומאויר שמתאר לילד מצב מסוים – הליכה לרופא, יום ראשון בגן, אורחים בבית – מה קורה בו, מה אנשים מרגישים, ומה הוא יכול לעשות. הסיפורים החברתיים פותחו במקור עבור ילדים על הרצף האוטיסטי, אבל הם עוזרים לכל ילד שמתקשה עם שינוי, המתנה או מצב חדש."],
        ["h2", "שלב 1: בוחרים מצב אחד בלבד"],
        ["p", "סיפור טוב עוסק במצב אחד, ממוקד וקונקרטי. לא „איך מתנהגים יפה”, אלא „מה קורה כשסבתא באה לבקר” או „מה עושים כשמפסידים במשחק”. כדאי להתחיל ממצב שחוזר על עצמו ושגורם לקושי, כי שם הסיפור יעזור הכי מהר."],
        ["h2", "שלב 2: מסתכלים על המצב דרך העיניים של הילד"],
        ["p", "לפני שכותבים, שואלים: מה הילד רואה, שומע ומרגיש במצב הזה? מה מפחיד אותו או מבלבל אותו? ילד שבוכה במספרה אולי לא פוחד מהתספורת, אלא מהרעש של המכונה או מהשערות שנדבקות לצוואר. כשמבינים מה באמת קשה, יודעים מה לכתוב."],
        ["h2", "שלב 3: כותבים משפטים שמתארים, ומעט משפטים שמכוונים"],
        ["p", "רוב המשפטים בסיפור צריכים לתאר: מה קורה, מי נמצא שם ומה אנשים מרגישים. רק מעט משפטים מציעים לילד מה לעשות. כלל אצבע טוב: לפחות שני משפטים שמתארים על כל משפט שמכוון."],
        ["ul", [
          "משפט שמתאר: „במספרה יש מכונה שעושה רעש כמו זמזום.”",
          "משפט שמתאר רגש: „לפעמים הרעש מרגיש חזק מדי.”",
          "משפט שמכוון: „אני יכול לבקש לשים אוזניות.”",
        ]],
        ["p", "כותבים בגוף ראשון („אני”), בזמן הווה ובשפה חיובית. במקום „אסור לצעוק” כותבים „אני יכול לדבר בקול שקט”. כדאי להשאיר מקום לגמישות: „בדרך כלל”, „לפעמים”, כדי שהסיפור יישאר נכון גם כשמשהו משתנה."],
        ["h2", "שלב 4: משפט אחד בכל עמוד, עם תמונה"],
        ["p", "לילדים צעירים עדיף עמוד אחד לכל רעיון, עם תמונה ברורה ומשפט אחד או שניים. התמונה צריכה להראות בדיוק את מה שכתוב, בלי פרטים שמסיחים את הדעת. ב[מחולל הסיפורים החברתיים](/parent/social-stories) באתר אפשר לבחור סיפור מוכן, לשים בו את הדמות של הילד ולהדפיס."],
        ["h2", "שלב 5: קוראים יחד, בזמן רגוע"],
        ["p", "את הסיפור קוראים לפני המצב – לא בתוכו, וממש לא אחרי התפרצות. הזמן הכי טוב הוא רגע רגוע: לפני השינה, או בבוקר של היום שבו המצב יקרה. קוראים כמה ימים ברציפות, ומאפשרים לילד לדפדף לבד. אחרי שהמצב עבר, אפשר לקרוא שוב ולדבר על מה שהיה."],
        ["tip", "טיפ מהקליניקה: כשהסיפור מצליח, לא ממהרים להעלים אותו. משאירים אותו זמין, והילד יחזור אליו בעצמו כשירגיש צורך."],
        ["h2", "מתי לפנות לעזרה"],
        ["p", "אם הקושי במצבים מסוימים חוזר שוב ושוב, פוגע בתפקוד היומיומי של הילד או של המשפחה, או מלווה בהתפרצויות חזקות, כדאי להתייעץ עם מרפאה בעיסוק או עם איש מקצוע אחר שמכיר את הילד. סיפור חברתי הוא כלי מצוין, אבל הוא עובד הכי טוב כחלק מתוכנית שמתאימה לילד."],
      ],
    },
    en: {
      title: "How to Write a Social Story for Your Child: A Step-by-Step Guide",
      description: "How to write a social story your child really understands: one situation, sentences that describe rather than lecture, pictures, and when to read it.",
      body: [
        ["p", "Children feel safer when they know what is going to happen. That is the whole idea behind a social story: a short, illustrated story that describes one situation for a child – a doctor's visit, the first day of preschool, guests at home – what happens, how people feel, and what the child can do. Social stories were first developed for autistic children, but they help any child who struggles with change, waiting, or new situations."],
        ["h2", "Step 1: Choose one situation"],
        ["p", "A good story is about one focused, concrete situation. Not \"how to behave nicely\", but \"what happens when Grandma visits\" or \"what to do when I lose a game\". Start with a situation that keeps coming back and keeps being hard – that is where a story helps fastest."],
        ["h2", "Step 2: See the situation through your child's eyes"],
        ["p", "Before writing, ask: what does my child see, hear and feel in this situation? What scares or confuses them? A child who cries at the barber may not be afraid of the haircut at all, but of the clipper's noise or the hair on their neck. Once you know what is really hard, you know what to write."],
        ["h2", "Step 3: Mostly describing sentences, a few guiding ones"],
        ["p", "Most sentences should describe: what happens, who is there, and how people feel. Only a few should suggest what to do. A good rule of thumb: at least two describing sentences for every guiding sentence."],
        ["ul", [
          "Describing: \"At the barber there is a machine that buzzes.\"",
          "Describing a feeling: \"Sometimes the noise feels too loud.\"",
          "Guiding: \"I can ask to wear my headphones.\"",
        ]],
        ["p", "Write in the first person (\"I\"), in the present tense, and in positive language. Instead of \"No shouting\", write \"I can use a quiet voice\". Leave room for change with words like \"usually\" and \"sometimes\", so the story stays true when something is different."],
        ["h2", "Step 4: One sentence per page, with a picture"],
        ["p", "For young children, one idea per page works best, with a clear picture and one or two sentences. The picture should show exactly what the text says, with nothing distracting. In the site's [social story builder](/parent/social-stories) you can choose a ready story, put your child's character in it, and print it."],
        ["h2", "Step 5: Read it together at a calm time"],
        ["p", "Read the story before the situation – not during it, and never right after a meltdown. The best time is a calm moment: at bedtime, or on the morning of the day it will happen. Read it several days in a row and let your child turn the pages. Afterwards, read it again and talk about how it went."],
        ["tip", "A tip from the clinic: when a story works, don't rush to put it away. Keep it within reach, and your child will come back to it when they need it."],
        ["h2", "When to ask for help"],
        ["p", "If certain situations are hard again and again, affect your child's or your family's daily life, or come with strong meltdowns, talk with an occupational therapist or another professional who knows your child. A social story is a great tool, and it works best as part of a plan made for your child."],
      ],
    },
  },
];
