export function getActivityDurationLabel(activity, language = "he") {
  const minutes = language === "en" ? "minutes" : "דקות";
  const hasRangeTag = activity.tags?.some((tag) => /15\s*[–-]\s*30/.test(tag));
  if (hasRangeTag) return `15–30 ${minutes}`;
  return typeof activity.duration_min === "number" ? `${activity.duration_min} ${minutes}` : "";
}

export function getActivityDurationShortLabel(activity, language = "he") {
  const label = getActivityDurationLabel(activity, language);
  return language === "en" ? label.replace(" minutes", " min") : label.replace(" דקות", " ד'");
}
