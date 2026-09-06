import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RefreshCw,
  RotateCcw,
  Stethoscope,
  ChevronRight,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ActivityCard } from "@/components/ActivityCard";
import { IllustratedNavButton, IllustratedNavCard } from "@/components/IllustratedNavCard";
import { Button } from "@/components/ui/button";
import { AGES, DURATIONS, MOMENTS, FUNCTIONAL_DIFFICULTIES, DIFFICULTY_GUIDANCE, ACTIVITY_GROUPS, THERAPIST_GOALS } from "@/lib/constants";
import { SCISSOR_TIP_CARDS } from "@/lib/scissors-tips";
import { PencilGripPostureGuide } from "@/lib/pencil-grip-posture";
import { cn } from "@/lib/utils";
import { searchActivities, searchActivitiesSmart, markSeen, resetSeen, filterUnseen, allActivities, isSearchActive } from "@/lib/storage";
import { CRAFT_SUPPLIES, matchByCraftSupplies } from "@/lib/craft-supplies";

export default function Home({ mode = "therapist" }) {
  const isParent = mode === "parent";
  const base = isParent ? "/parent" : "/therapist";
  const navigate = useNavigate();

  const [view, setView] = useState("home"); // "home" | "play" (parent only)
  const [tab, setTab] = useState("quick");
  const [craftHave, setCraftHave] = useState(new Set());
  const [age, setAge] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [maxDur, setMaxDur] = useState(null);
  const [moment, setMoment] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [relaxedNote, setRelaxedNote] = useState(null);
  const [renderTick, forceRender] = useState(0);

  function runSearch(nextMoment) {
    const activeMoment = nextMoment ?? moment;
    if (activeMoment) {
      const rows = searchActivities({ audience: "parent", age: age ?? undefined, moment: activeMoment, limit: 60 });
      setResults(rows);
      setRelaxedNote(null);
      return;
    }
    const selectedDuration = DURATIONS.find((d) => d.mode === maxDur);
    const { result, relaxed } = searchActivitiesSmart({
      audience: "parent",
      age: age ?? undefined,
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

  const craftActivities = useMemo(
    () => allActivities().filter((a) => isSearchActive(a) && (a.audience === "parent" || a.audience === "both") && a.tags?.includes("יצירה")),
    [],
  );
  const craftResults = useMemo(() => matchByCraftSupplies(craftActivities, craftHave), [craftActivities, craftHave]);

  function toggleCraftItem(key) {
    setCraftHave((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const showResultsArea = (results?.length ?? 0) > 0 || submitted || !!moment;

  return (
    <AppShell mode={mode} pageClassName={view === "home" ? "bg-sky/35" : undefined}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-black">{isParent ? "שלום 👋" : "מרחב המטפל"}</h1>
          {!isParent && <p className="mt-2 text-muted-foreground">בנק פעילויות פרטניות, מטרות התפתחותיות ובניית מפגש</p>}
        </div>

        {view === "home" ? (
          <div>
            {isParent ? (
              <IllustratedNavButton
                onClick={() => setView("play")}
                image="/icon-bank/navigation-v2/play-today.webp"
                title="במה נשחק היום?"
                description="בחרו גיל, קושי וזמן — ונמצא רעיון מתאים"
                large
              />
            ) : (
              <>
                <IllustratedNavCard
                  to="/therapist/build"
                  image="/icon-bank/navigation-v2/therapy-build.webp"
                  title="בנה לוח למפגש טיפולי"
                  description="בחרי גיל, מטרות וזמן — ותכנני מפגש מותאם"
                  large
                  showArrow
                />

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <GoalSearchTile
                    onSearch={(goal) => navigate(`/therapist/all?category=${encodeURIComponent(goal)}`)}
                  />
                  <IllustratedNavCard
                    to="/therapist/recipes"
                    image="/icon-bank/navigation-v2/recipes.webp"
                    title="מתכונים"
                    className="min-h-[220px]"
                  />
                  <IllustratedNavCard
                    to="/therapist/experiments"
                    image="/icon-bank/navigation-v2/experiments.webp"
                    title="ניסויים"
                    className="min-h-[220px]"
                  />
                  <IllustratedNavCard
                    to="/therapist/all"
                    image="/icon-bank/navigation-v2/play-today.webp"
                    title="כל הפעילויות"
                    className="min-h-[220px]"
                  />
                </div>
              </>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <IllustratedNavCard
                to={`${base}/social-stories`}
                image="/icon-bank/navigation-v2/social-stories.webp"
                title="מחולל סיפורים חברתיים"
              />
              <IllustratedNavCard
                to={`${base}/cipher`}
                image="/icon-bank/navigation-v2/cipher.webp"
                title="מחולל כתב סתרים"
              />
              <IllustratedNavCard
                to={`${base}/morning-routine`}
                image="/icon-bank/navigation-v2/morning-routine.webp"
                title="לוח התארגנות בוקר"
              />
              <IllustratedNavCard
                to={`${base}/evening-routine`}
                image="/icon-bank/navigation-v2/morning-routine.webp"
                title="לוח התארגנות ערב"
              />
              <IllustratedNavCard
                to={`${base}/weekly-board`}
                image="/icon-bank/navigation-v2/morning-routine.webp"
                title="לוח התארגנות שבועי"
              />
              <IllustratedNavCard
                to={`${base}/hebrew-calendar`}
                image="/icon-bank/navigation-v2/family-calendar-illustrated-v2.webp"
                title="יצירת לוח שנה"
              />
              {isParent ? (
                <>
                  <IllustratedNavCard
                    to={`${base}/recipes`}
                    image="/icon-bank/navigation-v2/recipes.webp"
                    title="מתכונים"
                  />
                  <IllustratedNavCard
                    to={`${base}/experiments`}
                    image="/icon-bank/navigation-v2/experiments.webp"
                    title="ניסויים"
                  />
                </>
              ) : null}
              <IllustratedNavCard
                to={`${base}/all?group=${ACTIVITY_GROUPS.creative.slug}`}
                image="/icon-bank/navigation-v2/creative.webp"
                title={ACTIVITY_GROUPS.creative.label}
              />
              <IllustratedNavCard
                to={`${base}/all?group=${ACTIVITY_GROUPS.sensory.slug}`}
                image="/icon-bank/navigation-v2/sensory.webp"
                title={ACTIVITY_GROUPS.sensory.label}
              />
              <IllustratedNavCard
                to={`${base}/all?group=${ACTIVITY_GROUPS.movement.slug}`}
                image="/icon-bank/navigation-v2/movement.webp"
                title={ACTIVITY_GROUPS.movement.label}
              />
              <IllustratedNavCard
                to={`${base}/board-games`}
                image="/icon-bank/navigation-v2/board-games.webp"
                title="משחקי קופסה"
              />
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setView("home")}
              className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" /> חזרה
            </button>

            <div className="mb-6 inline-flex flex-wrap rounded-full bg-muted p-1">
              <TabBtn active={tab === "quick"} onClick={() => setTab("quick")}>
                לפי מה שיש לי עכשיו
              </TabBtn>
              <TabBtn active={tab === "moment"} onClick={() => setTab("moment")}>
                לפי רגע ביום
              </TabBtn>
              <TabBtn active={tab === "craft"} onClick={() => setTab("craft")}>
                לפי ציוד יצירה שיש לי
              </TabBtn>
            </div>

            {tab === "quick" ? (
              <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
                <Section title="1. גיל הילד">
                  <div className="flex flex-wrap gap-2">
                    {AGES.map((a) => (
                      <Chip key={a} active={age === a} onClick={() => setAge(a)}>
                        {a}
                      </Chip>
                    ))}
                  </div>
                </Section>

                <Section title="2. במה את/ה רוצה להתמקד? (בחירה אחת)">
                  <div className="space-y-4">
                    {FUNCTIONAL_DIFFICULTIES.map((group) => (
                      <div key={group.category}>
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <span aria-hidden>{group.emoji}</span>
                          {group.category}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {group.items.map((it) => (
                            <Chip
                              key={it.label}
                              active={difficulty === it.label}
                              onClick={() => setDifficulty(difficulty === it.label ? null : it.label)}
                            >
                              <span className="me-1.5" aria-hidden>
                                {it.emoji}
                              </span>
                              {it.label}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="3. כמה זמן יש?">
                  <div className="flex flex-wrap gap-2">
                    {DURATIONS.map((d) => (
                      <Chip key={d.mode} active={maxDur === d.mode} onClick={() => setMaxDur(d.mode)}>
                        {d.label}
                      </Chip>
                    ))}
                  </div>
                </Section>

                <Button
                  onClick={() => {
                    setSubmitted(true);
                    runSearch();
                  }}
                  disabled={!age}
                  className="mt-6 w-full md:w-auto rounded-full bg-sage text-sage-foreground px-8 py-6 text-base"
                >
                  מצא לי פעילות ✨
                </Button>
              </div>
            ) : tab === "moment" ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {MOMENTS.map((m, i) => (
                  <motion.button
                    key={m.slug}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => {
                      setMoment(m.slug);
                      runSearch(m.slug);
                    }}
                    className={cn(
                      "rounded-3xl border p-5 text-right transition-all hover:-translate-y-0.5 hover:shadow-md",
                      moment === m.slug ? "border-primary bg-sage/20" : "border-border/60 bg-card",
                    )}
                  >
                    <div className="text-3xl">{m.emoji}</div>
                    <div className="mt-2 font-display font-bold">{m.slug}</div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div>
                <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
                  <h2 className="mb-1 font-display text-xl font-bold">מה יש לכם בבית ליצירה?</h2>
                  <p className="mb-4 text-sm text-muted-foreground">
                    סמנו את הציוד שיש לכם, ונציג פעילויות יצירה — מהקרובה ביותר להכנה מיידית ועד הרחוקה יותר.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CRAFT_SUPPLIES.map((s) => (
                      <Chip key={s.key} active={craftHave.has(s.key)} onClick={() => toggleCraftItem(s.key)}>
                        {s.label}
                      </Chip>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="mb-4 font-display text-2xl font-black">
                    {craftHave.size > 0 ? "פעילויות יצירה מתאימות" : "כל פעילויות היצירה"}
                  </h2>
                  {craftResults.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {craftResults.map(({ activity, missing }, i) => (
                        <div key={activity.id} className="relative">
                          {craftHave.size > 0 ? (
                            <span
                              className={cn(
                                "absolute -top-2 right-3 z-10 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-sm",
                                missing.length === 0 ? "bg-sage text-sage-foreground" : "bg-butter text-foreground/80",
                              )}
                            >
                              {missing.length === 0 ? "יש לכם הכל! ✓" : `חסר ${missing.length} פריטים`}
                            </span>
                          ) : null}
                          <ActivityCard activity={activity} index={i} mode="parent" returnPath="/" returnLabel="חזרה לדף הבית" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-border p-8 text-center">
                      <p className="text-muted-foreground">לא מצאנו פעילויות יצירה מתאימות כרגע.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab !== "craft" && showResultsArea ? (
              displayed.length > 0 ? (
                <div className="mt-10">
                  <h2 className="mb-4 font-display text-2xl font-black">רעיונות בשבילך</h2>

                  {difficulty === "אחיזת עיפרון" ? <PencilGripPostureGuide /> : null}

                  {difficulty && DIFFICULTY_GUIDANCE[difficulty] ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 rounded-3xl border border-sage/40 bg-sage/10 p-5 md:p-6"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage/30 text-sage-foreground">
                          <Stethoscope className="h-5 w-5" />
                        </div>
                        <h3 className="font-display text-xl font-black text-foreground md:text-2xl">לפני שמתחילים: מה כדאי לדעת</h3>
                      </div>
                      <ul className="space-y-2.5">
                        {DIFFICULTY_GUIDANCE[difficulty].map((point, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sage-foreground/70" aria-hidden />
                            <span className="text-base leading-snug text-foreground md:text-lg">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ) : null}

                  {difficulty === "שימוש במספריים" ? (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-6 max-w-xl">
                      <div className="flex flex-wrap justify-center gap-3 sm:flex-nowrap">
                        {SCISSOR_TIP_CARDS.map((tip, i) => (
                          <div
                            key={i}
                            className={cn(
                              "flex w-24 flex-col items-center gap-2 rounded-2xl border p-3 text-center sm:w-auto sm:flex-1",
                              tip.emphasize ? "border-sage bg-sage/25" : "border-sage/30 bg-sage/10",
                            )}
                          >
                            <div className="h-12 w-12 shrink-0">
                              <tip.icon />
                            </div>
                            <span className="text-xs font-semibold leading-snug text-foreground">{tip.text}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}

                  {relaxedNote === "duration" ? (
                    <div className="mb-4 max-w-xl rounded-2xl bg-sky/20 px-4 py-2.5 text-sm text-foreground/80">
                      לא מצאנו פעילות מדויקת בזמן שציינת, אז הבאנו את הפעילות הכי מתאימה לגיל ולקושי שבחרת (יכול להיות שתיקח מעט יותר זמן).
                    </div>
                  ) : relaxedNote === "difficulty" ? (
                    <div className="mb-4 max-w-xl rounded-2xl bg-sky/20 px-4 py-2.5 text-sm text-foreground/80">
                      לא מצאנו פעילות ספציפית לקושי הזה, אז הבאנו רעיון מתאים לגיל ולזמן שיש לך.
                    </div>
                  ) : relaxedNote === "both" ? (
                    <div className="mb-4 max-w-xl rounded-2xl bg-sky/20 px-4 py-2.5 text-sm text-foreground/80">
                      לא מצאנו פעילות מדויקת לקושי ולזמן שבחרת, אז הבאנו רעיון כללי שמתאים לגיל.
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
                      <RefreshCw className="h-4 w-4" /> פעילויות אחרות
                    </Button>
                    <Button
                      variant="ghost"
                      className="rounded-full text-muted-foreground"
                      onClick={() => {
                        resetSeen("parent");
                        forceRender((n) => n + 1);
                      }}
                    >
                      <RotateCcw className="h-4 w-4" /> אפס היסטוריה
                    </Button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {displayed.slice(0, 3).map((a, i) => (
                      <ActivityCard key={a.id} activity={a} index={i} mode="parent" returnPath="/" returnLabel="חזרה לדף הבית" />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-10 rounded-3xl border border-dashed border-border p-8 text-center">
                  <p className="text-muted-foreground">לא נמצאו פעילויות תואמות. נסו לשנות את הגיל, הקושי או משך הזמן שבחרתם.</p>
                </div>
              )
            ) : null}
          </>
        )}
      </motion.div>
    </AppShell>
  );
}

function GoalSearchTile({ onSearch }) {
  const [value, setValue] = useState("");

  function submit(goal) {
    const term = (goal ?? value).trim();
    if (!term) return;
    onSearch(term);
  }

  return (
    <div
      className={cn(
        "group relative flex min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br from-lavender/60 via-lavender/35 to-sky/30 p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-foreground shadow-sm">
          <Search className="h-4 w-4" />
        </span>
        <h2 className="font-display text-base font-black leading-snug text-foreground">חיפוש לפי מטרות טיפול</h2>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="relative"
      >
        <input
          list="therapist-goals-list"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="לדוגמה: גזירה, ויסות חושי..."
          className="w-full rounded-xl border border-white/80 bg-[#fffaf2]/90 px-3 py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
        />
        <datalist id="therapist-goals-list">
          {THERAPIST_GOALS.map((g) => (
            <option key={g} value={g} />
          ))}
        </datalist>
        <button type="submit" className="sr-only">
          חיפוש
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <div className="mb-2 text-sm font-semibold text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}
function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:bg-muted",
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
        "rounded-full px-5 py-2 text-sm font-medium transition-colors",
        active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
      )}
    >
      {children}
    </button>
  );
}
