export function getActivityDurationLabel(activity) {
  const hasRangeTag = activity.tags?.some((tag) => /15\s*[–-]\s*30/.test(tag));
  if (hasRangeTag) return "15–30 דקות";
  return typeof activity.duration_min === "number" ? `${activity.duration_min} דקות` : "";
}

export function getActivityDurationShortLabel(activity) {
  return getActivityDurationLabel(activity).replace(" דקות", " ד'");
}
