// Dates and times as each audience writes them: Hebrew uses day.month and a 24-hour clock,
// American English uses month/day and a 12-hour clock with AM/PM.

export function formatDayMonth(day, month, language) {
  return language === "en" ? `${month}/${day}` : `${day}.${month}`;
}

export function formatDateDayMonth(date, language) {
  return formatDayMonth(date.getDate(), date.getMonth() + 1, language);
}

// "14:30" or "14:30:00" -> "2:30 PM" in English, "14:30" in Hebrew.
export function formatTime(value, language) {
  if (!value) return "";
  const [h, m = "00"] = String(value).split(":");
  const hour = Number(h);
  if (Number.isNaN(hour)) return value;
  if (language !== "en") return `${String(hour).padStart(2, "0")}:${m}`;
  return `${hour % 12 || 12}:${m} ${hour < 12 ? "AM" : "PM"}`;
}
