import { useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { Home, Printer } from "lucide-react";
import { HebrewCalendarPages } from "@/components/HebrewCalendarPages";
import { Button } from "@/components/ui/button";
import { buildGregorianCalendarYear, decodeCalendarPayload } from "@/lib/hebrew-calendar";
import { useTranslator } from "@/lib/language";

// Days the child marked as "passed" are saved on this device, per shared link.
// The key format matches the one the live site already used, so existing marks are kept.
function passedKey(search) {
  return `boo_shared_calendar_passed_${search}`;
}
function readPassed(search) {
  try { return new Set(JSON.parse(window.localStorage.getItem(passedKey(search)) || "[]")); }
  catch { return new Set(); }
}
function writePassed(search, values) {
  try { window.localStorage.setItem(passedKey(search), JSON.stringify([...values])); }
  catch { /* storage may be blocked */ }
}

export default function SharedHebrewCalendar() {
  const [params] = useSearchParams();
  const { search } = useLocation();
  const { language, t } = useTranslator();
  const english = language === "en";
  const data = useMemo(() => decodeCalendarPayload(params.get("data") || ""), [params]);
  const [passed, setPassed] = useState(() => readPassed(search));

  if (!data) {
    return (
      <main className="grid min-h-screen place-items-center p-6 text-center" dir={english ? "ltr" : "rtl"}>
        <div>
          <h1 className="text-2xl font-black">{t("הקישור ללוח אינו תקין", "This calendar link isn't valid")}</h1>
          <Button className="mt-4" onClick={() => window.location.assign(english ? "/en/" : "/")}>{t("חזרה לבואו נשחק", "Back to Let's Play")}</Button>
        </div>
      </main>
    );
  }

  const months = buildGregorianCalendarYear(data.year);
  const keyFor = (day, monthIndex) => `${monthIndex}-${day.gregorianDay - 1}`;
  const togglePassed = (day, monthIndex) => {
    const key = keyFor(day, monthIndex);
    const next = new Set(passed);
    if (next.has(key)) next.delete(key); else next.add(key);
    writePassed(search, next);
    setPassed(next);
  };
  const dayState = (day, monthIndex) => {
    const isPassed = passed.has(keyFor(day, monthIndex));
    return { className: isPassed && "calendar-day-passed", pressed: isPassed, title: t("לחצו כדי לסמן שהיום עבר", "Tap to mark this day as done") };
  };

  return (
    <main className="shared-hebrew-calendar bg-sky/15 p-4 md:p-8" dir={english ? "ltr" : "rtl"}>
      <div className="mx-auto mb-5 flex max-w-5xl justify-between print:hidden">
        <Link to="/"><Button variant="outline"><Home className="h-4 w-4" /> {t("בואו נשחק", "Let's Play")}</Button></Link>
        <Button onClick={() => window.print()}><Printer className="h-4 w-4" /> {t("הדפסה", "Print")}</Button>
      </div>
      <div className="mx-auto max-w-5xl">
        <HebrewCalendarPages
          months={months}
          year={data.year}
          settings={data.settings}
          title={data.title}
          customEvents={data.customEvents || []}
          language={language}
          showAll
          interactive
          onDayClick={togglePassed}
          dayState={dayState}
        />
      </div>
    </main>
  );
}
