import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, RotateCcw, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ActivityCard } from "@/components/ActivityCard";
import { TherapistPostureScissorsTips } from "@/components/TherapistPostureScissorsTips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DURATIONS, FUNCTIONAL_DIFFICULTIES, DIFFICULTY_GUIDANCE, ACTIVITY_GROUPS, expandGoals } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { searchActivitiesSmart, markSeen, resetSeen, filterUnseen, allActivities, isSearchActive } from "@/lib/storage";
import { CRAFT_SUPPLIES, matchByCraftSupplies } from "@/lib/craft-supplies";
import { useSearchParams } from "react-router-dom";
import { useTranslator } from "@/lib/language";
import { activityTitle, translatedTerm } from "@/lib/content-translations";

export default function ParentPlay() {
  const { language, t } = useTranslator();
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = new Set(["search", "all", "creative", "sensory", "movement", "social"]);
  const requestedTab = searchParams.get("tab");
  const [mainTab, setMainTab] = useState(validTabs.has(requestedTab) ? requestedTab : "search");
  const [difficulty, setDifficulty] = useState(null);
  const [maxDur, setMaxDur] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [relaxedNote, setRelaxedNote] = useState(null);
  const [renderTick, forceRender] = useState(0);

  const [craftHave, setCraftHave] = useState(new Set());
  const [craftQuery, setCraftQuery] = useState("");
  const [creativeMode, setCreativeMode] = useState(searchParams.get("creativeMode") === "supplies" ? "supplies" : "browse");

  function selectMainTab(tab) {
    setMainTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    if (tab !== "creative") next.delete("creativeMode");
    setSearchParams(next, { replace: true });
  }

  function selectCreativeMode(value) {
    setCreativeMode(value);
    const next = new URLSearchParams(searchParams);
    next.set("tab", "creative");
    next.set("creativeMode", value);
    setSearchParams(next, { replace: true });
  }

  function runSearch() {
    const selectedDuration = DURATIONS.find((d) => d.mode === maxDur);
    const { result, relaxed } = searchActivitiesSmart({
      audience: "parent",
      maxDuration: selectedDuration?.mode === "max" ? selectedDuration.value : undefined,
      minDuration: selectedDuration?.mode === "min" ? selectedDuration.value : undefined,
      functionalDifficulty: difficulty ?? undefined,
      limit: 60,
    });
    setResults(result);
    setRelaxedNote(relaxed);
  }

  const displayed = useMemo(() => {
    if (!results) return [];
    return filterUnseen("parent", results).result;
  }, [results, renderTick]);

  const parentActivities = useMemo(() => allActivities().filter((a) => isSearchActive(a) && (a.audience === "parent" || a.audience === "both")), []);

  function domainFilter(slug) {
    const group = ACTIVITY_GROUPS[slug];
    if (!group) return [];
    const related = new Set(expandGoals(group.categories));
    return parentActivities.filter((a) => [a.categories, a.goals, a.functions, a.tags].some((list) => list?.some((value) => related.has(value))));
  }
  const sensoryResults = useMemo(() => domainFilter("sensory"), [parentActivities]);
  const movementResults = useMemo(() => domainFilter("movement"), [parentActivities]);
  const creativeBrowseResults = useMemo(() => domainFilter("creative"), [parentActivities]);

  const craftActivities = useMemo(() => parentActivities.filter((a) => a.tags?.includes("יצירה")), [parentActivities]);
  const craftResults = useMemo(() => matchByCraftSupplies(craftActivities, craftHave), [craftActivities, craftHave]);
  const matchesCraftQuery = (activity) => {
    const term = craftQuery.trim().toLowerCase();
    if (!term) return true;
    return [activity.title, activityTitle(activity, "en"), activity.short_description, activity.description, ...(activity.materials || []), ...(activity.tags || [])]
      .filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
  };
  const searchedCreativeBrowseResults = useMemo(() => creativeBrowseResults.filter(matchesCraftQuery), [creativeBrowseResults, craftQuery]);
  const searchedCraftResults = useMemo(() => craftResults.filter(({ activity }) => matchesCraftQuery(activity)), [craftResults, craftQuery]);
  function toggleCraftItem(key) {
    setCraftHave((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const socialGamesResults = useMemo(() => parentActivities.filter((a) => a.tags?.includes("משחקי חברה")), [parentActivities]);

  const showResultsArea = submitted;

  return (
    <AppShell mode="parent">
      <div className="mb-2">
        <h2 className="font-display text-2xl font-black md:text-3xl">{t("במה נשחק היום?", "What shall we play today?")}</h2>
      </div>

      {language === "he" ? <TherapistPostureScissorsTips /> : null}

      <div className="grid gap-3 lg:grid-cols-[200px_1fr]">
        {/* ---------- right-side tab menu ---------- */}
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          <SideTabBtn active={mainTab === "search"} onClick={() => selectMainTab("search")}>
            {t("מנוע חיפוש", "Activity finder")}
          </SideTabBtn>
          <SideTabBtn active={mainTab === "all"} onClick={() => selectMainTab("all")}>
            {t("כל הפעילויות", "All activities")}
          </SideTabBtn>
          <SideTabBtn active={mainTab === "creative"} onClick={() => selectMainTab("creative")}>
            🎨 {t("פעילויות יצירה", "Creative activities")}
          </SideTabBtn>
          <SideTabBtn active={mainTab === "sensory"} onClick={() => selectMainTab("sensory")}>
            🌈 {t("פעילויות סנסוריות", "Sensory activities")}
          </SideTabBtn>
          <SideTabBtn active={mainTab === "movement"} onClick={() => selectMainTab("movement")}>
            🤸 {t("פעילויות תנועה", "Movement activities")}
          </SideTabBtn>
          <SideTabBtn active={mainTab === "social"} onClick={() => selectMainTab("social")}>
            🎉 {t("משחקי חברה", "Social games")}
          </SideTabBtn>
        </div>

        {/* ---------- content ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm md:p-5"
        >
          {mainTab === "search" ? (
            <div>
              <Section title={t("1. במה את/ה רוצה להתמקד? (בחירה אחת)", "1. What would you like to focus on? (Choose one)")}>
                <div className="space-y-2">
                  {FUNCTIONAL_DIFFICULTIES.map((group) => (
                    <div key={group.category}>
                      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                        <img
                          src={group.icon}
                          alt=""
                          aria-hidden="true"
                          className="h-5 w-5 shrink-0 rounded-full bg-white object-contain"
                        />
                        {translatedTerm(group.category, language)}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {group.items.map((it) => (
                          <Chip
                            key={it.label}
                            active={difficulty === it.label}
                            onClick={() => setDifficulty(difficulty === it.label ? null : it.label)}
                          >
                            <img
                              src={it.icon}
                              alt=""
                              aria-hidden="true"
                              className="me-0.5 h-6 w-6 shrink-0 rounded-full bg-white object-contain"
                            />
                            {translatedTerm(it.label, language)}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title={t("2. כמה זמן יש?", "2. How much time do you have?")}>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <Chip key={d.mode} active={maxDur === d.mode} onClick={() => setMaxDur(d.mode)}>
                      {translatedTerm(d.label, language)}
                    </Chip>
                  ))}
                </div>
              </Section>

              <Button
                onClick={() => {
                  setSubmitted(true);
                  runSearch();
                }}
                className="mt-1 w-full rounded-full bg-sage px-7 py-4 text-sm text-sage-foreground md:w-auto"
              >
                {t("מצא לי פעילות ✨", "Find an activity ✨")}
              </Button>

              {showResultsArea ? (
                displayed.length > 0 ? (
                  <div className="mt-10">
                    <div className="mb-4 flex items-center gap-2">
                      <h3 className="font-display text-xl font-black">{t("רעיונות בשבילך", "Ideas for you")}</h3>
                      {language === "he" && difficulty && DIFFICULTY_GUIDANCE[difficulty] ? (
                        <DifficultyTipButton points={DIFFICULTY_GUIDANCE[difficulty]} />
                      ) : null}
                    </div>

                    {relaxedNote === "duration" ? (
                      <div className="mb-4 max-w-xl rounded-2xl bg-sky/20 px-4 py-2.5 text-sm text-foreground/80">
                        {t("לא מצאנו פעילות מדויקת בזמן שציינת, אז הבאנו את הפעילות הכי מתאימה לקושי שבחרת (יכול להיות שתיקח מעט יותר זמן).", "We did not find an exact match for the time you selected, so we chose the activity that best fits your focus. It may take a little longer.")}
                      </div>
                    ) : relaxedNote === "difficulty" ? (
                      <div className="mb-4 max-w-xl rounded-2xl bg-sky/20 px-4 py-2.5 text-sm text-foreground/80">
                        {t("לא מצאנו פעילות ספציפית לקושי הזה, אז הבאנו רעיון מתאים לזמן שיש לך.", "We did not find an activity for this exact focus, so we selected an idea that fits the time you have.")}
                      </div>
                    ) : relaxedNote === "both" ? (
                      <div className="mb-4 max-w-xl rounded-2xl bg-sky/20 px-4 py-2.5 text-sm text-foreground/80">
                        {t("לא מצאנו פעילות מדויקת לקושי ולזמן שבחרת, אז הבאנו רעיון כללי שיכול להתאים.", "We did not find an exact match for your focus and time, so we selected a general idea that may work well.")}
                      </div>
                    ) : null}

                    <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                          markSeen(
                            "parent",
                            displayed.slice(0, 3).map((a) => a.id),
                          );
                          forceRender((n) => n + 1);
                        }}
                      >
                        <RefreshCw className="h-4 w-4" /> {t("פעילויות אחרות", "Other activities")}
                      </Button>
                      <Button
                        variant="ghost"
                        className="rounded-full text-muted-foreground"
                        onClick={() => {
                          resetSeen("parent");
                          forceRender((n) => n + 1);
                        }}
                      >
                        <RotateCcw className="h-4 w-4" /> {t("אפס היסטוריה", "Reset history")}
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {displayed.slice(0, 3).map((a, i) => (
                        <ActivityCard key={a.id} activity={a} index={i} mode="parent" returnPath="/parent/play?tab=search" returnLabel={t("חזרה לתוצאות החיפוש", "Back to search results")} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-10 rounded-3xl border border-dashed border-border p-8 text-center">
                    <p className="text-muted-foreground">{t("לא נמצאו פעילויות תואמות. נסו לשנות את הקושי או משך הזמן שבחרתם.", "No matching activities were found. Try changing the focus or time selected.")}</p>
                  </div>
                )
              ) : null}
            </div>
          ) : mainTab === "all" ? (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">{t(`כל הפעילויות בבנק, בלי סינון - ${parentActivities.length} בסך הכל.`, `All activities in the library, with no filters — ${parentActivities.length} in total.`)}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {parentActivities.map((a, i) => (
                  <ActivityCard key={a.id} activity={a} index={i} mode="parent" returnPath="/parent/play?tab=all" returnLabel="חזרה לכל הפעילויות" />
                ))}
              </div>
            </div>
          ) : mainTab === "creative" ? (
            <div>
              <div className="mb-6 inline-flex flex-wrap rounded-full bg-muted p-1">
                <TabBtn active={creativeMode === "browse"} onClick={() => selectCreativeMode("browse")}>
                  {t("כל פעילויות היצירה", "Browse creative activities")}
                </TabBtn>
                <TabBtn active={creativeMode === "supplies"} onClick={() => selectCreativeMode("supplies")}>
                  {t("לפי ציוד יצירה שיש לי בבית", "Use supplies I have at home")}
                </TabBtn>
              </div>

              <div className="relative mb-5">
                <Search className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${language === "en" ? "left-3" : "right-3"}`} />
                <Input value={craftQuery} onChange={(event) => setCraftQuery(event.target.value)} placeholder={t("חיפוש יצירה לפי שם, חומר או מילת מפתח...", "Search crafts by name, material, or keyword...")} className={language === "en" ? "pl-9" : "pr-9"} />
              </div>

              {creativeMode === "browse" ? (
                searchedCreativeBrowseResults.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {searchedCreativeBrowseResults.map((a, i) => (
                    <ActivityCard key={a.id} activity={a} index={i} mode="parent" returnPath="/parent/play?tab=creative&creativeMode=browse" returnLabel="חזרה לפעילויות יצירה" />
                  ))}
                </div> : <div className="rounded-3xl border border-dashed border-border p-8 text-center text-muted-foreground">{t("לא נמצאו יצירות שמתאימות לחיפוש.", "No crafts match your search.")}</div>
              ) : (
                <div>
                  <div className="mb-6 rounded-3xl border border-border/60 bg-background p-5">
                    <p className="mb-3 text-sm text-muted-foreground">{t("סמנו את הציוד שיש לכם, ונציג פעילויות יצירה - מהקרובה ביותר להכנה מיידית ועד הרחוקה יותר.", "Select the supplies you have and we will show the activities that are easiest to make right away first.")}</p>
                    <div className="flex flex-wrap gap-2">
                      {CRAFT_SUPPLIES.map((s) => (
                        <Chip key={s.key} active={craftHave.has(s.key)} onClick={() => toggleCraftItem(s.key)}>
                          {translatedTerm(s.label, language)}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {searchedCraftResults.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {searchedCraftResults.map(({ activity, missing }, i) => (
                        <div key={activity.id} className="relative">
                          {craftHave.size > 0 ? (
                            <span
                              className={cn(
                                "absolute -top-2 right-3 z-10 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-sm",
                                missing.length === 0 ? "bg-sage text-sage-foreground" : "bg-butter text-foreground/80",
                              )}
                            >
                              {missing.length === 0 ? t("יש לכם הכל! ✓", "You have everything! ✓") : t(`חסר ${missing.length} פריטים`, `${missing.length} item${missing.length === 1 ? "" : "s"} missing`)}
                            </span>
                          ) : null}
                          <ActivityCard activity={activity} index={i} mode="parent" returnPath="/parent/play?tab=creative&creativeMode=supplies" returnLabel="חזרה לפעילויות יצירה" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-border p-8 text-center">
                      <p className="text-muted-foreground">{t("לא מצאנו פעילויות יצירה מתאימות כרגע.", "No suitable creative activities were found.")}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : mainTab === "sensory" ? (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">{t(`${sensoryResults.length} פעילויות סנסוריות.`, `${sensoryResults.length} sensory activities.`)}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sensoryResults.map((a, i) => (
                  <ActivityCard key={a.id} activity={a} index={i} mode="parent" returnPath="/parent/play?tab=sensory" returnLabel="חזרה לפעילויות סנסוריות" />
                ))}
              </div>
            </div>
          ) : mainTab === "movement" ? (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">{t(`${movementResults.length} פעילויות תנועה.`, `${movementResults.length} movement activities.`)}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {movementResults.map((a, i) => (
                  <ActivityCard key={a.id} activity={a} index={i} mode="parent" returnPath="/parent/play?tab=movement" returnLabel="חזרה לפעילויות תנועה" />
                ))}
              </div>
            </div>
          ) : mainTab === "social" ? (
            <div>
              <p className="mb-4 text-sm text-muted-foreground">{t(`משחקי חצר וחברה קלאסיים - ${socialGamesResults.length} משחקים.`, `Classic playground and social games — ${socialGamesResults.length} games.`)}</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {socialGamesResults.map((a, i) => (
                  <ActivityCard key={a.id} activity={a} index={i} mode="parent" returnPath="/parent/play?tab=social" returnLabel="חזרה למשחקי חברה" />
                ))}
              </div>
            </div>
          ) : null}
        </motion.div>
      </div>
    </AppShell>
  );
}

function DifficultyTipButton({ points }) {
  return (
    <div className="relative z-40 shrink-0 print:hidden">
      <details className="group relative">
        <summary
          aria-label="לפני שמתחילים: מה כדאי לדעת"
          title="לפני שמתחילים: מה כדאי לדעת"
          className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-xl border border-[#8FC7A6] bg-[#DCEEE4] text-lg shadow-sm transition-transform marker:content-none hover:scale-105 group-open:scale-105"
        >
          💡
        </summary>
        <div
          role="dialog"
          aria-label="לפני שמתחילים: מה כדאי לדעת"
          className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-3rem)] rounded-2xl border border-border/60 bg-card p-4 shadow-lg"
        >
          <h4 className="mb-2 font-display text-sm font-bold">לפני שמתחילים: מה כדאי לדעת</h4>
          <ul className="space-y-1.5">
            {points.map((point, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs leading-relaxed text-foreground/90">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sage-foreground/70" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}

function SideTabBtn({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-2xl border px-4 py-3 text-sm font-bold text-right transition-colors lg:whitespace-normal",
        active ? "border-primary bg-sage/20 text-foreground" : "border-border/60 bg-card text-muted-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}

function TabBtn({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-bold transition-colors",
        active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-3">
      <div className="mb-1 text-xs font-semibold text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}
function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center justify-center gap-1 rounded-full border px-3 py-1 text-[13px] font-medium leading-tight transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
