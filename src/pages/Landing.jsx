import { IllustratedNavCard } from "@/components/IllustratedNavCard";
import { Link } from "react-router-dom";
import { Info, Languages } from "lucide-react";
import { brandLogo, useTranslator } from "@/lib/language";

const seasonalActivities = [
  { titleHe: "יצירת לוח שנה", titleEn: "Create a family calendar", image: "/icon-bank/navigation-v2/family-calendar-illustrated-v2.webp", altHe: "יצירת לוח שנה משפחתי להדפסה", altEn: "Create a printable family calendar", imageFit: "contain", to: "/parent/hebrew-calendar", badgeHe: "להכנת לוח שנה", badgeEn: "Create calendar" },
  { titleHe: "משושי הדבש", titleEn: "Honeycomb Shapes", image: "/icon-bank/manual/experiments/honey-hexagons-hero.webp", altHe: "ניסוי משושי הדבש לראש השנה", altEn: "Honeycomb shapes experiment for Rosh Hashanah", to: "/parent/experiments?e=honey-hexagons", badgeHe: "לניסוי", badgeEn: "View experiment" },
  { titleHe: "גרעיני הרימון", titleEn: "Pomegranate Seeds Craft", image: "/icon-bank/crafts-new/seed-110-pomegranate/hero.webp", altHe: "יצירת גרעיני רימון מנייר קרפ", altEn: "Pomegranate seeds craft using crepe paper", to: "/activity/seed-112?mode=parent&returnPath=%2F", badgeHe: "ליצירה", badgeEn: "View craft" },
  { titleHe: "פלחי תפוחים מצופים בשוקולד", titleEn: "Chocolate-Dipped Apple Slices", image: "/icon-bank/manual/chocolate-apple-slices/cover.webp", altHe: "מתכון פלחי תפוחים מצופים בשוקולד", altEn: "Chocolate-dipped apple slices recipe", to: "/parent/recipes?r=chocolate-apple-slices", badgeHe: "למתכון", badgeEn: "View recipe" },
];

export default function Landing() {
  const { language, changeLanguage, t } = useTranslator();
  const pinkCaption = "!border-rose/45 !bg-secondary/95";
  const quickLinks = [
    ["/parent/social-stories", "/icon-bank/navigation-v2/social-stories-flat.webp", "מחולל סיפורים חברתיים", "Social Story Builder"],
    ["/parent/weekly-board", "/icon-bank/navigation-v2/weekly-board-flat.webp", "לוח התארגנות שבועי", "Weekly Visual Planner"],
    ["/parent/morning-routine", "/icon-bank/navigation-v2/morning-routine-flat.webp", "לוח התארגנות בוקר", "Morning Routine Board"],
    ["/parent/evening-routine", "/icon-bank/navigation-v2/morning-routine-flat.webp", "לוח התארגנות ערב", "Evening Routine Board"],
    ["/parent/daily-sequences", "/icon-bank/daily-sequences/hands/rub.webp", "רצפים של פעולות יום־יומיות", "Daily Living Sequences"],
    ["/parent/hebrew-calendar", "/icon-bank/navigation-v2/family-calendar-illustrated-v2.webp", "יצירת לוח שנה", "Create a Family Calendar"],
    ["/parent/cipher", "/icon-bank/navigation-v2/cipher-flat.webp", "מחולל כתב סתרים", "Secret Code Generator"],
    ["/parent/recipes", "/icon-bank/navigation-v2/recipes-flat.webp", "מתכונים", "Recipes"],
    ["/parent/experiments", "/icon-bank/navigation-v2/experiments-flat.webp", "ניסויים", "Experiments"],
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-6 md:py-8">
        <div className={`mb-2 flex ${language === "en" ? "justify-end" : "justify-start"}`}>
          <button
            type="button"
            onClick={() => changeLanguage(language === "he" ? "en" : "he")}
            className="inline-flex items-center gap-2 rounded-full border border-rose/45 bg-white/90 px-4 py-2 text-sm font-bold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={language === "he" ? "מעבר לאנגלית" : "Switch to Hebrew"}
          >
            <Languages className="h-4 w-4 text-rose" />
            {language === "he" ? "English" : "עברית"}
          </button>
        </div>
        <div className="mb-5 animate-in fade-in slide-in-from-bottom-2 text-center duration-300">
          <img src={brandLogo(language)} alt={t("בואו נשחק", "Let's Play")} title={t("בואו נשחק", "Let's Play")} className="landing-home-logo mx-auto h-auto w-full max-w-[140px] md:max-w-[175px]" />
          <p className="mt-2 text-muted-foreground md:text-lg">{t("שפע רעיונות טיפוליים במקום אחד — לגן, לבית, ולקליניקה.", "A growing collection of playful ideas for home, preschool, and therapy.")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300"><IllustratedNavCard eager to="/therapist/build" image="/icon-bank/navigation-v2/therapy-build-flat.webp" title={t("בנה לוח למפגש טיפולי", "Build a Therapy Session Board")} description={t("כלי עזר לאנשי מקצוע — בחרו גיל, מטרות וזמן ותכננו מפגש מותאם", "For professionals — choose the child's age, goals, and available time to plan a suitable session.")} large showArrow captionClassName={pinkCaption} className="h-full !min-h-[220px] md:!min-h-[250px]" /></div>
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300"><IllustratedNavCard eager to="/parent/play" image="/icon-bank/navigation-v2/play-today-flat.webp" title={t("במה נשחק היום?", "What Shall We Play Today?")} description={t("מנוע חיפוש להורים — בחרו גיל, קושי וזמן ונמצא רעיון מתאים", "For parents — choose your child's age, needs, and available time to find a suitable activity.")} large showArrow captionClassName={pinkCaption} className="h-full !min-h-[220px] md:!min-h-[250px]" /></div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">{t("אפשר לחזור למסך הזה בכל שלב, ולעבור בין הכלים דרך התפריט העליון.", "You can return to this page at any time and move between tools using the top menu.")}</p>
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">{t("בואו נשחק מציע רעיונות לפעילות וכלי עזר לתכנון. התכנים אינם מהווים אבחון, המלצה טיפולית אישית או תחליף להערכה ולטיפול של איש מקצוע מוסמך.", "Let's Play offers activity ideas and planning tools. The content is not a diagnosis, personalised clinical advice, or a substitute for assessment and treatment by a qualified professional.")}</p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickLinks.map(([to, image, he, en]) => <IllustratedNavCard key={to} to={to} image={image} title={t(he, en)} captionClassName={pinkCaption} />)}
        </div>

        {language === "he" && <section className="mt-8 rounded-[2rem] border border-rose/55 bg-secondary/80 p-4 shadow-soft md:p-6" aria-labelledby="seasonal-title">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div><p className="text-sm font-bold text-rose">{t("פעילויות לפי התקופה", "Seasonal activities")}</p><h2 id="seasonal-title" className="text-2xl font-black text-foreground">{t("פעילויות לראש השנה 🍎", "Rosh Hashanah Activities 🍎")}</h2></div>
            <span className="rounded-full bg-sky/70 px-3 py-1 text-xs font-bold text-foreground/70">{t("מתחלף לאורך השנה", "Updated throughout the year")}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {seasonalActivities.map((activity) => {
              const title = language === "en" ? activity.titleEn : activity.titleHe;
              return <Link key={activity.to} to={activity.to} className="overflow-hidden rounded-[1.5rem] border border-sky bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"><div className="aspect-[4/3] overflow-hidden bg-white"><img src={activity.image} loading="lazy" decoding="async" alt={language === "en" ? activity.altEn : activity.altHe} className={`h-full w-full ${activity.imageFit === "contain" ? "object-contain p-2" : "object-cover"}`} /></div><div className="flex items-center justify-between gap-2 border-t border-rose/35 bg-rose/20 px-4 py-3"><h3 className="font-extrabold text-foreground">{title}</h3><span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-rose shadow-sm">{language === "en" ? activity.badgeEn : activity.badgeHe}</span></div></Link>;
            })}
          </div>
        </section>}

        <footer className="mt-10 flex justify-center border-t border-border/60 pt-6"><Link to="/about" className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-muted-foreground transition hover:bg-card hover:text-foreground"><Info className="h-4 w-4" />{t("אודות", "About")}</Link></footer>
      </div>
    </div>
  );
}
