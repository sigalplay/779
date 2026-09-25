// תווית גיל לפעילות. לפעילויות לתינוקות (0.5–1) מציגים "6 חודשים–שנה".
export function ageRangeLabel(activity, language) {
  if (activity?.age_min === 0.5 && activity?.age_max === 1) {
    return language === "en" ? "Ages 6–12 months" : "גיל 6 חודשים–שנה";
  }
  return `${language === "en" ? "Ages" : "גיל"} ${activity?.age_min}–${activity?.age_max}`;
}
