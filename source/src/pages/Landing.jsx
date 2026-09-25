import { useState } from "react";
import { Link } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { IllustratedNavCard } from "@/components/IllustratedNavCard";
import { brandLogo, useTranslator } from "@/lib/language";

// פעילויות עונתיות בדף הבית. בורר הנושא מאפשר לעבור בין החגים.
const SEASONAL_TOPICS = {
  sukkot: [
    { titleHe: "הכנת לוח שנה", titleEn: "Create a family calendar", image: "/icon-bank/navigation-v2/family-calendar-illustrated-v2.webp", altHe: "הכנת לוח שנה משפחתי להדפסה", altEn: "Create a printable family calendar", imageFit: "contain", to: "/parent/hebrew-calendar", badgeHe: "להכנה", badgeEn: "Create calendar" },
    { titleHe: "שרשרת לבבות", titleEn: "Paper Heart Chain", image: "/icon-bank/crafts-new/seed-120-heart-chain/hero.webp", altHe: "הכנת שרשרת לבבות צבעונית לסוכה", altEn: "Make a colorful paper heart chain", imageFit: "contain", to: "/activity/seed-120?mode=parent&returnPath=%2F", badgeHe: "ליצירה", badgeEn: "View craft" },
    { titleHe: "הכנת סוכה", titleEn: "3D Cardstock Sukkah", image: "/icon-bank/crafts-new/seed-119-sukkah/hero.webp", altHe: "הכנת סוכה תלת־ממדית מבריסטול", altEn: "Make a 3D cardstock sukkah", imageFit: "contain", to: "/activity/seed-119?mode=parent&returnPath=%2F", badgeHe: "ליצירה", badgeEn: "View craft" },
    { titleHe: "כתב סתרים של סוכות", titleEn: "Sukkot Secret Code", image: "/icon-bank/navigation-v2/cipher-flat.webp", altHe: "יצירת כתב סתרים עם סמלים של סוכות", altEn: "Create a Sukkot secret code", imageFit: "contain", to: "/parent/cipher?key=sukkot", badgeHe: "לכתב סתרים", badgeEn: "Create code" },
  ],
  "rosh-hashanah": [
    { titleHe: "יצירת לוח שנה", titleEn: "Create a family calendar", image: "/icon-bank/navigation-v2/family-calendar-illustrated-v2.webp", altHe: "יצירת לוח שנה משפחתי להדפסה", altEn: "Create a printable family calendar", imageFit: "contain", to: "/parent/hebrew-calendar", badgeHe: "להכנת לוח שנה", badgeEn: "Create calendar" },
    { titleHe: "משושי הדבש", titleEn: "Honeycomb Shapes", image: "/icon-bank/manual/experiments/honey-hexagons-hero.webp", altHe: "ניסוי משושי הדבש לראש השנה", altEn: "Honeycomb shapes experiment for Rosh Hashanah", to: "/parent/experiments?e=honey-hexagons", badgeHe: "לניסוי", badgeEn: "View experiment" },
    { titleHe: "גרעיני הרימון", titleEn: "Pomegranate Seed Counting Craft", image: "/icon-bank/crafts-new/seed-110-pomegranate/hero.webp", altHe: "יצירת גרעיני רימון מנייר קרפ", altEn: "Pomegranate seeds craft using crepe paper", to: "/activity/seed-112?mode=parent&returnPath=%2F", badgeHe: "ליצירה", badgeEn: "View craft" },
    { titleHe: "פלחי תפוחים מצופים בשוקולד", titleEn: "Chocolate-Dipped Apple Slices", image: "/icon-bank/manual/chocolate-apple-slices/cover.webp", altHe: "מתכון פלחי תפוחים מצופים בשוקולד", altEn: "Chocolate-dipped apple slices recipe", to: "/parent/recipes?r=chocolate-apple-slices", badgeHe: "למתכון", badgeEn: "View recipe" },
  ],
};

// התאמות לדף הבית בפלאפון: כרטיסים נמוכים יותר ורשת של שלוש עמודות.
const MOBILE_HOME_CSS = "@media(max-width:639px){.home-screen .landing-home-logo{max-width:120px;margin-top:4px}.home-screen>.grid.gap-4>div>a{height:126px!important;min-height:126px!important;border-radius:18px!important}.home-screen>.grid.gap-4>div>a>img{right:0!important;left:auto!important;width:42%!important;height:100%!important;object-fit:cover!important}.home-screen>.grid.gap-4>div>a>div{top:0!important;right:42%!important;bottom:0!important;left:0!important;display:flex!important;align-items:center!important;padding:8px 10px!important;border-top:0!important;border-right:1px solid rgba(255,255,255,.7)!important}.home-screen>.grid.gap-4>div>a>div>div{width:100%!important;align-items:center!important;gap:5px!important}.home-screen>.grid.gap-4>div>a h2{font-size:17px!important;line-height:1.1!important}.home-screen>.grid.gap-4>div>a h2+p{margin-top:2px!important;font-size:13.5px!important;line-height:1.15!important}.home-screen>.grid.gap-4>div>a h2+p+p{margin-top:3px!important;font-size:10.5px!important;line-height:1.25!important}.home-screen>.grid.gap-4>div>a span{width:27px!important;height:27px!important;margin:0!important}.home-screen>.mt-5.grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important}.home-screen>.mt-5.grid>a{height:118px!important;min-height:118px!important;border-radius:16px!important}.home-screen>.mt-5.grid>a>div{padding:5px 6px!important}.home-screen>.mt-5.grid>a h2{font-size:11.5px!important;line-height:1.15!important}.home-screen>.mt-5.grid>a img{object-position:center!important}}";

export default function Landing() {
  const { language, t } = useTranslator();
  const [seasonalTopic, setSeasonalTopic] = useState("sukkot");
  const seasonalActivities = SEASONAL_TOPICS[seasonalTopic] || SEASONAL_TOPICS.sukkot;
  const pinkCaption = "!border-rose/45 !bg-secondary/95";
  const quickLinks = [
    ["/parent/social-stories", "/icon-bank/navigation-v2/social-stories-flat.webp", "מחולל סיפורים חברתיים", "Social Story Builder"],
    [language === "en" ? "/en/parent/routine-boards/" : "/parent/routine-boards/", "/icon-bank/navigation-v2/daily-routine-checklist.webp", "לוחות התארגנות לילדים", "Routine Boards for Children"],
    ["/parent/hebrew-calendar", "/icon-bank/navigation-v2/family-calendar-illustrated-v2.webp", "יצירת לוח שנה", "Create a Family Calendar"],
    ["/parent/recipes", "/icon-bank/navigation-v2/recipes-flat.webp", "מתכונים", "Kid-Friendly Recipes"],
    ["/parent/experiments", "/icon-bank/navigation-v2/experiments-flat.webp", "ניסויים", "Kids’ Science Experiments"],
    ...(language === "he"
      ? [
          ["/parent/card-games-generator/", "/assets/card-generator-home-v2.png", "מחולל משחקים", "Printable Game Builder"],
          ["/parent/daily-sequences/", "/icon-bank/daily-sequences/hands/rub.webp", "רצפי ADL", "ADL Visual Sequences"],
        ]
      : [["/en/parent/daily-sequences/", "/icon-bank/daily-sequences/hands/rub.webp", "רצפי ADL", "ADL Visual Sequences"]]),
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

        {language === "he" && (
          <p className="mt-5 text-center text-xs text-muted-foreground">
            אפשר לחזור למסך הזה בכל שלב, ולעבור בין הכלים דרך התפריט העליון.
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickLinks.map(([to, image, he, en]) => <IllustratedNavCard key={to} to={to} image={image} title={t(he, en)} captionClassName={pinkCaption} />)}
        </div>

        {language === "he" && (
          <section className="compact-seasonal-section mt-8 rounded-[2rem] border border-rose/55 bg-secondary/80 p-4 shadow-soft md:p-6" aria-labelledby="seasonal-title">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-rose">{t("פעילויות לפי התקופה", "Seasonal activities")}</p>
                <label className="block">
                  <span className="sr-only">בחירת נושא הפעילויות</span>
                  <select
                    id="seasonal-title"
                    value={seasonalTopic}
                    onChange={(e) => setSeasonalTopic(e.target.value)}
                    className="cursor-pointer rounded-xl border border-rose/40 bg-white px-3 py-1.5 text-2xl font-black text-foreground shadow-sm outline-none transition hover:border-rose focus:ring-2 focus:ring-rose/30"
                  >
                    <option value="sukkot">פעילויות לסוכות 🌿</option>
                    <option value="rosh-hashanah">פעילויות לראש השנה 🍎</option>
                  </select>
                </label>
              </div>
              <span className="rounded-full bg-sky/70 px-3 py-1 text-xs font-bold text-foreground/70">{t("מתחלף לאורך השנה", "Updated throughout the year")}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {seasonalActivities.map((activity) => (
                <Link key={activity.to} to={activity.to} className="overflow-hidden rounded-[1.5rem] border border-sky bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
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
          </section>
        )}
      </div>
    </AppShell>
  );
}
