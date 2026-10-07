import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { IllustratedNavCard } from "@/components/IllustratedNavCard";
import { brandLogo, useTranslator } from "@/lib/language";

// פעילויות עונתיות בדף הבית. בורר הנושא מאפשר לעבור בין החגים.
// כל נושא מוצג רק בשפות שברשימה שלו (חגי ישראל בעברית בלבד). אם אין נושא לשפה, האזור לא מוצג.
const SEASONAL_TOPIC_LIST = [
  { id: "fall", he: "פעילויות לסתיו 🍂", en: "Fall activities 🍂", languages: ["he", "en"] },
  { id: "rosh-hashanah", he: "פעילויות לראש השנה 🍎", en: "Rosh Hashanah activities 🍎", languages: ["he"] },
];

const SEASONAL_TOPICS = {
  "rosh-hashanah": [
    { titleHe: "יצירת לוח שנה", titleEn: "Create a family calendar", image: "/icon-bank/navigation-v2/family-calendar-illustrated-v2.webp", altHe: "יצירת לוח שנה משפחתי להדפסה", altEn: "Create a printable family calendar", imageFit: "contain", to: "/parent/hebrew-calendar", badgeHe: "להכנת לוח שנה", badgeEn: "Create calendar" },
    { titleHe: "משושי הדבש", titleEn: "Honeycomb Shapes", image: "/icon-bank/manual/experiments/honey-hexagons-hero.webp", altHe: "ניסוי משושי הדבש לראש השנה", altEn: "Honeycomb shapes experiment for Rosh Hashanah", to: "/parent/experiments/honey-hexagons", badgeHe: "לניסוי", badgeEn: "View experiment" },
    { titleHe: "גרעיני הרימון", titleEn: "Pomegranate Seed Counting Craft", image: "/icon-bank/crafts-new/seed-110-pomegranate/hero.webp", altHe: "יצירת גרעיני רימון מנייר קרפ", altEn: "Pomegranate seeds craft using crepe paper", to: "/activity/seed-112?mode=parent&returnPath=%2F", badgeHe: "ליצירה", badgeEn: "View craft" },
    { titleHe: "פלחי תפוחים מצופים בשוקולד", titleEn: "Chocolate-Dipped Apple Slices", image: "/icon-bank/manual/chocolate-apple-slices/cover.webp", altHe: "מתכון פלחי תפוחים מצופים בשוקולד", altEn: "Chocolate-dipped apple slices recipe", to: "/parent/recipes/chocolate-apple-slices", badgeHe: "למתכון", badgeEn: "View recipe" },
  ],
  fall: [
    { titleHe: "עץ סתיו מכדורי נייר", titleEn: "Crumpled Paper Fall Tree", image: "/icon-bank/crafts-new/seed-131-crumpled-paper-tree/hero.webp", altHe: "עץ סתיו מכדורי נייר קרפ", altEn: "A fall tree made of crumpled crepe paper", imageFit: "contain", to: "/activity/seed-131?mode=parent&returnPath=%2F", badgeHe: "ליצירה", badgeEn: "View craft" },
    { titleHe: "קיפוד עלים", titleEn: "Leaf Hedgehog", image: "/icon-bank/crafts-new/seed-128-leaf-hedgehog/hero.webp", altHe: "קיפוד מבריסטול עם קוצים מעלים", altEn: "A cardstock hedgehog with leaf spikes", imageFit: "contain", to: "/activity/seed-128?mode=parent&returnPath=%2F", badgeHe: "ליצירה", badgeEn: "View craft" },
    { titleHe: "עלה קסום", titleEn: "Magic Leaf", image: "/icon-bank/crafts-new/seed-133-crayon-transfer/hero.webp", altHe: "ציורי סתיו בצבעי פנדה בטכניקת העברה", altEn: "Fall drawings made with the crayon transfer technique", imageFit: "contain", to: "/activity/seed-133?mode=parent&returnPath=%2F", badgeHe: "ליצירה", badgeEn: "View craft" },
    { titleHe: "כתר עלים", titleEn: "Leaf Crown", image: "/icon-bank/crafts-new/seed-132-leaf-crown/hero.webp", altHe: "כתר מעלי שלכת", altEn: "A crown made of fall leaves", imageFit: "contain", to: "/activity/seed-132?mode=parent&returnPath=%2F", badgeHe: "ליצירה", badgeEn: "View craft" },
    { titleHe: "מיון עלים", titleEn: "Leaf Sorting", image: "/icon-bank/crafts-new/seed-130-leaf-sorting/hero.webp", altHe: "מיון עלים לפי צבע וגודל", altEn: "Sorting leaves by color and size", imageFit: "contain", to: "/activity/seed-130?mode=parent&returnPath=%2F", badgeHe: "ליצירה", badgeEn: "View craft" },
    { titleHe: "הטבעת עלים", titleEn: "Leaf Prints", image: "/icon-bank/crafts-new/seed-129-leaf-prints/hero.webp", altHe: "הטבעת עלים בצבע", altEn: "Leaf prints made with paint", imageFit: "contain", to: "/activity/seed-129?mode=parent&returnPath=%2F", badgeHe: "ליצירה", badgeEn: "View craft" },
    { titleHe: "העתקת עלים בצבעי פנדה", titleEn: "Leaf Rubbing", image: "/icon-bank/crafts-new/seed-127-leaf-rubbing/hero.webp", altHe: "העתקת עלים בצבעי פנדה", altEn: "Leaf rubbings made with crayons", imageFit: "contain", to: "/activity/seed-127?mode=parent&returnPath=%2F", badgeHe: "ליצירה", badgeEn: "View craft" },
    { titleHe: "כתב סתרים של סתיו", titleEn: "Halloween Secret Code", image: "/icon-bank/navigation-v2/cipher-flat.webp", altHe: "יצירת כתב סתרים עם סמלים של סתיו", altEn: "Create a Halloween secret code", imageFit: "contain", to: "/parent/cipher?key=fall", toEn: "/parent/cipher?key=halloween", badgeHe: "לכתב סתרים", badgeEn: "Create code" },
  ],
};

// התאמות לדף הבית בפלאפון: כרטיסים נמוכים יותר ורשת של שלוש עמודות.
const MOBILE_HOME_CSS = "@media(max-width:639px){.home-screen .landing-home-logo{max-width:120px;margin-top:4px}.home-screen>.grid.gap-4>div>a{height:126px!important;min-height:126px!important;border-radius:18px!important}.home-screen>.grid.gap-4>div>a>img{right:0!important;left:auto!important;width:42%!important;height:100%!important;object-fit:cover!important}.home-screen>.grid.gap-4>div>a>div{top:0!important;right:42%!important;bottom:0!important;left:0!important;display:flex!important;align-items:center!important;padding:8px 10px!important;border-top:0!important;border-right:1px solid rgba(255,255,255,.7)!important}.home-screen>.grid.gap-4>div>a>div>div{width:100%!important;align-items:center!important;gap:5px!important}.home-screen>.grid.gap-4>div>a h2{font-size:17px!important;line-height:1.1!important}.home-screen>.grid.gap-4>div>a h2+p{margin-top:2px!important;font-size:13.5px!important;line-height:1.15!important}.home-screen>.grid.gap-4>div>a h2+p+p{margin-top:3px!important;font-size:10.5px!important;line-height:1.25!important}.home-screen>.grid.gap-4>div>a span{width:27px!important;height:27px!important;margin:0!important}.home-screen>.mt-5.grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important}.home-screen>.mt-5.grid>a{height:118px!important;min-height:118px!important;border-radius:16px!important}.home-screen>.mt-5.grid>a>div{padding:5px 6px!important}.home-screen>.mt-5.grid>a h2{font-size:11.5px!important;line-height:1.15!important}.home-screen>.mt-5.grid>a img{object-position:center!important}}";

export default function Landing() {
  const { language, t } = useTranslator();
  const topics = SEASONAL_TOPIC_LIST.filter((topic) => topic.languages.includes(language));
  const [chosenTopic, setSeasonalTopic] = useState(topics[0]?.id);
  const seasonalTopic = topics.some((topic) => topic.id === chosenTopic) ? chosenTopic : topics[0]?.id;
  const seasonalActivities = SEASONAL_TOPICS[seasonalTopic] || [];
  const pinkCaption = "!border-rose/45 !bg-secondary/95";
  // Order on the home page: stories, routine boards, ADL; then recipes, experiments, game builder;
  // the family calendar last, on its own row.
  const quickLinks = [
    ["/parent/social-stories", "/icon-bank/navigation-v2/social-stories-flat.webp", "מחולל סיפורים חברתיים", "Social Story Builder"],
    [language === "en" ? "/en/parent/routine-boards/" : "/parent/routine-boards/", "/icon-bank/navigation-v2/daily-routine-checklist.webp", "לוחות התארגנות לילדים", "Routine Boards for Children"],
    [language === "en" ? "/en/parent/daily-sequences/" : "/parent/daily-sequences/", "/icon-bank/daily-sequences/hands/rub.webp", "רצפי ADL", "ADL Visual Sequences"],
    ["/parent/recipes", "/icon-bank/navigation-v2/recipes-flat.webp", "מתכונים", "Kid-Friendly Recipes"],
    ["/parent/experiments", "/icon-bank/navigation-v2/experiments-flat.webp", "ניסויים", "Kids’ Science Experiments"],
    [language === "en" ? "/en/parent/card-games-generator/" : "/parent/card-games-generator/", "/assets/card-generator-home-v2.png", "מחולל משחקים", "Printable Game Builder"],
    ["/parent/hebrew-calendar", "/icon-bank/navigation-v2/family-calendar-illustrated-v2.webp", "יצירת לוח שנה", "Create a Family Calendar"],
  ];

  return (
    <AppShell mode="parent">
      <div className="home-screen mx-auto max-w-5xl py-2">
        <style>{MOBILE_HOME_CSS}</style>
        <div className="mb-5 animate-in fade-in slide-in-from-bottom-2 text-center duration-300">
          <h1 className="sr-only">{t("בואו נשחק – פעילויות וכלים לילדים", "Let’s Play – Activities and Tools for Children")}</h1>
          <img src={brandLogo(language)} alt={t("בואו נשחק", "Let's Play")} title={t("בואו נשחק", "Let's Play")} className="landing-home-logo mx-auto h-auto w-full max-w-[140px] md:max-w-[175px]" />
          <p className="mt-2 text-muted-foreground md:text-lg">
            {t("בואו נשחק – שפע של רעיונות וכלים במקום אחד – לבית, לגן ולקליניקה.", "Practical ideas and tools for home, preschool, and the therapy clinic.")}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <IllustratedNavCard
              eager
              to="/therapist/build"
              image="/icon-bank/navigation-v2/therapy-build-flat.webp"
              title={t("מטפלים", "Therapists")}
              subtitle={t("בנה לוח מובנה למפגש", "Plan a Therapy Session")}
              description={t("בחרו גיל, תחום התפתחות וזמן, ותכננו מפגש מובנה.", "Choose an age, developmental area, and duration to plan a structured session.")}
              large
              showArrow
              captionClassName={pinkCaption}
              className="h-full !min-h-[270px] md:!min-h-[290px]"
            />
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <IllustratedNavCard
              eager
              to="/parent/play"
              image="/icon-bank/navigation-v2/play-today-flat.webp"
              title={t("הורים", "Parents")}
              subtitle={t("במה נשחק היום?", "What Should We Play Today?")}
              description={t("בחרו גיל, תחום התפתחות וזמן, ונמצא רעיון מתאים.", "Choose a skill area and how much time you have to find an activity that fits your child.")}
              large
              showArrow
              captionClassName={pinkCaption}
              className="h-full !min-h-[270px] md:!min-h-[290px]"
            />
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
            {t("אפשר לחזור למסך הזה בכל שלב, ולעבור בין הכלים דרך התפריט העליון.", "You can return here at any time and use the top menu to move between tools.")}
          </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickLinks.map(([to, image, he, en]) => <IllustratedNavCard key={to} to={to} image={image} title={t(he, en)} captionClassName={pinkCaption} />)}
        </div>

        {topics.length > 0 && <section className="compact-seasonal-section mt-8 rounded-[2rem] border border-rose/55 bg-secondary/80 p-4 shadow-soft md:p-6" aria-labelledby="seasonal-title">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-rose">{t("פעילויות לפי התקופה", "Seasonal activities")}</p>
                <label className="block">
                  <span className="sr-only">{t("בחירת נושא הפעילויות", "Choose a seasonal topic")}</span>
                  <select
                    id="seasonal-title"
                    value={seasonalTopic}
                    onChange={(e) => setSeasonalTopic(e.target.value)}
                    className="cursor-pointer rounded-xl border border-rose/40 bg-white px-3 py-1.5 text-2xl font-black text-foreground shadow-sm outline-none transition hover:border-rose focus:ring-2 focus:ring-rose/30"
                  >
                    {topics.map((topic) => <option key={topic.id} value={topic.id}>{t(topic.he, topic.en)}</option>)}
                  </select>
                </label>
              </div>
              <span className="rounded-full bg-sky/70 px-3 py-1 text-xs font-bold text-foreground/70">{t("מתחלף לאורך השנה", "Updated throughout the year")}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {seasonalActivities.map((activity) => (
                <Link key={activity.to} to={language === "en" && activity.toEn ? activity.toEn : activity.to} className="overflow-hidden rounded-[1.5rem] border border-sky bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
                  <div className="aspect-[4/3] overflow-hidden bg-white">
                    <img
                      src={activity.image}
                      loading="lazy"
                      decoding="async"
                      alt={language === "en" ? activity.altEn : activity.altHe}
                      className={`h-full w-full ${activity.imageFit === "contain" ? "object-contain p-2" : "object-cover"}`}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 border-t border-rose/35 bg-rose/20 px-4 py-3">
                    <h3 className="font-extrabold text-foreground">{language === "en" ? activity.titleEn : activity.titleHe}</h3>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-rose shadow-sm">{language === "en" ? activity.badgeEn : activity.badgeHe}</span>
                  </div>
                </Link>
              ))}
            </div>
        </section>}
      </div>
    </AppShell>
  );
}
