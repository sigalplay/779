const DAY_MS = 86400000;

const HEBREW_MONTHS = {
  Tishri: "תשרי", Tishrei: "תשרי", Heshvan: "חשוון", Cheshvan: "חשוון",
  Kislev: "כסלו", Tevet: "טבת", Shevat: "שבט", "Adar I": "אדר א׳",
  Adar: "אדר", "Adar II": "אדר ב׳", Nisan: "ניסן", Iyar: "אייר",
  Sivan: "סיוון", Tamuz: "תמוז", Tammuz: "תמוז", Av: "אב", Elul: "אלול",
};

const hebrewFormatter = new Intl.DateTimeFormat("en-u-ca-hebrew", {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
});
function hebrewDayLetters(day) {
  const ones = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
  const special = { 10: "י", 15: "טו", 16: "טז", 20: "כ", 30: "ל" };
  let letters = special[day] || (day > 20 ? `כ${ones[day - 20]}` : day > 10 ? `י${ones[day - 10]}` : ones[day]);
  return letters.length === 1 ? `${letters}׳` : `${letters.slice(0, -1)}״${letters.slice(-1)}`;
}
const islamicFormatter = new Intl.DateTimeFormat("en-u-ca-islamic", {
  day: "numeric", month: "numeric", year: "numeric", timeZone: "UTC",
});

function parts(formatter, date) {
  return Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
}

export function currentHebrewYear() {
  const now = parts(hebrewFormatter, new Date());
  const year = Number(now.year);
  return ["Av", "Elul"].includes(now.month) ? year + 1 : year;
}

export function buildHebrewYear(year) {
  const guess = year - 3761;
  const start = Date.UTC(guess, 7, 1, 12);
  const end = Date.UTC(guess + 1, 10, 1, 12);
  const months = [];
  let current;

  for (let time = start; time <= end; time += DAY_MS) {
    const date = new Date(time);
    const hp = parts(hebrewFormatter, date);
    if (Number(hp.year) !== Number(year)) continue;
    if (!current || current.key !== hp.month) {
      current = { key: hp.month, name: HEBREW_MONTHS[hp.month] || hp.month, days: [] };
      months.push(current);
    }
    current.days.push({
      date: date.toISOString().slice(0, 10),
      hebrewDay: Number(hp.day),
      weekday: date.getUTCDay(),
      gregorianDay: date.getUTCDate(),
      gregorianMonth: date.getUTCMonth() + 1,
      gregorianYear: date.getUTCFullYear(),
      monthKey: hp.month,
    });
  }
  return months;
}

const GREGORIAN_MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

export function currentCalendarStartYear() {
  const now = new Date();
  return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}

export function buildGregorianCalendarYear(startYear) {
  return Array.from({ length: 12 }, (_, index) => {
    const monthIndex = (8 + index) % 12;
    const gregorianYear = startYear + (index >= 4 ? 1 : 0);
    const daysInMonth = new Date(Date.UTC(gregorianYear, monthIndex + 1, 0)).getUTCDate();
    const days = Array.from({ length: daysInMonth }, (_, offset) => {
      const date = new Date(Date.UTC(gregorianYear, monthIndex, offset + 1, 12));
      const hp = parts(hebrewFormatter, date);
      return {
        date: date.toISOString().slice(0, 10),
        hebrewDay: Number(hp.day),
        hebrewLabel: `${hebrewDayLetters(Number(hp.day))} ב${HEBREW_MONTHS[hp.month] || hp.month}`,
        weekday: date.getUTCDay(),
        gregorianDay: offset + 1,
        gregorianMonth: monthIndex + 1,
        gregorianYear,
        monthKey: hp.month,
      };
    });
    return { key: `${gregorianYear}-${String(monthIndex + 1).padStart(2, "0")}`, name: GREGORIAN_MONTHS[monthIndex], gregorianYear, days };
  });
}

export function hebrewRange(month) {
  if (!month?.days?.length) return "";
  return `${month.days[0].hebrewLabel} – ${month.days.at(-1).hebrewLabel}`;
}

const jewishByMonth = {
  Elul: { 29: "ערב ראש השנה" },
  Tishri: { 1: "ראש השנה", 2: "ראש השנה ב׳", 3: "צום גדליה", 9: "ערב יום כיפור", 10: "יום כיפור", 14: "ערב סוכות", 15: "סוכות", 16: "חול המועד סוכות", 17: "חול המועד סוכות", 18: "חול המועד סוכות", 19: "חול המועד סוכות", 20: "חול המועד סוכות", 21: "הושענא רבה", 22: "שמחת תורה" },
  Tishrei: { 1: "ראש השנה", 2: "ראש השנה ב׳", 3: "צום גדליה", 9: "ערב יום כיפור", 10: "יום כיפור", 14: "ערב סוכות", 15: "סוכות", 16: "חול המועד סוכות", 17: "חול המועד סוכות", 18: "חול המועד סוכות", 19: "חול המועד סוכות", 20: "חול המועד סוכות", 21: "הושענא רבה", 22: "שמחת תורה" },
  Kislev: { 24: "ערב חנוכה", 25: "חנוכה", 26: "חנוכה", 27: "חנוכה", 28: "חנוכה", 29: "חנוכה", 30: "חנוכה" },
  Tevet: { 1: "חנוכה", 2: "חנוכה", 3: "חנוכה", 10: "עשרה בטבת" },
  Shevat: { 15: "ט״ו בשבט" },
  Adar: { 14: "פורים", 15: "שושן פורים" },
  "Adar II": { 14: "פורים", 15: "שושן פורים" },
  Nisan: { 14: "ערב פסח", 15: "פסח", 16: "חול המועד פסח", 17: "חול המועד פסח", 18: "חול המועד פסח", 19: "חול המועד פסח", 20: "חול המועד פסח", 21: "שביעי של פסח" },
  Iyar: { 5: "יום העצמאות*", 18: "ל״ג בעומר", 28: "יום ירושלים" },
  Sivan: { 5: "ערב שבועות", 6: "שבועות" },
  Tamuz: { 17: "י״ז בתמוז" }, Tammuz: { 17: "י״ז בתמוז" },
  Av: { 9: "תשעה באב", 15: "ט״ו באב" },
};

const educationRanges = {
  // חופשת ראש השנה מתחילה כבר בערב החג, כ״ט באלול.
  Elul: [[29, 29]],
  Tishri: [[1, 2], [9, 22]], Tishrei: [[1, 2], [9, 22]],
  Kislev: [[25, 30]], Tevet: [[1, 3]], Adar: [[14, 15]], "Adar II": [[14, 15]],
  Nisan: [[6, 22]], Sivan: [[5, 6]],
};

// תאריכי החופשות הרשמיים לשנת הלימודים תשפ״ז (ספטמבר 2026–אוגוסט 2027).
// אלה טווחים גרגוריאניים מדויקים, כדי שערבי חג וימי חופשה לא יישמטו.
const EDUCATION_2026_2027 = [
  ["2026-09-11", "2026-09-13", "חופשת ראש השנה"],
  ["2026-09-20", "2026-09-21", "חופשת יום כיפור"],
  ["2026-09-22", "2026-09-24", "גשר בין יום כיפור לסוכות"],
  ["2026-09-25", "2026-10-03", "חופשת סוכות"],
  ["2026-12-06", "2026-12-12", "חופשת חנוכה"],
  ["2027-03-23", "2027-03-24", "חופשת פורים"],
  ["2027-04-13", "2027-04-28", "חופשת פסח"],
  ["2027-05-12", "2027-05-12", "חופשת יום העצמאות"],
  ["2027-06-10", "2027-06-11", "חופשת שבועות"],
];

// המועדים המוסלמיים בשנת הלימודים תשפ״ז. התאריכים עשויים להשתנות ביום
// בהתאם לקביעת ראש החודש וראיית הירח, ולכן הם מוצגים עם כוכבית.
const MUSLIM_2026_2027 = {
  "2027-01-06": "אל־אסראא׳ ואל־מעראג׳*",
  "2027-01-23": "לילת אל־בראאה*",
  "2027-02-08": "תחילת רמדאן*",
  "2027-03-06": "לילת אל־קדר*",
  "2027-03-10": "עיד אל־פיטר*",
  "2027-03-11": "עיד אל־פיטר*",
  "2027-03-12": "עיד אל־פיטר*",
  "2027-05-16": "יום ערפאת / ערב עיד אל־אדחא*",
  "2027-05-17": "עיד אל־אדחא*",
  "2027-05-18": "עיד אל־אדחא*",
  "2027-05-19": "עיד אל־אדחא*",
  "2027-05-20": "עיד אל־אדחא*",
  "2027-06-06": "ראש השנה ההיג׳רית*",
  "2027-06-15": "עשוראא׳*",
  "2027-08-15": "מולד הנביא*",
};

// מועדים נוצריים מרכזיים, תוך הבחנה בין הלוח המערבי ללוח האורתודוקסי.
const CHRISTIAN_2026_2027 = {
  "2026-12-25": "חג המולד – מערבי",
  "2027-01-01": "ראש השנה – מערבי",
  "2027-01-06": "חג ההתגלות – מערבי",
  "2027-01-07": "חג המולד – אורתודוקסי",
  "2027-01-14": "ראש השנה – אורתודוקסי",
  "2027-01-19": "חג ההתגלות – אורתודוקסי / חג המולד הארמני",
  "2027-03-21": "יום ראשון של הדקלים – מערבי",
  "2027-03-26": "יום שישי הטוב – מערבי",
  "2027-03-28": "פסחא – מערבי",
  "2027-04-25": "יום ראשון של הדקלים – אורתודוקסי",
  "2027-04-30": "יום שישי הטוב – אורתודוקסי",
  "2027-05-02": "פסחא – אורתודוקסי",
};

function exactEducationEvent(day) {
  if (day.date < "2026-09-01" || day.date > "2027-08-31") return null;
  const match = EDUCATION_2026_2027.find(([start, end]) => day.date >= start && day.date <= end);
  return match ? match[2] : "";
}

function westernEaster(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function dateShift(iso, amount) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + amount);
  return d.toISOString().slice(0, 10);
}

export function eventsForDay(day, settings, customEvents = []) {
  const events = [];
  if (settings.jewish) {
    const label = jewishByMonth[day.monthKey]?.[day.hebrewDay];
    if (label) events.push({ label, type: "jewish" });
  }
  if (settings.education) {
    const exactLabel = exactEducationEvent(day);
    const isCoveredSchoolYear = day.date >= "2026-09-01" && day.date <= "2027-08-31";
    const isGenericVacation = educationRanges[day.monthKey]?.some(([a, b]) => day.hebrewDay >= a && day.hebrewDay <= b);
    if (exactLabel) events.push({ label: exactLabel, type: "education" });
    else if (!isCoveredSchoolYear && isGenericVacation) events.push({ label: "חופשת מערכת החינוך*", type: "education" });
  }
  if (settings.muslim) {
    const exactLabel = MUSLIM_2026_2027[day.date];
    const isCoveredSchoolYear = day.date >= "2026-09-01" && day.date <= "2027-08-31";
    if (exactLabel) events.push({ label: exactLabel, type: "muslim" });
    else if (!isCoveredSchoolYear) {
      const ip = parts(islamicFormatter, new Date(`${day.date}T12:00:00Z`));
      const md = `${Number(ip.month)}-${Number(ip.day)}`;
      const names = { "1-1": "ראש השנה ההיג׳רית*", "1-10": "עשוראא׳*", "3-12": "מולד הנביא*", "7-27": "אל־אסראא׳ ואל־מעראג׳*", "8-15": "לילת אל־בראאה*", "9-1": "תחילת רמדאן*", "9-27": "לילת אל־קדר*", "10-1": "עיד אל־פיטר*", "12-9": "יום ערפאת*", "12-10": "עיד אל־אדחא*" };
      if (names[md]) events.push({ label: names[md], type: "muslim" });
    }
  }
  if (settings.christian) {
    const exactLabel = CHRISTIAN_2026_2027[day.date];
    const isCoveredSchoolYear = day.date >= "2026-09-01" && day.date <= "2027-08-31";
    if (exactLabel) events.push({ label: exactLabel, type: "christian" });
    else if (!isCoveredSchoolYear) {
      const md = `${day.gregorianMonth}-${day.gregorianDay}`;
      const fixed = { "1-1": "ראש השנה – מערבי", "1-6": "חג ההתגלות – מערבי", "3-25": "חג הבשורה – מערבי", "12-25": "חג המולד – מערבי", "1-7": "חג המולד – אורתודוקסי", "1-14": "ראש השנה – אורתודוקסי", "1-19": "חג ההתגלות – אורתודוקסי" };
      if (fixed[md]) events.push({ label: fixed[md], type: "christian" });
      const easter = westernEaster(day.gregorianYear);
      if (day.date === easter) events.push({ label: "פסחא – מערבי", type: "christian" });
      if (day.date === dateShift(easter, -2)) events.push({ label: "יום שישי הטוב – מערבי", type: "christian" });
      if (day.date === dateShift(easter, -7)) events.push({ label: "יום ראשון של הדקלים – מערבי", type: "christian" });
    }
  }
  customEvents.filter((event) => event.date === day.date).forEach((event) => events.push({ label: event.label, type: "custom" }));
  return events;
}

export function gregorianRange(month) {
  if (!month?.days?.length) return "";
  const first = month.days[0], last = month.days.at(-1);
  const fmt = (d) => `${d.gregorianDay}.${d.gregorianMonth}.${d.gregorianYear}`;
  return `${fmt(first)}–${fmt(last)}`;
}

export function encodeCalendarPayload(payload) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
}

export function decodeCalendarPayload(value) {
  try { return JSON.parse(decodeURIComponent(escape(atob(value)))); } catch { return null; }
}
