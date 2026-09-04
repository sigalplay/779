import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Shuffle, Clock, X, Save, ExternalLink, Route, Play, ArrowRight, ChevronUp, ChevronDown, Printer, FolderOpen, RotateCcw, Camera, ChefHat, FlaskConical, Check, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { TherapistPostureScissorsTips } from "@/components/TherapistPostureScissorsTips";
import { VisualSessionTimer } from "@/components/VisualSessionTimer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { THERAPIST_GOALS, DURATIONS, expandGoals, ACTIVITY_GROUPS } from "@/lib/constants";
import { activityEmoji } from "@/lib/activity-emoji";
import { activityHero } from "@/lib/activity-icons";
import { therapistGoalIcon } from "@/lib/therapist-goal-icons";
import { MOTOR_TRAIL_ITEMS, MOTOR_TRAIL_HERO } from "@/lib/motor-trail-items";
import { RECIPES } from "@/pages/TherapistRecipes";
import { EXPERIMENTS, experimentHero, PANTRY_CATEGORIES, PANTRY_TAGS } from "@/pages/TherapistExperiments";
import { allActivities, getActivity, getTreatmentPlan, saveTreatmentPlan, updateTreatmentPlan, isSignedIn, getDraftPlan, setDraftPlan, isSearchActive, newestActivitiesFirst } from "@/lib/storage";
import { CRAFT_SUPPLIES, matchByCraftSupplies } from "@/lib/craft-supplies";
import { attachPlanToSession, completeClinicSession, getPatient, getSession, startClinicSession } from "@/lib/therapist-clinic";
import { activityTitle, translatedTerm } from "@/lib/content-translations";
import { useTranslator } from "@/lib/language";

function scoreActivity(activity, expandedGoals) {
  return expandedGoals.filter((g) => activity.goals?.includes(g)).length;
}

function motorTrailItem(id, planItem) {
  return MOTOR_TRAIL_ITEMS.find((it) => it.id === id) ?? planItem?.customItems?.find((it) => it.id === id);
}
function getRecipe(id) {
  return RECIPES.find((r) => r.id === id) ?? null;
}
function getExperiment(id) {
  return EXPERIMENTS.find((e) => e.id === id) ?? null;
}

const GAME_MAKING_ACTIVITY_IDS = ["seed-100", "seed-50", "seed-47", "seed-73", "seed-10", "seed-64"];

export default function TherapistBuild() {
  const { language, t } = useTranslator();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const view = searchParams.get("view") === "session" ? "session" : "plan";
  const sessionId = searchParams.get("session");
  const patientId = searchParams.get("patient");
  const requestedPlanId = searchParams.get("plan");
  const linkedSession = sessionId ? getSession(sessionId) : null;
  const linkedPatient = getPatient(patientId || linkedSession?.patientId);
  const loadedTreatmentPlan = requestedPlanId ? getTreatmentPlan(requestedPlanId) : null;

  const [goals, setGoals] = useState(() => linkedSession?.treatmentGoals || loadedTreatmentPlan?.params?.goals || linkedPatient?.goals || []);
  const [contentType, setContentType] = useState("activities"); // "activities" | "recipes" | "experiments"
  const [durationMode, setDurationMode] = useState(() => loadedTreatmentPlan?.params?.durationMode || null); // null | "max" | "min"
  const [index, setIndex] = useState(0);
  const [plan, setPlan] = useState(() => linkedSession?.treatmentPlanItems || linkedSession?.activities?.map((id) => ({ kind: "activity", id })) || loadedTreatmentPlan?.items || getDraftPlan());
  const [title, setTitle] = useState(() => linkedSession?.title || loadedTreatmentPlan?.title || "");
  const [editingPlanId, setEditingPlanId] = useState(() => loadedTreatmentPlan?.id || null);
  const [saving, setSaving] = useState(false);
  const [activeSessionItem, setActiveSessionItem] = useState(null); // index into plan, while "entered"
  const [craftMode, setCraftMode] = useState(false);
  const [craftHave, setCraftHave] = useState(new Set());
  const [craftQuery, setCraftQuery] = useState("");
  const therapistTabs = new Set(["search", "all", "creative", "game-making", "sensory", "movement", "social", "experiments", "recipes"]);
  const [mainTab, setMainTab] = useState(therapistTabs.has(searchParams.get("tab")) ? searchParams.get("tab") : "search");
  const [creativeMode, setCreativeMode] = useState(searchParams.get("creativeMode") === "supplies" ? "supplies" : "browse");
  const [experimentsMode, setExperimentsMode] = useState("browse"); // "browse" | "pantry"
  const [pantryHave, setPantryHave] = useState(new Set());

  useEffect(() => {
    setDraftPlan(plan);
  }, [plan]);

  useEffect(() => {
    if (view === "session") return;
    const next = new URLSearchParams(searchParams);
    next.set("tab", mainTab);
    if (mainTab === "creative") next.set("creativeMode", creativeMode);
    else next.delete("creativeMode");
    if (next.toString() !== searchParams.toString()) setSearchParams(next, { replace: true });
  }, [mainTab, creativeMode, view]);

  function toggleGoal(v) {
    setGoals((prev) => (prev.includes(v) ? prev.filter((g) => g !== v) : [...prev, v]));
    setIndex(0);
  }

  const candidates = useMemo(() => {
    if (contentType === "recipes") return RECIPES;
    if (contentType === "experiments") return EXPERIMENTS;
    const pool = allActivities().filter((a) => isSearchActive(a) && (a.audience === "therapist" || a.audience === "both"));
    const filtered = durationMode
      ? pool.filter((a) => (durationMode === "max" ? a.duration_min <= 15 : a.duration_min >= 15))
      : pool;
    const expandedGoals = goals.length ? expandGoals(goals) : [];
    const matching = expandedGoals.length
      ? filtered.filter((activity) => scoreActivity(activity, expandedGoals) > 0)
      : filtered;
    return [...matching].sort((a, b) => {
      const dateDiff = newestActivitiesFirst(a, b);
      if (dateDiff !== 0) return dateDiff;
      const diff = scoreActivity(b, expandedGoals) - scoreActivity(a, expandedGoals);
      if (diff !== 0) return diff;
      return a.duration_min - b.duration_min;
    });
  }, [goals, durationMode, contentType]);

  const planActivityIds = useMemo(
    () => new Set(plan.filter((p) => p.kind === "activity").map((p) => p.id)),
    [plan],
  );
  const planRecipeIds = useMemo(() => new Set(plan.filter((p) => p.kind === "recipe").map((p) => p.id)), [plan]);
  const planExperimentIds = useMemo(() => new Set(plan.filter((p) => p.kind === "experiment").map((p) => p.id)), [plan]);
  const existingMotorTrail = useMemo(() => plan.find((p) => p.kind === "motor-trail"), [plan]);

  const craftActivities = useMemo(
    () => allActivities().filter((a) => isSearchActive(a) && (a.audience === "therapist" || a.audience === "both") && a.tags?.includes("יצירה")),
    [],
  );
  const craftResults = useMemo(() => matchByCraftSupplies(craftActivities, craftHave), [craftActivities, craftHave]);
  const matchesCraftQuery = (activity) => {
    const term = craftQuery.trim().toLowerCase();
    if (!term) return true;
    return [activity.title, activityTitle(activity, "en"), activity.short_description, activity.description, ...(activity.materials || []), ...(activity.tags || [])]
      .filter(Boolean).some((value) => String(value).toLowerCase().includes(term));
  };
  const searchedCraftResults = useMemo(() => craftResults.filter(({ activity }) => matchesCraftQuery(activity)), [craftResults, craftQuery]);
  function toggleCraftItem(key) {
    setCraftHave((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const therapistActivities = useMemo(
    () => allActivities().filter((a) => isSearchActive(a) && (a.audience === "therapist" || a.audience === "both")),
    [],
  );
  function domainFilter(slug) {
    const group = ACTIVITY_GROUPS[slug];
    if (!group) return [];
    const related = new Set(expandGoals(group.categories));
    return therapistActivities.filter((a) => [a.categories, a.goals, a.functions, a.tags].some((list) => list?.some((value) => related.has(value))));
  }
  const sensoryResults = useMemo(() => domainFilter("sensory"), [therapistActivities]);
  const movementResults = useMemo(() => domainFilter("movement"), [therapistActivities]);
  const creativeBrowseResults = useMemo(() => domainFilter("creative"), [therapistActivities]);
  const searchedCreativeBrowseResults = useMemo(() => creativeBrowseResults.filter(matchesCraftQuery), [creativeBrowseResults, craftQuery]);
  const gameMakingResults = useMemo(
    () => GAME_MAKING_ACTIVITY_IDS.map((id) => therapistActivities.find((activity) => activity.id === id)).filter(Boolean),
    [therapistActivities],
  );
  const socialGamesResults = useMemo(() => therapistActivities.filter((a) => a.tags?.includes("משחקי חברה")), [therapistActivities]);

  const pantryResults = useMemo(() => {
    return EXPERIMENTS.map((e) => {
      const req = PANTRY_TAGS[e.id] || [];
      const missing = req.filter((t) => !pantryHave.has(t));
      return { e, missing };
    }).sort((a, b) => a.missing.length - b.missing.length);
  }, [pantryHave]);
  function togglePantryItem(item) {
    setPantryHave((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  }

  const availableCandidates = useMemo(() => {
    if (contentType === "recipes") return candidates.filter((c) => !planRecipeIds.has(c.id));
    if (contentType === "experiments") return candidates.filter((c) => !planExperimentIds.has(c.id));
    return candidates.filter((c) => !planActivityIds.has(c.id));
  }, [candidates, planActivityIds, planRecipeIds, planExperimentIds, contentType]);
  const displayed = useMemo(() => {
    if (availableCandidates.length === 0) return [];
    const count = Math.min(3, availableCandidates.length);
    const picked = [];
    for (let i = 0; i < count; i++) {
      picked.push(availableCandidates[(index + i) % availableCandidates.length]);
    }
    return [...new Map(picked.map((a) => [a.id, a])).values()];
  }, [availableCandidates, index]);

  function goToNext() {
    if (availableCandidates.length === 0) return;
    setIndex((i) => (i + 3) % availableCandidates.length);
  }

  function handleAdd(item, kind = "activity") {
    if (!item) return;
    const already =
      kind === "activity" ? planActivityIds.has(item.id) : kind === "recipe" ? planRecipeIds.has(item.id) : planExperimentIds.has(item.id);
    if (already) {
      toast.info(kind === "activity" ? "הפעילות כבר בתוכנית" : kind === "recipe" ? "המתכון כבר בתוכנית" : "הניסוי כבר בתוכנית");
      return;
    }
    setPlan((prev) => [...prev, { kind, id: item.id }]);
    if (!title) setTitle("מפגש טיפולי");
    toast.success(kind === "activity" ? "נוספה לתוכנית הטיפול" : kind === "recipe" ? "המתכון נוסף לתוכנית" : "הניסוי נוסף לתוכנית");
  }

  function handleRemove(item) {
    setPlan((prev) =>
      prev.filter((p) => {
        if (item.kind === "activity" || item.kind === "recipe" || item.kind === "experiment") {
          return !(p.kind === item.kind && p.id === item.id);
        }
        return p.uid !== item.uid; // motor-trail, photo, etc.
      }),
    );
  }

  function handlePhotoCapture(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow capturing the same photo again later
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 700;
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setPlan((prev) => [...prev, { kind: "photo", uid: `photo-${Date.now()}`, image: dataUrl, label: "תמונה" }]);
        toast.success("התמונה נוספה לתכנית הטיפול");
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function moveItem(index, dir) {
    setPlan((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleResetPlan() {
    if (!plan.length) return;
    setPlan([]);
    toast.success("תוכנית הטיפול אופסה");
  }

  function handleSave() {
    if (!isSignedIn()) {
      toast.error("יש להתחבר כדי לשמור את התוכנית");
      return;
    }
    if (!plan.length) {
      toast.error("התוכנית ריקה - הוסיפי לפחות פעילות אחת");
      return;
    }
    setSaving(true);
    try {
      const planTitle = title || "מפגש טיפולי";
      const planParams = { goals, durationMode, patientId: linkedPatient?.id || null, sessionId };
      const savedPlan = editingPlanId
        ? updateTreatmentPlan(editingPlanId, planTitle, plan, planParams)
        : saveTreatmentPlan(planTitle, plan, planParams);
      if (!savedPlan) {
        toast.error("לא הצלחנו למצוא את התכנית לעדכון");
        return;
      }
      if (!editingPlanId) {
        setEditingPlanId(savedPlan.id);
        const next = new URLSearchParams(searchParams);
        next.set("plan", savedPlan.id);
        setSearchParams(next, { replace: true });
      }
      if (sessionId) attachPlanToSession(sessionId, plan, { goals, durationMode, planId: savedPlan.id });
      toast.success(
        sessionId
          ? `התוכנית נשמרה לטיפול של ${linkedPatient?.name || "המטופל"}`
          : editingPlanId
            ? "התכנית עודכנה!"
            : "התכנית נשמרה!",
      );
    } finally {
      setSaving(false);
    }
  }

  function startSession() {
    if (sessionId) startClinicSession(sessionId);
    const next = new URLSearchParams();
    next.set("view", "session");
    if (sessionId) next.set("session", sessionId);
    if (linkedPatient?.id) next.set("patient", linkedPatient.id);
    setSearchParams(next);
  }
  function endSession() {
    setActiveSessionItem(null);
    const next = new URLSearchParams();
    next.set("tab", "search");
    if (sessionId) next.set("session", sessionId);
    if (linkedPatient?.id) next.set("patient", linkedPatient.id);
    setSearchParams(next);
  }
  function finishSession() {
    if (!sessionId) return endSession();
    attachPlanToSession(sessionId, plan, { goals, durationMode });
    completeClinicSession(sessionId);
    toast.success("הטיפול הסתיים ונשמר ביומן");
    navigate(`/therapist/patient/${linkedPatient?.id || linkedSession?.patientId}?session=${sessionId}`);
  }

  function toggleSessionItemCompleted(itemIndex) {
    const nextPlan = plan.map((item, index) =>
      index === itemIndex ? { ...item, completed: !item.completed } : item,
    );
    setPlan(nextPlan);
    if (sessionId) attachPlanToSession(sessionId, nextPlan, { goals, durationMode });
  }

  const totalMinutes = plan.reduce((sum, p) => {
    if (p.kind === "activity") return sum + (getActivity(p.id)?.duration_min ?? 0);
    return sum;
  }, 0);

  // ---------- Session (full-board) view ----------
  if (view === "session") {
    return (
      <AppShell mode="therapist" fullScreen>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-black">{linkedPatient ? `הטיפול של ${linkedPatient.name}` : "לוח המפגש"}</h1>
            <p className="mt-1 text-muted-foreground">בחרי פעילות כדי להתחיל בה. אפשר לחזור ללוח בכל רגע.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <VisualSessionTimer />
            <Button variant="outline" onClick={endSession} className="rounded-full">
              <ArrowRight className="h-4 w-4" /> חזרה לעריכת התוכנית
            </Button>
            {sessionId && <Button onClick={finishSession} className="rounded-full bg-foreground text-background"><Save className="h-4 w-4" /> סיום טיפול</Button>}
          </div>
        </div>

        <TherapistPostureScissorsTips />

        <ol className="space-y-3">
          {plan.map((item, i) => {
            const activity = item.kind === "activity" ? getActivity(item.id) : null;
            const recipe = item.kind === "recipe" ? getRecipe(item.id) : null;
            const experiment = item.kind === "experiment" ? getExperiment(item.id) : null;
            const hero =
              item.kind === "activity"
                ? activityHero(item.id) || activity?.hero_image || (activity?.ai_generated ? "/icon-bank/manual/pencil-2.webp" : null)
                : item.kind === "photo"
                  ? item.image
                  : item.kind === "recipe"
                    ? recipe?.cover ?? null
                    : item.kind === "experiment"
                      ? experimentHero(item.id)
                      : MOTOR_TRAIL_HERO;
            const title2 =
              item.kind === "activity"
                ? activityTitle(activity, language) ?? t("פעילות", "Activity")
                : item.kind === "photo"
                  ? item.label || "תמונה"
                  : item.kind === "recipe"
                    ? recipe?.title ?? "מתכון"
                    : item.kind === "experiment"
                      ? experiment?.title ?? "ניסוי"
                      : "מסלול מוטורי";
            const linkTo =
              item.kind === "activity"
                ? `/activity/${item.id}?mode=therapist&returnTo=session&returnPath=${encodeURIComponent(`/therapist/build?view=session${sessionId ? `&session=${sessionId}` : ""}${linkedPatient?.id ? `&patient=${linkedPatient.id}` : ""}`)}`
                : item.kind === "motor-trail"
                  ? `/therapist/motor-trail?returnTo=session&edit=${item.uid}`
                  : item.kind === "recipe"
                    ? `/therapist/recipes?r=${item.id}`
                    : item.kind === "experiment"
                      ? `/therapist/experiments?e=${item.id}`
                      : null;
            const rowInner = (
              <>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/30 text-sm font-bold">
                  {i + 1}
                </span>
                <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2">
                  {hero ? (
                    <img
                      src={hero}
                      alt=""
                      className={`max-h-full max-w-full drop-shadow-md ${item.kind === "photo" ? "h-full w-full object-cover" : "object-contain"}`}
                    />
                  ) : item.kind === "motor-trail" ? (
                    <Route className="h-8 w-8 text-muted-foreground" />
                  ) : item.kind === "recipe" ? (
                    recipe?.coverIcon ? <recipe.coverIcon /> : <span className="text-4xl">{recipe?.coverEmoji ?? "🍳"}</span>
                  ) : item.kind === "experiment" ? (
                    <FlaskConical className="h-8 w-8 text-muted-foreground" />
                  ) : (
                    <span className="text-4xl">{activity ? activityEmoji(activity) : "✨"}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-base font-bold leading-snug">{title2}</h3>
                  {item.kind === "motor-trail" && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {item.equipment.map((eid) => motorTrailItem(eid, item)?.label).filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </>
            );
            return (
              <li
                key={item.kind === "activity" || item.kind === "recipe" || item.kind === "experiment" ? `${item.kind}-${item.id}` : item.uid}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                  item.completed ? "border-[#b7d8bd] bg-[#edf7ee]" : "border-border/60 bg-card",
                )}
              >
                <div className="flex items-center gap-3 p-3">
                  <button
                    type="button"
                    aria-pressed={Boolean(item.completed)}
                    aria-label={item.completed ? `ביטול סימון ${title2} כפעילות שבוצעה` : `סימון ${title2} כפעילות שבוצעה`}
                    title={item.completed ? "סומן כבוצע" : "סימון כבוצע"}
                    onClick={() => toggleSessionItemCompleted(i)}
                    className={cn(
                      "z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 bg-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
                      item.completed
                        ? "border-[#7fb58a] bg-[#a9cfaa] text-[#234f35]"
                        : "border-border text-transparent hover:border-[#9bc4a3] hover:bg-[#f3faf4]",
                    )}
                  >
                    <Check className="h-5 w-5" strokeWidth={3} />
                  </button>
                  {linkTo ? (
                  <Link to={linkTo} className="flex min-w-0 flex-1 items-center gap-4">
                    {rowInner}
                  </Link>
                ) : (
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {rowInner}
                  </div>
                )}
                </div>
              </li>
            );
          })}
        </ol>
      </AppShell>
    );
  }

  // ---------- Plan-building view ----------
  return (
    <AppShell mode="therapist">
      <div className="mb-4">
        <h1 className="font-display text-3xl font-black">{t("בנה לוח למפגש טיפולי", "Build a Therapy Session Board")}</h1>
        {linkedPatient && <p className="mt-1 font-bold text-sage-foreground">{t("עבור", "For")} {linkedPatient.name}{linkedSession ? ` · ${linkedSession.date} · ${linkedSession.time || t("שעה לא נקבעה", "Time not set")}` : ""}</p>}
      </div>

      <TherapistPostureScissorsTips />

      <div className="grid gap-6 lg:grid-cols-[180px_1fr_320px]">
        {/* ---------- right-side tab menu ---------- */}
        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          <SideTabBtn active={mainTab === "search"} onClick={() => setMainTab("search")}>
            {t("מנוע חיפוש", "Activity search")}
          </SideTabBtn>
          <SideTabBtn active={mainTab === "all"} onClick={() => setMainTab("all")}>
            כל הפעילויות
          </SideTabBtn>
          <SideTabBtn active={mainTab === "creative"} onClick={() => setMainTab("creative")}>
            🎨 פעילויות יצירה
          </SideTabBtn>
          <SideTabBtn active={mainTab === "game-making"} onClick={() => setMainTab("game-making")}>
            🧩 הכנת משחקים
          </SideTabBtn>
          <SideTabBtn active={mainTab === "sensory"} onClick={() => setMainTab("sensory")}>
            🌈 פעילויות סנסוריות
          </SideTabBtn>
          <SideTabBtn active={mainTab === "movement"} onClick={() => setMainTab("movement")}>
            🤸 פעילויות תנועה
          </SideTabBtn>
          <SideTabBtn active={mainTab === "social"} onClick={() => setMainTab("social")}>
            🎉 משחקי חברה
          </SideTabBtn>
          <SideTabBtn active={mainTab === "experiments"} onClick={() => setMainTab("experiments")}>
            ניסויים
          </SideTabBtn>
          <SideTabBtn active={mainTab === "recipes"} onClick={() => setMainTab("recipes")}>
            מתכונים
          </SideTabBtn>
        </div>

        {/* ---------- main area: filters + one activity at a time ---------- */}
        <div className="space-y-6">
          {mainTab === "search" ? (
          <div className="space-y-5 rounded-3xl border border-border/60 bg-card p-6">
            <div>
              <Label className="mb-2 block">{t("מטרות טיפוליות", "Therapy goals")}</Label>
                <div className="flex flex-wrap gap-2">
                  {THERAPIST_GOALS.map((g) => (
                    <button
                      key={g}
                      onClick={() => toggleGoal(g)}
                      className={cn(
                        "inline-flex min-h-10 items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm",
                        goals.includes(g) ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      )}
                    >
                      <img
                        src={therapistGoalIcon(g)}
                        alt=""
                        aria-hidden="true"
                        className="h-7 w-7 shrink-0 rounded-full bg-white object-contain"
                      />
                      {translatedTerm(g, language)}
                    </button>
                  ))}
                </div>
            </div>

            <div>
                <Label className="mb-2 block">{t("משך הפעילות", "Activity duration")}</Label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.mode}
                      onClick={() => {
                        setDurationMode(durationMode === d.mode ? null : d.mode);
                        setIndex(0);
                      }}
                      className={cn(
                        "rounded-full border px-4 py-1.5 text-sm",
                        durationMode === d.mode ? "border-primary bg-primary text-primary-foreground" : "border-border",
                      )}
                    >
                      {translatedTerm(d.label, language)}
                    </button>
                  ))}
                </div>
            </div>
          </div>
          ) : null}

          {/* ---------- 3 suggested items ---------- */}
          {mainTab === "search" && (
          displayed.length > 0 ? (
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold">
                  {contentType === "recipes" ? t("מתכונים מתאימים", "Matching recipes") : contentType === "experiments" ? t("ניסויים מתאימים", "Matching experiments") : t("פעילויות מתאימות", "Matching activities")}
                </h2>
                <Button variant="outline" onClick={goToNext} className="rounded-full">
                  <Shuffle className="h-4 w-4" /> 3 {contentType === "recipes" ? t("מתכונים אחרים", "Other recipes") : contentType === "experiments" ? t("ניסויים אחרים", "Other experiments") : t("פעילויות אחרות", "Other activities")}
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {displayed.map((item) => {
                  if (contentType === "recipes") {
                    return (
                      <div key={item.id} className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
                        <div className="flex h-40 items-center justify-center bg-white">
                          {item.cover ? (
                            <div className="flex h-28 w-28 items-center justify-center">
                              <img src={item.cover} alt="" className="max-h-full max-w-full object-contain" />
                            </div>
                          ) : item.coverIcon ? (
                            <div className="h-20 w-20"><item.coverIcon /></div>
                          ) : (
                            <span className="text-6xl">{item.coverEmoji ?? "🍳"}</span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-display text-base font-bold leading-snug">{item.title}</h3>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> {item.duration}
                            </span>
                          </div>
                          <div className="mt-auto flex flex-wrap items-center gap-2">
                            <Button onClick={() => handleAdd(item, "recipe")} size="sm" className="rounded-full bg-sage text-sage-foreground">
                              <Plus className="h-3.5 w-3.5" /> הוסף לתכנית
                            </Button>
                            <Link
                              to={`/therapist/recipes?r=${item.id}`}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" /> צפייה מלאה
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  if (contentType === "experiments") {
                    return (
                      <div key={item.id} className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
                        <div className="flex h-40 items-center justify-center bg-white p-3">
                          <img src={experimentHero(item.id)} alt="" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex flex-1 flex-col p-4">
                          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-display text-base font-bold leading-snug">{item.title}</h3>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> {item.time}
                            </span>
                          </div>
                          <div className="mt-auto flex flex-wrap items-center gap-2">
                            <Button onClick={() => handleAdd(item, "experiment")} size="sm" className="rounded-full bg-sage text-sage-foreground">
                              <Plus className="h-3.5 w-3.5" /> הוסף לתכנית
                            </Button>
                            <Link
                              to={`/therapist/experiments?e=${item.id}`}
                              className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                              <ExternalLink className="h-3 w-3" /> צפייה מלאה
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  const activity = item;
                  return (
                    <div key={activity.id} className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
                      <div className="flex h-40 items-center justify-center bg-white">
                        {activityHero(activity.id) || activity.hero_image ? (
                          <div className="flex h-28 w-28 items-center justify-center">
                            <img src={activityHero(activity.id) || activity.hero_image} alt="" className="max-h-full max-w-full object-contain" />
                          </div>
                        ) : activity.ai_generated ? (
                          <img src="/icon-bank/manual/pencil-2.webp" alt="" className="h-24 w-24 object-contain" />
                        ) : (
                          <span className="text-6xl">{activityEmoji(activity)}</span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                          <h3 className="font-display text-base font-bold leading-snug">{activityTitle(activity, language)}</h3>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {activity.duration_min}+ {t("דק'", "min")}
                          </span>
                        </div>
                        <div className="mt-auto flex flex-wrap items-center gap-2">
                          <Button onClick={() => handleAdd(activity, "activity")} size="sm" className="rounded-full bg-sage text-sage-foreground">
                            <Plus className="h-3.5 w-3.5" /> הוסף לתכנית
                          </Button>
                          <Link
                            to={`/activity/${activity.id}`}
                            className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3 w-3" /> צפייה מלאה
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
              {contentType === "recipes"
                ? "כל המתכונים כבר בתוכנית."
                : contentType === "experiments"
                  ? "כל הניסויים כבר בתוכנית."
                  : "לא נמצאו פעילויות תואמות לסינון שבחרת. נסי גיל אחר, פחות מטרות, או משך זמן אחר."}
            </div>
          )
          )}

          {mainTab === "all" ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">כל הפעילויות בבנק, בלי סינון - {therapistActivities.length} בסך הכל.</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {therapistActivities.map((activity) => (
                  <ActivityCandidateCard key={activity.id} activity={activity} onAdd={() => handleAdd(activity, "activity")} />
                ))}
              </div>
            </div>
          ) : mainTab === "creative" ? (
            <div>
              <div className="mb-6 inline-flex flex-wrap rounded-full bg-muted p-1">
                <SmallTabBtn active={creativeMode === "browse"} onClick={() => setCreativeMode("browse")}>
                  כל פעילויות היצירה
                </SmallTabBtn>
                <SmallTabBtn active={creativeMode === "supplies"} onClick={() => setCreativeMode("supplies")}>
                  לפי חומרי יצירה שיש לי
                </SmallTabBtn>
              </div>

              <div className="relative mb-5">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={craftQuery} onChange={(event) => setCraftQuery(event.target.value)} placeholder="חיפוש יצירה לפי שם, חומר או מילת מפתח..." className="pr-9" />
              </div>

              {creativeMode === "browse" ? (
                searchedCreativeBrowseResults.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {searchedCreativeBrowseResults.map((activity) => (
                    <ActivityCandidateCard key={activity.id} activity={activity} onAdd={() => handleAdd(activity, "activity")} />
                  ))}
                </div> : <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">לא נמצאו יצירות שמתאימות לחיפוש.</div>
              ) : (
                <div>
                  <div className="mb-6 rounded-3xl border border-border/60 bg-background p-5">
                    <p className="mb-3 text-sm text-muted-foreground">
                      סמני את החומרים שיש לך בקליניקה או בבית, ונציג פעילויות יצירה - מהקרובה ביותר להכנה מיידית ועד הרחוקה יותר.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CRAFT_SUPPLIES.map((s) => (
                        <button
                          key={s.key}
                          onClick={() => toggleCraftItem(s.key)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm",
                            craftHave.has(s.key) ? "border-primary bg-primary text-primary-foreground" : "border-border",
                          )}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {searchedCraftResults.length ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {searchedCraftResults.map(({ activity, missing }) => (
                        <div key={activity.id} className="relative">
                          {craftHave.size > 0 ? (
                            <span
                              className={cn(
                                "absolute -top-2 right-3 z-10 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-sm",
                                missing.length === 0 ? "bg-sage text-sage-foreground" : "bg-butter text-foreground/80",
                              )}
                            >
                              {missing.length === 0 ? "יש לך הכל! ✓" : `חסר ${missing.length} פריטים`}
                            </span>
                          ) : null}
                          <ActivityCandidateCard activity={activity} onAdd={() => handleAdd(activity, "activity")} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
                      לא מצאנו פעילויות יצירה מתאימות כרגע.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : mainTab === "game-making" ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">פעילויות שבהן מכינים משחק שאפשר להמשיך לשחק בו.</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gameMakingResults.map((activity) => (
                  <ActivityCandidateCard key={activity.id} activity={activity} onAdd={() => handleAdd(activity, "activity")} />
                ))}
              </div>
            </div>
          ) : mainTab === "sensory" ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">{sensoryResults.length} פעילויות סנסוריות.</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sensoryResults.map((activity) => (
                  <ActivityCandidateCard key={activity.id} activity={activity} onAdd={() => handleAdd(activity, "activity")} />
                ))}
              </div>
            </div>
          ) : mainTab === "movement" ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">{movementResults.length} פעילויות תנועה.</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {movementResults.map((activity) => (
                  <ActivityCandidateCard key={activity.id} activity={activity} onAdd={() => handleAdd(activity, "activity")} />
                ))}
              </div>
            </div>
          ) : mainTab === "social" ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">משחקי חצר וחברה קלאסיים - {socialGamesResults.length} משחקים.</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {socialGamesResults.map((activity) => (
                  <ActivityCandidateCard key={activity.id} activity={activity} onAdd={() => handleAdd(activity, "activity")} />
                ))}
              </div>
            </div>
          ) : mainTab === "experiments" ? (
            <div>
              <div className="mb-6 inline-flex flex-wrap rounded-full bg-muted p-1">
                <SmallTabBtn active={experimentsMode === "browse"} onClick={() => setExperimentsMode("browse")}>
                  כל הניסויים
                </SmallTabBtn>
                <SmallTabBtn active={experimentsMode === "pantry"} onClick={() => setExperimentsMode("pantry")}>
                  לפי מה שיש לי בבית
                </SmallTabBtn>
              </div>

              {experimentsMode === "browse" ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {EXPERIMENTS.map((item) => (
                    <ExperimentCandidateCard key={item.id} item={item} onAdd={() => handleAdd(item, "experiment")} />
                  ))}
                </div>
              ) : (
                <div>
                  <div className="mb-6 space-y-3 rounded-3xl border border-border/60 bg-background p-5">
                    <p className="mb-1 text-sm text-muted-foreground">סמני מה יש בקליניקה או בבית, ונבנה רשימת ניסויים אפשרית.</p>
                    {PANTRY_CATEGORIES.map((cat) => (
                      <div key={cat.key}>
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                          <span aria-hidden>{cat.emoji}</span>
                          {cat.label}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {cat.items.map((it) => (
                            <button
                              key={it}
                              onClick={() => togglePantryItem(it)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-sm",
                                pantryHave.has(it) ? "border-primary bg-primary text-primary-foreground" : "border-border",
                              )}
                            >
                              {it}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <h2 className="mb-3 font-display text-lg font-bold">{pantryHave.size > 0 ? "מה אפשר להכין עם מה שיש לך" : "כל הניסויים"}</h2>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pantryResults.map(({ e, missing }) => (
                      <div key={e.id} className="relative">
                        {pantryHave.size > 0 ? (
                          <span
                            className={cn(
                              "absolute -top-2 right-3 z-10 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-sm",
                              missing.length === 0 ? "bg-sage text-sage-foreground" : "bg-butter text-foreground/80",
                            )}
                          >
                            {missing.length === 0 ? "יש לך הכל! ✓" : `חסר ${missing.length} פריטים`}
                          </span>
                        ) : null}
                        <ExperimentCandidateCard item={e} onAdd={() => handleAdd(e, "experiment")} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : mainTab === "recipes" ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">כל המתכונים בבנק, בלי סינון - {RECIPES.length} בסך הכל.</p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {RECIPES.map((item) => (
                  <RecipeCandidateCard key={item.id} item={item} onAdd={() => handleAdd(item, "recipe")} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* ---------- plan sidebar ---------- */}
        <aside className="h-fit space-y-4 rounded-3xl border border-border/60 bg-card p-5 lg:sticky lg:top-6">
          <div>
            <h2 className="font-display text-lg font-bold">תכנית הטיפול</h2>
            <p className="text-sm text-muted-foreground">
              {plan.length} פריטים{totalMinutes ? ` · ${totalMinutes}+ דק' סה"כ` : ""}
            </p>
          </div>

          <Link
            to={`/therapist/motor-trail?returnTo=plan${existingMotorTrail ? `&edit=${existingMotorTrail.uid}` : ""}`}
            className="flex items-center gap-2 rounded-2xl border border-dashed border-sage/50 bg-sage/5 px-3 py-2.5 text-foreground transition-colors hover:bg-sage/10"
          >
            <Route className="h-4 w-4 shrink-0 text-sage-foreground" />
            <span className="flex-1 text-sm font-medium">{existingMotorTrail ? "עריכת מסלול מוטורי" : "הוספת מסלול מוטורי"}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-sage-foreground" />
          </Link>

          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-sage/50 bg-sage/5 px-3 py-2.5 text-foreground transition-colors hover:bg-sage/10">
            <Camera className="h-4 w-4 shrink-0 text-sage-foreground" />
            <span className="flex-1 text-sm font-medium">צילום תמונה והוספה לתכנית</span>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
          </label>

          {plan.length === 0 ? (
            <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">
              עדיין לא הוספת פעילויות. לחצי על "הוסף לתכנית הטיפול" כדי להתחיל.
            </p>
          ) : (
            <ul className="space-y-2">
              {plan.map((item, i) => {
                const activity = item.kind === "activity" ? getActivity(item.id) : null;
                const recipe = item.kind === "recipe" ? getRecipe(item.id) : null;
                const experiment = item.kind === "experiment" ? getExperiment(item.id) : null;
                const hero =
                  item.kind === "activity"
                    ? activityHero(item.id) || activity?.hero_image || (activity?.ai_generated ? "/icon-bank/manual/pencil-2.webp" : null)
                    : item.kind === "photo"
                      ? item.image
                      : item.kind === "recipe"
                        ? recipe?.cover ?? null
                        : item.kind === "experiment"
                          ? experimentHero(item.id)
                          : motorTrailItem(item.equipment?.[0], item)?.image;
                const rowKey =
                  item.kind === "activity" || item.kind === "recipe" || item.kind === "experiment" ? `${item.kind}-${item.id}` : item.uid;
                const linkTo =
                  item.kind === "motor-trail"
                    ? `/therapist/motor-trail?returnTo=plan&edit=${item.uid}`
                    : item.kind === "recipe"
                      ? `/therapist/recipes?r=${item.id}`
                      : item.kind === "experiment"
                        ? `/therapist/experiments?e=${item.id}`
                        : null;
                const inner = (
                  <>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage/30 text-xs font-bold text-sage-foreground">
                      {i + 1}
                    </span>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {hero ? (
                        <img src={hero} alt="" className={`h-full w-full ${item.kind === "photo" ? "object-cover" : "object-contain p-0.5"}`} />
                      ) : item.kind === "motor-trail" ? (
                        <Route className="h-5 w-5 text-muted-foreground" />
                      ) : item.kind === "recipe" ? (
                        recipe?.coverIcon ? <recipe.coverIcon /> : <span className="text-xl">{recipe?.coverEmoji ?? "🍳"}</span>
                      ) : item.kind === "experiment" ? (
                        <FlaskConical className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <span className="text-xl">{activity ? activityEmoji(activity) : "✨"}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium leading-snug">
                        {item.kind === "activity"
                          ? activityTitle(activity, language) ?? t("פעילות", "Activity")
                          : item.kind === "photo"
                            ? item.label || "תמונה"
                            : item.kind === "recipe"
                              ? recipe?.title ?? "מתכון"
                              : item.kind === "experiment"
                                ? experiment?.title ?? "ניסוי"
                                : "מסלול מוטורי"}
                      </span>
                      {item.kind === "motor-trail" && item.equipment?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.equipment.map((eid) => {
                            const eq = motorTrailItem(eid, item);
                            if (!eq) return null;
                            return (
                              <span
                                key={eid}
                                title={eq.label}
                                className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background"
                              >
                                <img src={eq.image} alt="" className="h-full w-full object-contain" />
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </>
                );
                return (
                  <li key={rowKey} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background p-2">
                    {linkTo ? (
                      <Link to={linkTo} className="flex flex-1 items-center gap-2 hover:opacity-80">
                        {inner}
                      </Link>
                    ) : (
                      <div className="flex flex-1 items-center gap-2">{inner}</div>
                    )}
                    <div className="flex shrink-0 items-center">
                      <button
                        type="button"
                        onClick={() => moveItem(i, -1)}
                        disabled={i === 0}
                        aria-label="הזז למעלה"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(i, 1)}
                        disabled={i === plan.length - 1}
                        aria-label="הזז למטה"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemove(item)}
                        aria-label="הסר מהתוכנית"
                        className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="space-y-2 border-t border-border/60 pt-4">
            <Button onClick={startSession} disabled={!plan.length} className="w-full rounded-full bg-sage text-sage-foreground">
              <Play className="h-4 w-4" /> {sessionId ? "התחל טיפול" : "התחל מפגש"}
            </Button>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="שם התוכנית" />
            <Button onClick={handleSave} disabled={saving || !plan.length} variant="outline" className="w-full rounded-full">
              <Save className="h-4 w-4" /> {editingPlanId ? "עדכון תכנית" : "שמור תכנית"}
            </Button>
            <Button variant="outline" onClick={() => window.print()} disabled={!plan.length} className="w-full rounded-full">
              <Printer className="h-4 w-4" /> הדפס
            </Button>
            <Link to="/therapist/plans" className="block">
              <Button variant="outline" className="w-full rounded-full">
                <FolderOpen className="h-4 w-4" /> התוכניות השמורות שלי
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleResetPlan}
              disabled={!plan.length}
              className="w-full rounded-full text-muted-foreground"
            >
              <RotateCcw className="h-4 w-4" /> איפוס תוכנית הטיפול
            </Button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function ActivityCandidateCard({ activity, onAdd }) {
  const { language, t } = useTranslator();
  const location = useLocation();
  const params = new URLSearchParams({
    mode: "therapist",
    returnPath: `${location.pathname}${location.search}`,
    returnLabel: "חזרה לבניית הטיפול",
  });
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
      <div className="flex h-40 items-center justify-center bg-white">
        {activityHero(activity.id) || activity.hero_image ? (
          <div className="flex h-28 w-28 items-center justify-center">
            <img src={activityHero(activity.id) || activity.hero_image} alt="" className="max-h-full max-w-full object-contain" />
          </div>
        ) : activity.ai_generated ? (
          <img src="/icon-bank/manual/pencil-2.webp" alt="" className="h-24 w-24 object-contain" />
        ) : (
          <span className="text-6xl">{activityEmoji(activity)}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-snug">{activityTitle(activity, language)}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {activity.duration_min}+ {t("דק'", "min")}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Button onClick={onAdd} size="sm" className="rounded-full bg-sage text-sage-foreground">
            <Plus className="h-3.5 w-3.5" /> {t("הוסף לתכנית", "Add to plan")}
          </Button>
          <Link
            to={`/activity/${activity.id}?${params.toString()}`}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" /> {t("צפייה מלאה", "View details")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ExperimentCandidateCard({ item, onAdd }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
      <div className="flex h-40 items-center justify-center bg-white p-3">
        <img src={experimentHero(item.id)} alt="" className="max-h-full max-w-full object-contain" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-snug">{item.title}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {item.time}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Button onClick={onAdd} size="sm" className="rounded-full bg-sage text-sage-foreground">
            <Plus className="h-3.5 w-3.5" /> הוסף לתכנית
          </Button>
          <Link
            to={`/therapist/experiments?e=${item.id}`}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" /> צפייה מלאה
          </Link>
        </div>
      </div>
    </div>
  );
}

function RecipeCandidateCard({ item, onAdd }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
      <div className="flex h-40 items-center justify-center bg-white">
        {item.cover ? (
          <div className="flex h-28 w-28 items-center justify-center">
            <img src={item.cover} alt="" className="max-h-full max-w-full object-contain" />
          </div>
        ) : item.coverIcon ? (
          <div className="h-20 w-20">
            <item.coverIcon />
          </div>
        ) : (
          <span className="text-6xl">{item.coverEmoji ?? "🍳"}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-snug">{item.title}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {item.duration}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Button onClick={onAdd} size="sm" className="rounded-full bg-sage text-sage-foreground">
            <Plus className="h-3.5 w-3.5" /> הוסף לתכנית
          </Button>
          <Link
            to={`/therapist/recipes?r=${item.id}`}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" /> צפייה מלאה
          </Link>
        </div>
      </div>
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

function SmallTabBtn({ active, children, onClick }) {
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
