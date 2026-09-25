import { AlertTriangle } from "lucide-react";
import { useTranslator } from "@/lib/language";

export function TherapistDemoNotice({ compact = false }) {
  const { t } = useTranslator();
  return (
    <aside className={`rounded-3xl border-2 border-amber-300 bg-amber-50 text-amber-950 ${compact ? "p-4" : "p-5"}`} role="note" aria-label={t("הודעת פרטיות חשובה", "Important privacy notice")}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
        <div>
          <h2 className="font-display text-base font-black">{t("המידע נשמר במכשיר זה בלבד", "Information is stored on this device only")}</h2>
          <p className="mt-1 text-sm font-semibold leading-6">
            {t(
              "היומן ותיקי המטופלים נשמרים מקומית בדפדפן ואינם מסונכרנים לענן. יש להזין שם פרטי בלבד — ללא שם משפחה, תעודת זהות, כתובת, מספר טלפון, שם מסגרת מזהה או פרט מזהה נוסף. ניקוי נתוני הדפדפן עלול למחוק את המידע.",
              "The diary and client files are stored locally in this browser and are not synced to the cloud. Enter a first name only—no surname, ID number, address, phone number, identifiable setting name, or other identifying details. Clearing browser data may delete the information."
            )}
          </p>
        </div>
      </div>
    </aside>
  );
}
