import { MessageCircle, Stethoscope } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useEffect } from "react";
import { useTranslator } from "@/lib/language";

const phone = "972544419496";
const consultationMessage = encodeURIComponent(
  "היי סיגל, הגעתי דרך „בואו נשחק” ואשמח לקבל פרטים על ייעוץ מקצועי בתשלום.",
);
const feedbackMessage = encodeURIComponent(
  "היי סיגל, רציתי לפנות אלייך בנושא האפליקציה „בואו נשחק”.",
);

export default function About() {
  const { language, t } = useTranslator();
  const consultationMessage = encodeURIComponent(t("היי סיגל, הגעתי דרך „בואו נשחק” ואשמח לקבל פרטים על ייעוץ מקצועי בתשלום.", "Hi Sigal, I found you through Let's Play and would like information about a paid professional consultation."));
  const feedbackMessage = encodeURIComponent(t("היי סיגל, רציתי לפנות אלייך בנושא האפליקציה „בואו נשחק”.", "Hi Sigal, I would like to contact you about the Let's Play website."));
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return (
    <AppShell mode="parent">
      <article className="mx-auto max-w-3xl space-y-8 pb-8">
        <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm md:p-9">
          <p className="mb-2 text-sm font-bold text-primary">{t("נעים להכיר", "Nice to meet you")}</p>
          <h1 className="font-display text-3xl font-black md:text-4xl">{t("אודות", "About")}</h1>

          <div className="mt-6 space-y-4 leading-8 text-foreground/90">
            {language === "he" ? <><p>
              אני סיגל ששון־ספקטור, אמא של ניב ואיתמר ומרפאה בעיסוק התפתחותית. אני בעלת תואר
              ראשון בריפוי בעיסוק מאוניברסיטת חיפה ותואר שני בתוכנית שוורץ לגיל הרך באוניברסיטה
              העברית בירושלים.
            </p>
            <p>
              בעבודתי אני פוגשת הורים שרוצים לשחק עם ילדיהם, לקדם אותם וליצור זמן משותף ומשמעותי,
              אבל לא תמיד יודעים מאיפה להתחיל. לפעמים חסר רעיון מתאים, ולפעמים פשוט אין זמן לחפש
              פעילות, להבין מה צריך ולהכין הכול מראש.
            </p>
            <p>
              בעבודתי כמרפאה בעיסוק אני מקדישה זמן רב לתכנון כל טיפול, לחיפוש רעיונות, להכנת חומרים
              ולהתאמת הפעילויות למטרות ולצרכים הייחודיים של כל ילד. לא פעם ההכנות ממשיכות גם לאחר
              ששעות העבודה מסתיימות.
            </p>
            <p>
              לכן החלטתי לרכז את החומרים והרעיונות שאני מכינה עבור הטיפולים שלי במקום אחד —
              <strong> „בואו נשחק”</strong>. זהו אתר שנועד להקל על הורים ועל מטפלות ולהציע רעיונות
              איכותיים, ברורים ונגישים שאפשר ליישם בקלות.
            </p></> : <>
              <p>I’m Sigal Sasson-Spector, mum to Niv and Itamar and a developmental occupational therapist. I hold a bachelor’s degree in occupational therapy from the University of Haifa and a master’s degree from the Schwartz Programme in Early Childhood Studies at the Hebrew University of Jerusalem.</p>
              <p>In my work, I meet parents who want to play with their children, support their development, and enjoy meaningful time together—but do not always know where to begin. Sometimes it is hard to find the right idea, and sometimes there simply is not enough time to search, gather supplies, and prepare.</p>
              <p>As an occupational therapist, I spend a great deal of time planning each session, finding ideas, preparing materials, and adapting activities to each child’s individual goals and needs. The preparation often continues after the working day is over.</p>
              <p>That is why I brought the materials and ideas I create for my sessions together in one place: <strong>Let’s Play</strong>. The website is designed to support parents and therapists with high-quality, clear, and accessible ideas that are easy to use.</p>
            </>}
          </div>
        </section>

        <section className="rounded-3xl border border-sky/50 bg-sky/15 p-6 md:p-9">
          <h2 className="font-display text-2xl font-black md:text-3xl">{t("מה תמצאו באתר?", "What will you find here?")}</h2>
          <div className="mt-5 space-y-4 leading-8 text-foreground/90">
            {language === "he" ? <><p>
              באתר תוכלו למצוא פעילויות יצירה, תנועה, משחק חברתי ומשחקים סנסוריים, לצד מתכונים,
              ניסויים ופעילויות שאפשר לבצע גם ללא הכנה מוקדמת.
            </p>
            <p>
              כל פעילות כוללת הסבר ברור, רשימת ציוד ושלבים מאוירים. ניתן לחפש פעילויות בהתאם לצורך
              של הילד או למטרה הטיפולית, ולמצוא רעיונות לפיתוח מוטוריקה עדינה וגסה, שפה, תכנון,
              ארגון, זיכרון עבודה, גמישות מחשבתית, ויסות חושי ומיומנויות נוספות.
            </p>
            <p>
              באתר תמצאו גם כלים שימושיים להתארגנות הבוקר ולתכנון השבוע, ואני ממשיכה לפתח ולהוסיף
              באופן שוטף פעילויות, תכנים וכלים חדשים.
            </p>
            <p>
              אני מקווה שהאתר יעזור לכם לחסוך זמן של חיפוש והכנה, ויאפשר לכם ליצור עם הילדים רגעים
              מהנים ומשמעותיים של משחק, למידה והצלחה.
            </p></> : <>
              <p>You will find creative, movement, social, and sensory activities, along with recipes, experiments, and ideas that need little or no advance preparation.</p>
              <p>Each activity includes clear guidance, a supply list, and illustrated steps. You can search by your child’s needs or by a therapy goal, and find ideas that support fine and gross motor skills, language, planning, organisation, working memory, flexible thinking, sensory regulation, and more.</p>
              <p>The website also includes practical tools for morning routines and weekly planning. I continue to develop and add new activities, resources, and tools.</p>
              <p>I hope the website saves you preparation time and helps you create enjoyable, meaningful moments of play, learning, and success with children.</p>
            </>}
          </div>
        </section>

        <section className="rounded-3xl border border-sage/50 bg-sage/15 p-6 md:p-9">
          <h2 className="font-display text-2xl font-black md:text-3xl">{t("יצירת קשר וייעוץ מקצועי", "Contact and professional consultation")}</h2>
          <div className="mt-5 space-y-4 leading-8 text-foreground/90">
            {language === "he" ? <><p>
              רוצים להתייעץ בנוגע להתפתחות, לתפקוד או להשתתפות של ילדכם בחיי היום־יום? ניתן לפנות
              אליי לתיאום ייעוץ מקצועי בתשלום בריפוי בעיסוק, הכולל חשיבה משותפת, הדרכת הורים והתאמת
              המלצות ופעילויות לצרכים הייחודיים של הילד.
            </p>
            <p>
              אשמח לשמוע מכם גם אם יש לכם שאלה בנוגע לאפליקציה, רעיון לפעילות חדשה או הצעה לשיפור.
            </p></> : <>
              <p>Would you like advice about your child’s development, daily functioning, or participation? You are welcome to contact me to arrange a paid occupational therapy consultation. This may include thinking together, parent guidance, and recommendations and activities tailored to your child’s needs.</p>
              <p>I would also be glad to hear from you if you have a question about the website, an idea for a new activity, or a suggestion for improvement.</p>
            </>}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <a
              href={`https://wa.me/${phone}?text=${consultationMessage}`}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-center font-bold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <Stethoscope className="h-5 w-5 shrink-0" />
              {t("לתיאום ייעוץ מקצועי בתשלום", "Arrange a paid consultation")}
            </a>
            <a
              href={`https://wa.me/${phone}?text=${feedbackMessage}`}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-primary/30 bg-card px-5 py-3 text-center font-bold transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
            >
              <MessageCircle className="h-5 w-5 shrink-0" />
              {t("לשאלה או למשוב על האפליקציה", "Ask a question or share feedback")}
            </a>
          </div>
        </section>
      </article>
    </AppShell>
  );
}
