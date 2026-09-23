import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ActivityCard } from "@/components/ActivityCard";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AGES, DURATIONS, THERAPIST_GOALS, ACTIVITY_GROUPS, expandGoals } from "@/lib/constants";
import { allActivities, isSearchActive } from "@/lib/storage";
import { useTranslator } from "@/lib/language";
import { activityTitle, translatedTerm } from "@/lib/content-translations";

export default function AllActivities({ mode = "therapist" }) {
  const { language, t } = useTranslator();
  const [searchParams, setSearchParams] = useSearchParams();
  const groupSlug = searchParams.get("group");
  const group = groupSlug ? Object.values(ACTIVITY_GROUPS).find((g) => g.slug === groupSlug) : null;

  const [q, setQ] = useState("");
  const [age, setAge] = useState(null);
  const category = searchParams.get("category");
  const setCategory = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("category", value);
    else next.delete("category");
    setSearchParams(next, { replace: true });
  };
  const [duration, setDuration] = useState(null);

  const all = useMemo(
    () => allActivities().filter((a) => isSearchActive(a) && (a.audience === mode || a.audience === "both")),
    [mode],
  );

  const categories = THERAPIST_GOALS;

  const clearGroup = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("group");
    setSearchParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    let rows = all;
    if (group) {
      const related = new Set(expandGoals(group.categories));
      rows = rows.filter((a) => [a.categories, a.goals, a.functions, a.tags].some((list) => list?.some((value) => related.has(value))));
    }
    if (age) rows = rows.filter((a) => a.age_min <= age && a.age_max >= age);
    if (category) {
      const related = new Set(expandGoals([category]));
      rows = rows.filter((a) => [a.categories, a.goals, a.functions, a.tags].some((list) => list?.some((value) => related.has(value))));
    }
    if (duration) {
      rows = rows.filter((a) => (duration.mode === "max" ? a.duration_min <= duration.value : a.duration_min >= duration.value));
    }
    if (q.trim()) {
      const term = q.trim().toLowerCase();
      rows = rows.filter(
        (a) =>
          a.title.toLowerCase().includes(term) || activityTitle(a, "en")?.toLowerCase().includes(term) ||
          a.short_description?.toLowerCase().includes(term) ||
          a.tags?.some((t) => t.toLowerCase().includes(term)),
      );
    }
    return rows;
  }, [all, group, age, category, duration, q]);
  const returnPath = `/${mode}/all${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const returnLabel = group ? t(`חזרה ל${group.label}`, `Back to ${translatedTerm(group.label, "en")}`) : category ? t(`חזרה לפעילויות ${category}`, `Back to ${translatedTerm(category, "en")} activities`) : t("חזרה לכל הפעילויות", "Back to all activities");

  return (
    <AppShell mode={mode}>
      <div className="mb-6">
        {group ? (
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-sage/20 px-4 py-1.5 text-sm font-semibold text-sage-foreground">
            <span aria-hidden>{group.emoji}</span>
            {translatedTerm(group.label, language)}
            <button onClick={clearGroup} className="mr-1 text-muted-foreground hover:text-foreground" aria-label={t("נקה סינון תחום", "Clear area filter")}>
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
        <h1 className="font-display text-3xl font-black">{group ? translatedTerm(group.label, language) : t("כל הפעילויות", "All activities")}</h1>
        <p className="mt-1 text-muted-foreground">
          {t(`${all.length} פעילויות בבנק · ${filtered.length} מוצגות`, `${all.length} activities in the library · ${filtered.length} shown`)}
        </p>
      </div>

      {!group && (
        <div className="mb-6 space-y-3 rounded-3xl border border-border/60 bg-card p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("חיפוש לפי שם, תיאור או תגית...", "Search by name, description, or tag...")} className={language === "en" ? "pl-9" : "pr-9"} />
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold text-muted-foreground">{t("גיל", "Age")}</div>
            <div className="flex flex-wrap gap-2">
              <Chip active={age === null} onClick={() => setAge(null)}>
                {t("הכל", "All")}
              </Chip>
              {AGES.map((a) => (
                <Chip key={a} active={age === a} onClick={() => setAge(age === a ? null : a)}>
                  {a}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-semibold text-muted-foreground">{t("כמה זמן יש", "Time available")}</div>
            <div className="flex flex-wrap gap-2">
              <Chip active={duration === null} onClick={() => setDuration(null)}>
                {t("הכל", "All")}
              </Chip>
              {DURATIONS.map((d) => (
                <Chip key={d.mode} active={duration?.mode === d.mode} onClick={() => setDuration(duration?.mode === d.mode ? null : d)}>
                  {translatedTerm(d.label, language)}
                </Chip>
              ))}
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <div className="mb-1.5 text-xs font-semibold text-muted-foreground">{t("תחום", "Area")}</div>
              <div className="flex flex-wrap gap-2">
                <Chip active={category === null} onClick={() => setCategory(null)}>
                  {t("הכל", "All")}
                </Chip>
                {categories.map((c) => (
                  <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
                    {translatedTerm(c, language)}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a, i) => (
            <ActivityCard key={a.id} activity={a} index={i} mode={mode} returnPath={returnPath} returnLabel={returnLabel} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed p-10 text-center text-muted-foreground">
          {t("לא נמצאו פעילויות תואמות לסינון הזה.", "No activities match these filters.")}
        </div>
      )}
    </AppShell>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
