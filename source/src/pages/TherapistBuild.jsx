import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Camera, Check, ChevronDown, ChevronUp, Clock, ExternalLink, FlaskConical, FolderOpen, Play, Plus, Printer, RotateCcw, Route, Save, Search, Shuffle, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageToolbox } from "@/components/toolbox/PageToolbox";
import { VisualSessionTimer } from "@/components/VisualSessionTimer";
import { ActivityNameSearch, matchesName } from "@/components/ActivityNameSearch";
import { BoardDateNavigation } from "@/components/session-board/BoardDateNavigation";
import { BoardToolbar } from "@/components/session-board/BoardToolbar";
import { BoardCanvas } from "@/components/session-board/BoardCanvas";
import { BoardPhotoPreview } from "@/components/session-board/BoardPhotoPreview";
import { BoardToolbox } from "@/components/session-board/BoardToolbox";
import { ChoiceBoard } from "@/components/session-board/ChoiceBoard";
import { BoardDayAppointments } from "@/components/session-board/BoardDayAppointments";
import { HomePracticeShare } from "@/components/session-board/HomePracticeShare";
import { MyImagesDialog } from "@/components/session-board/MyImagesDialog";
import { imageAsDataUrl, listMyImages } from "@/lib/my-images-cloud";
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
import { BOARD_GAMES, findBoardGame, findSign, localizedLabel, readPhotoFile, renderSignCard } from "@/lib/session-board-tools";
import { getGuestBoard, getGuestBoardDrawing, guestBoardDates, normalizeBoardDate, saveGuestBoard, saveGuestBoardDrawing } from "@/lib/session-board-storage";
import { hasCloudSession, listPatientBoardDates, loadPatientBoard, savePatientBoard } from "@/lib/session-board-cloud";

const ACTIVE_PATIENT_KEY = "boo_active_cloud_patient";
const GUEST_BACKUP_KEY = "boo_guest_board_backup";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const GAME_MAKING_ACTIVITY_IDS = ["seed-100", "seed-50", "seed-47", "seed-73", "seed-10", "seed-64"];
const THERAPIST_TABS = new Set(["search", "all", "creative", "game-making", "sensory", "movement", "social", "experiments", "recipes"]);

function scoreActivity(activity, expandedGoals) {
  return expandedGoals.filter((g) => activity.goals?.includes(g)).length;
}
function boardItemKey(item) {
  return item.kind === "activity" || item.kind === "recipe" || item.kind === "experiment" ? `${item.kind}-${item.id}` : item.uid;
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
function readJson(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key) || "null"); return value ?? fallback; } catch { return fallback; }
}
function readActivePatient() {
  return readJson(ACTIVE_PATIENT_KEY, null);
}
function patientDrawingKey(patientId, date) {
  return `boo_board_drawing_patient_${patientId}_${date}`;
}

// Opening the guest (no-client) board of a date. A saved board for that date wins; without a
// date in the address, the last guest board from before a client board was opened is restored.
function openGuestBoard(date, hasDateParam) {
  localStorage.removeItem(ACTIVE_PATIENT_KEY);
  const saved = getGuestBoard(date);
  if (saved) return saved;
  const backup = localStorage.getItem(GUEST_BACKUP_KEY);
  const items = backup !== null && !hasDateParam ? readJson(GUEST_BACKUP_KEY, []) : getDraftPlan();
  const list = Array.isArray(items) ? items : [];
  saveGuestBoard(date, list);
  return list;
}

export default function TherapistBuild() {
  const { language, t } = useTranslator();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const view = searchParams.get("view") === "session" ? "session" : "plan";
  const sessionId = searchParams.get("session");
  const patientId = searchParams.get("patient");
  const requestedPlanId = searchParams.get("plan");
  const boardMode = searchParams.get("boardMode") === "1";
  const patientBoardId = searchParams.get("patientBoard");
  const hasDateParam = DATE_PATTERN.test(searchParams.get("boardDate") || "");
  const boardDate = normalizeBoardDate(searchParams.get("boardDate"));
  const linkedSession = sessionId ? getSession(sessionId) : null;
  const linkedPatient = getPatient(patientId || linkedSession?.patientId);
  const loadedTreatmentPlan = requestedPlanId ? getTreatmentPlan(requestedPlanId) : null;

  // A client board that was already loaded into the draft (coming back from the search page).
  const activePatient = readActivePatient();
  const patientBoardInDraft = Boolean(patientBoardId && searchParams.get("cloudBoardReady") === "1" && activePatient?.id === patientBoardId);

  const [goals, setGoals] = useState(() => linkedSession?.treatmentGoals || loadedTreatmentPlan?.params?.goals || linkedPatient?.goals || []);
  const [contentType] = useState("activities");
  const [durationMode, setDurationMode] = useState(() => loadedTreatmentPlan?.params?.durationMode || null);
  const [index, setIndex] = useState(0);
  const [plan, setPlan] = useState(() => {
    if (view === "session" && !patientBoardId) return openGuestBoard(boardDate, hasDateParam);
    if (view === "session" && patientBoardId && !patientBoardInDraft) return [];
    return linkedSession?.treatmentPlanItems || linkedSession?.activities?.map((id) => ({ kind: "activity", id })) || loadedTreatmentPlan?.items || getDraftPlan();
  });
  const [title, setTitle] = useState(() => linkedSession?.title || loadedTreatmentPlan?.title || "");
  const [editingPlanId, setEditingPlanId] = useState(() => loadedTreatmentPlan?.id || null);
  const [saving, setSaving] = useState(false);
  const [craftHave, setCraftHave] = useState(new Set());
  const [craftQuery, setCraftQuery] = useState("");
  const [mainTab, setMainTab] = useState(THERAPIST_TABS.has(searchParams.get("tab")) ? searchParams.get("tab") : "search");
  const [creativeMode, setCreativeMode] = useState(searchParams.get("creativeMode") === "supplies" ? "supplies" : "browse");
  const [experimentsMode, setExperimentsMode] = useState("browse");
  const [pantryHave, setPantryHave] = useState(new Set());
  const [nameQuery, setNameQuery] = useState("");

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

  // The search box by name starts empty for every list.
  useEffect(() => { setNameQuery(""); }, [mainTab, creativeMode, experimentsMode]);

  useEffect(() => {
    if (view === "session") return undefined;
    document.body.classList.add("therapist-build-search-page", "activities-two-column-page", "therapist-search-mobile-page");
    return () => document.body.classList.remove("therapist-build-search-page", "activities-two-column-page", "therapist-search-mobile-page");
  }, [view]);

  function toggleGoal(v) {
    setGoals((prev) => (prev.includes(v) ? prev.filter((g) => g !== v) : [...prev, v]));
    setIndex(0);
  }

  const candidates = useMemo(() => {
    if (contentType === "recipes") return RECIPES;
    if (contentType === "experiments") return EXPERIMENTS;
    const pool = allActivities().filter((a) => isSearchActive(a) && (a.audience === "therapist" || a.audience === "both"));
    const filtered = durationMode ? pool.filter((a) => (durationMode === "max" ? a.duration_min <= 15 : a.duration_min >= 15)) : pool;
    const expandedGoals = goals.length ? expandGoals(goals) : [];
    const matching = expandedGoals.length ? filtered.filter((activity) => scoreActivity(activity, expandedGoals) > 0) : filtered;
    return [...matching].sort((a, b) => {
      const dateDiff = newestActivitiesFirst(a, b);
      if (dateDiff !== 0) return dateDiff;
      const diff = scoreActivity(b, expandedGoals) - scoreActivity(a, expandedGoals);
      if (diff !== 0) return diff;
      return a.duration_min - b.duration_min;
    });
  }, [goals, durationMode, contentType]);

  const planActivityIds = useMemo(() => new Set(plan.filter((p) => p.kind === "activity").map((p) => p.id)), [plan]);
  const planRecipeIds = useMemo(() => new Set(plan.filter((p) => p.kind === "recipe").map((p) => p.id)), [plan]);
  const planExperimentIds = useMemo(() => new Set(plan.filter((p) => p.kind === "experiment").map((p) => p.id)), [plan]);
  const existingMotorTrail = useMemo(() => plan.find((p) => p.kind === "motor-trail"), [plan]);

  const creativeActivities = useMemo(
    () => allActivities().filter((a) => isSearchActive(a) && (a.audience === "therapist" || a.audience === "both") && a.tags?.includes("יצירה")),
    [],
  );
  const craftResults = useMemo(() => matchByCraftSupplies(creativeActivities, craftHave), [creativeActivities, craftHave]);
  const matchesCraftQuery = (activity) => {
    const query = craftQuery.trim().toLowerCase();
    if (!query) return true;
    return [activity.title, activityTitle(activity, "en"), activity.short_description, activity.description, ...(activity.materials || []), ...(activity.tags || [])]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query));
  };
  const searchedCraftResults = useMemo(() => craftResults.filter(({ activity }) => matchesCraftQuery(activity)), [craftResults, craftQuery]);
  function toggleCraftItem(key) {
    setCraftHave((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const therapistActivities = useMemo(() => allActivities().filter((a) => isSearchActive(a) && (a.audience === "therapist" || a.audience === "both")), []);
  function activitiesForGroup(groupKey) {
    const group = ACTIVITY_GROUPS[groupKey];
    if (!group) return [];
    const related = new Set(expandGoals(group.categories));
    return therapistActivities.filter((a) => [a.categories, a.goals, a.functions, a.tags].some((list) => list?.some((value) => related.has(value))));
  }
  const sensoryResults = useMemo(() => activitiesForGroup("sensory"), [therapistActivities]);
  const movementResults = useMemo(() => activitiesForGroup("movement"), [therapistActivities]);
  const creativeBrowseResults = useMemo(() => activitiesForGroup("creative"), [therapistActivities]);
  const searchedCreativeBrowseResults = useMemo(() => creativeBrowseResults.filter(matchesCraftQuery), [creativeBrowseResults, craftQuery]);
  const gameMakingResults = useMemo(() => GAME_MAKING_ACTIVITY_IDS.map((id) => therapistActivities.find((a) => a.id === id)).filter(Boolean), [therapistActivities]);
  const socialGamesResults = useMemo(() => therapistActivities.filter((a) => a.tags?.includes("משחקי חברה")), [therapistActivities]);

  const pantryResults = useMemo(() => {
    return EXPERIMENTS.map((e) => {
      const need = PANTRY_TAGS[e.id] || [];
      const missing = need.filter((item) => !pantryHave.has(item));
      return { e, missing };
    }).sort((a, b) => a.missing.length - b.missing.length);
  }, [pantryHave]);
  function togglePantryItem(item) {
    setPantryHave((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

  const remaining = useMemo(() => {
    if (contentType === "recipes") return candidates.filter((r) => !planRecipeIds.has(r.id));
    if (contentType === "experiments") return candidates.filter((e) => !planExperimentIds.has(e.id));
    return candidates.filter((a) => !planActivityIds.has(a.id));
  }, [candidates, planActivityIds, planRecipeIds, planExperimentIds, contentType]);

  const displayed = useMemo(() => {
    if (remaining.length === 0) return [];
    const count = Math.min(3, remaining.length);
    const list = [];
    for (let i = 0; i < count; i++) list.push(remaining[(index + i) % remaining.length]);
    return [...new Map(list.map((item) => [item.id, item])).values()];
  }, [remaining, index]);

  function goToNext() {
    if (remaining.length === 0) return;
    setIndex((i) => (i + 3) % remaining.length);
  }

  // On a phone, after adding from the search page for the session board, show the plan panel.
  function scrollToTreatmentPlan() {
    if (!boardMode || !window.matchMedia("(max-width: 760px)").matches) return;
    window.setTimeout(() => {
      const panel = document.querySelector("[data-treatment-plan-panel]");
      if (!panel) return;
      panel.style.scrollMarginTop = "76px";
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }

  function handleAdd(item, kind = "activity") {
    if (!item) return;
    const alreadyInPlan = kind === "activity" ? planActivityIds.has(item.id) : kind === "recipe" ? planRecipeIds.has(item.id) : planExperimentIds.has(item.id);
    scrollToTreatmentPlan();
    if (alreadyInPlan) {
      toast.info(kind === "activity" ? t("הפעילות כבר בתוכנית", "The activity is already in the plan") : kind === "recipe" ? t("המתכון כבר בתוכנית", "The recipe is already in the plan") : t("הניסוי כבר בתוכנית", "The experiment is already in the plan"));
      return;
    }
    setPlan((prev) => [...prev, { kind, id: item.id }]);
    if (!title) setTitle("מפגש טיפולי");
    toast.success(kind === "activity" ? t("נוספה לתוכנית הטיפול", "Added to the session plan") : kind === "recipe" ? t("המתכון נוסף לתוכנית", "Recipe added to the plan") : t("הניסוי נוסף לתוכנית", "Experiment added to the plan"));
  }

  function removeFromPlan(item) {
    setPlan((prev) => prev.filter((p) => (item.kind === "activity" || item.kind === "recipe" || item.kind === "experiment" ? !(p.kind === item.kind && p.id === item.id) : p.uid !== item.uid)));
  }

  async function handlePhotoCapture(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const image = await readPhotoFile(file, 700, 0.85);
      setPlan((prev) => [...prev, { kind: "photo", uid: `photo-${Date.now()}`, image, label: "תמונה" }]);
      toast.success(t("התמונה נוספה לתכנית הטיפול", "Photo added to the session plan."));
    } catch { /* unreadable image */ }
  }

  function moveItem(itemIndex, dir) {
    setPlan((prev) => {
      const next = [...prev];
      const target = itemIndex + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[itemIndex], next[target]] = [next[target], next[itemIndex]];
      return next;
    });
  }

  function handleResetPlan() {
    if (!plan.length) return;
    setPlan([]);
    toast.success(t("תוכנית הטיפול אופסה", "Session plan cleared."));
  }

  function handleSave() {
    if (!isSignedIn()) {
      navigate(`/auth?intent=plan&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    if (!plan.length) {
      toast.error(t("התוכנית ריקה - הוסיפי לפחות פעילות אחת", "The plan is empty — add at least one activity."));
      return;
    }
    setSaving(true);
    try {
      const planTitle = title || "מפגש טיפולי";
      const params = { goals, durationMode, patientId: linkedPatient?.id || null, sessionId };
      const saved = editingPlanId ? updateTreatmentPlan(editingPlanId, planTitle, plan, params) : saveTreatmentPlan(planTitle, plan, params);
      if (!saved) {
        toast.error(t("לא הצלחנו למצוא את התכנית לעדכון", "We couldn't find the plan to update"));
        return;
      }
      if (!editingPlanId) {
        setEditingPlanId(saved.id);
        const next = new URLSearchParams(searchParams);
        next.set("plan", saved.id);
        setSearchParams(next, { replace: true });
      }
      if (sessionId) attachPlanToSession(sessionId, plan, { goals, durationMode, planId: saved.id });
      toast.success(sessionId ? t(`התוכנית נשמרה לטיפול של ${linkedPatient?.name || "המטופל"}`, `Plan saved to ${linkedPatient?.name ? `${linkedPatient.name}'s` : "the client's"} session`) : editingPlanId ? t("התכנית עודכנה!", "Plan updated!") : t("התכנית נשמרה!", "Plan saved!"));
    } finally {
      setSaving(false);
    }
  }

  // "Start session" opens the board. On the search page for the session board it becomes
  // "Add to session" and returns to the board of the same client and date.
  function startSession() {
    if (boardMode) {
      if (!patientBoardId && hasDateParam) saveGuestBoard(boardDate, plan);
      const next = new URLSearchParams({ view: "session" });
      if (hasDateParam) next.set("boardDate", boardDate);
      if (patientBoardId) {
        next.set("patientBoard", patientBoardId);
        next.set("cloudBoardReady", "1");
      } else {
        next.set("guest", "1");
      }
      navigate(`/therapist/build?${next.toString()}`);
      window.scrollTo(0, 0);
      return;
    }
    if (sessionId) startClinicSession(sessionId);
    const next = new URLSearchParams();
    next.set("view", "session");
    if (sessionId) next.set("session", sessionId);
    if (linkedPatient?.id) next.set("patient", linkedPatient.id);
    setSearchParams(next);
  }

  function finishSession() {
    if (!sessionId) return;
    attachPlanToSession(sessionId, plan, { goals, durationMode });
    completeClinicSession(sessionId);
    toast.success(t("הטיפול הסתיים ונשמר ביומן", "Session completed and saved to the calendar."));
    navigate("/therapist/diary");
  }

  function toggleSessionItemCompleted(itemIndex) {
    const nextPlan = plan.map((item, i) => (i === itemIndex ? { ...item, completed: !item.completed } : item));
    setPlan(nextPlan);
    if (sessionId) attachPlanToSession(sessionId, nextPlan, { goals, durationMode });
  }

  const totalMinutes = plan.reduce((sum, p) => (p.kind === "activity" ? sum + (getActivity(p.id)?.duration_min ?? 0) : sum), 0);

  if (view === "session") {
    return (
      <SessionBoard
        plan={plan}
        setPlan={setPlan}
        language={language}
        t={t}
        sessionId={sessionId}
        linkedPatient={linkedPatient}
        patientBoardId={patientBoardId}
        patientBoardInDraft={patientBoardInDraft}
        boardDate={boardDate}
        hasDateParam={hasDateParam}
        searchParams={searchParams}
        onToggleCompleted={toggleSessionItemCompleted}
        onFinishSession={finishSession}
      />
    );
  }

  // ---------- Plan-building view ----------
  const addLabel = boardMode ? t("הוסף למפגש", "Add to Session Plan") : t("הוסף לתכנית", "Add to Session Plan");
  // Search by activity name above each list (hides the cards whose name does not match).
  const nameVisible = (name) => matchesName(name, nameQuery);
  const cardSearch = (titles, placement) => (titles.length > 0
    ? <ActivityNameSearch key={placement} value={nameQuery} onChange={setNameQuery} shown={titles.filter(nameVisible).length} />
    : null);
  const activityTitles = (list) => list.map((activity) => activityTitle(activity, language));
  const activityCards = (list) => list.map((activity) => (
    <ActivityCandidateCard key={activity.id} activity={activity} addLabel={addLabel} boardMode={boardMode} hidden={!nameVisible(activityTitle(activity, language))} onAdd={() => handleAdd(activity, "activity")} />
  ));

  return (
    <AppShell mode="therapist">
      <div className="mb-4">
        {/* The live site shows "לוח המפגש" as the Hebrew heading here as well. */}
        <h1 className="font-display text-3xl font-black">{t("לוח המפגש", "Build a Structured Session Plan")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("בחרו תחום התפתחות וזמן, ותכננו מפגש מובנה.", "Choose a skill area and session length to find activities that support your therapy goals.")}</p>
        {linkedPatient && <p className="mt-1 font-bold text-sage-foreground">{t("עבור", "For")} {linkedPatient.name}{linkedSession ? ` · ${linkedSession.date} · ${linkedSession.time || t("שעה לא נקבעה", "Time not set")}` : ""}</p>}
      </div>

      <PageToolbox />

      <div className="grid gap-6 lg:grid-cols-[180px_1fr_320px]">
        <div className="mobile-search-category-tabs flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          <SideTabBtn active={mainTab === "search"} onClick={() => setMainTab("search")}>{t("מנוע חיפוש", "Find Activities")}</SideTabBtn>
          <SideTabBtn active={mainTab === "all"} onClick={() => setMainTab("all")}>{t("כל הפעילויות", "All activities")}</SideTabBtn>
          <SideTabBtn active={mainTab === "creative"} onClick={() => setMainTab("creative")}>{t("🎨 פעילויות יצירה", "🎨 Creative activities")}</SideTabBtn>
          <SideTabBtn active={mainTab === "game-making"} onClick={() => setMainTab("game-making")}>{t("🧩 הכנת משחקים", "🧩 Make-and-play games")}</SideTabBtn>
          <SideTabBtn active={mainTab === "sensory"} onClick={() => setMainTab("sensory")}>{t("🌈 פעילויות סנסוריות", "🌈 Sensory activities")}</SideTabBtn>
          <SideTabBtn active={mainTab === "movement"} onClick={() => setMainTab("movement")}>{t("🤸 פעילויות תנועה", "🤸 Movement activities")}</SideTabBtn>
          <SideTabBtn active={mainTab === "social"} onClick={() => setMainTab("social")}>{t("🎉 משחקי חברה", "🎉 Social games")}</SideTabBtn>
          <SideTabBtn active={mainTab === "experiments"} onClick={() => setMainTab("experiments")}>{t("ניסויים", "Kids’ Science Experiments")}</SideTabBtn>
          <SideTabBtn active={mainTab === "recipes"} onClick={() => setMainTab("recipes")}>{t("מתכונים", "Kid-Friendly Recipes")}</SideTabBtn>
        </div>

        <div className="space-y-6">
          {mainTab === "search" ? (
            <div className="space-y-5 rounded-3xl border border-border/60 bg-card p-6">
              <div>
                <Label className="mb-2 block">{t("תחום התפתחות", "Skill Area")}</Label>
                <div className="flex flex-wrap gap-2">
                  {THERAPIST_GOALS.map((g) => (
                    <button key={g} onClick={() => toggleGoal(g)} className={cn("inline-flex min-h-10 items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm", goals.includes(g) ? "border-primary bg-primary text-primary-foreground" : "border-border", boardMode && "meeting-development-chip")}>
                      <img src={therapistGoalIcon(g)} alt="" aria-hidden="true" className="h-7 w-7 shrink-0 rounded-full bg-white object-contain" />
                      {translatedTerm(g, language)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block">{t("משך הפעילות", "Activity Length")}</Label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button key={d.mode} onClick={() => { setDurationMode(durationMode === d.mode ? null : d.mode); setIndex(0); }} className={cn("search-filter-chip search-time-chip rounded-full border px-4 py-1.5 text-sm", durationMode === d.mode ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                      {translatedTerm(d.label, language)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {mainTab === "search" && (displayed.length > 0 ? (
            <div>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold">{contentType === "recipes" ? t("מתכונים מתאימים", "Matching recipes") : contentType === "experiments" ? t("ניסויים מתאימים", "Matching experiments") : t("פעילויות מתאימות", "Matching Activities")}</h2>
                <Button variant="outline" onClick={goToNext} className="rounded-full">
                  <Shuffle className="h-4 w-4" /> 3 {contentType === "recipes" ? t("מתכונים אחרים", "Other recipes") : contentType === "experiments" ? t("ניסויים אחרים", "Other experiments") : t("פעילויות אחרות", "Other activities")}
                </Button>
              </div>
              {cardSearch(activityTitles(displayed), "search")}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 activity-card-grid-v92">
                {displayed.map((activity) => (
                  <SuggestedActivityCard key={activity.id} activity={activity} language={language} t={t} addLabel={addLabel} boardMode={boardMode} hidden={!nameVisible(activityTitle(activity, language))} onAdd={() => handleAdd(activity, "activity")} />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">
              {contentType === "recipes" ? t("כל המתכונים כבר בתוכנית.", "All the recipes are already in the plan.") : contentType === "experiments" ? t("כל הניסויים כבר בתוכנית.", "All the experiments are already in the plan.") : t("לא נמצאו פעילויות תואמות לסינון שבחרת. נסי גיל אחר, פחות מטרות, או משך זמן אחר.", "No activities match your filters. Try a different age, fewer goals, or a different length.")}
            </div>
          ))}

          {mainTab === "all" ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">{t("כל הפעילויות בבנק, בלי סינון -", "All activities in the library, without filtering —")}{" "}{therapistActivities.length}{" "}{t("בסך הכל.", "in total.")}</p>
              {cardSearch(activityTitles(therapistActivities), "all")}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 activity-card-grid-v92">{activityCards(therapistActivities)}</div>
            </div>
          ) : mainTab === "creative" ? (
            <div>
              <div className="mb-6 inline-flex flex-wrap rounded-full bg-muted p-1">
                <SmallTabBtn active={creativeMode === "browse"} onClick={() => setCreativeMode("browse")}>{t("כל פעילויות היצירה", "All creative activities")}</SmallTabBtn>
                <SmallTabBtn active={creativeMode === "supplies"} onClick={() => setCreativeMode("supplies")}>{t("לפי חומרי יצירה שיש לי", "By creative materials I have")}</SmallTabBtn>
              </div>
              <div className="relative mb-5">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={craftQuery} onChange={(event) => setCraftQuery(event.target.value)} placeholder={t("חיפוש יצירה לפי שם, חומר או מילת מפתח...", "Search for a craft by name, material, or keyword...")} className="pr-9" />
              </div>
              {creativeMode === "browse" ? (
                searchedCreativeBrowseResults.length ? (
                  <>
                    {cardSearch(activityTitles(searchedCreativeBrowseResults), "creative")}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 activity-card-grid-v92">{activityCards(searchedCreativeBrowseResults)}</div>
                  </>
                ) : <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">{t("לא נמצאו יצירות שמתאימות לחיפוש.", "No crafts match your search.")}</div>
              ) : (
                <div>
                  <div className="mb-6 rounded-3xl border border-border/60 bg-background p-5">
                    <p className="mb-3 text-sm text-muted-foreground">{t("סמני את החומרים שיש לך בקליניקה או בבית, ונציג פעילויות יצירה - מהקרובה ביותר להכנה מיידית ועד הרחוקה יותר.", "Select the materials you have in the clinic or at home and we will show the closest creative activities.")}</p>
                    <div className="flex flex-wrap gap-2">
                      {CRAFT_SUPPLIES.map((s) => (
                        <button key={s.key} onClick={() => toggleCraftItem(s.key)} className={cn("rounded-full border px-3 py-1.5 text-sm", craftHave.has(s.key) ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{s.label}</button>
                      ))}
                    </div>
                  </div>
                  {searchedCraftResults.length ? (
                    <>
                      {cardSearch(activityTitles(searchedCraftResults.map((r) => r.activity)), "supplies")}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {searchedCraftResults.map(({ activity, missing }) => (
                          <div key={activity.id} className="relative" hidden={!nameVisible(activityTitle(activity, language))}>
                            {craftHave.size > 0 ? <span className={cn("absolute -top-2 right-3 z-10 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-sm", missing.length === 0 ? "bg-sage text-sage-foreground" : "bg-butter text-foreground/80")}>{missing.length === 0 ? t("יש לך הכל! ✓", "You have everything! ✓") : t(`חסר ${missing.length} פריטים`, `${missing.length} ${missing.length === 1 ? "item" : "items"} missing`)}</span> : null}
                            <ActivityCandidateCard activity={activity} addLabel={addLabel} boardMode={boardMode} onAdd={() => handleAdd(activity, "activity")} />
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted-foreground">{t("לא מצאנו פעילויות יצירה מתאימות כרגע.", "No suitable creative activities were found.")}</div>}
                </div>
              )}
            </div>
          ) : mainTab === "game-making" ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">{t("פעילויות שבהן מכינים משחק שאפשר להמשיך לשחק בו.", "Activities for making a game that can be played again.")}</p>
              {cardSearch(activityTitles(gameMakingResults), "game-making")}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 activity-card-grid-v92">{activityCards(gameMakingResults)}</div>
            </div>
          ) : mainTab === "sensory" ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">{sensoryResults.length}{" "}{t("פעילויות סנסוריות.", "sensory activities.")}</p>
              {cardSearch(activityTitles(sensoryResults), "sensory")}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 activity-card-grid-v92">{activityCards(sensoryResults)}</div>
            </div>
          ) : mainTab === "movement" ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">{movementResults.length}{" "}{t("פעילויות תנועה.", "movement activities.")}</p>
              {cardSearch(activityTitles(movementResults), "movement")}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 activity-card-grid-v92">{activityCards(movementResults)}</div>
            </div>
          ) : mainTab === "social" ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">{t("משחקי חצר וחברה קלאסיים -", "Classic outdoor and social games —")}{" "}{socialGamesResults.length}{" "}{t("משחקים.", "games.")}</p>
              {cardSearch(activityTitles(socialGamesResults), "social")}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 activity-card-grid-v92">{activityCards(socialGamesResults)}</div>
            </div>
          ) : mainTab === "experiments" ? (
            <div>
              <div className="mb-6 inline-flex flex-wrap rounded-full bg-muted p-1">
                <SmallTabBtn active={experimentsMode === "browse"} onClick={() => setExperimentsMode("browse")}>{t("כל הניסויים", "All experiments")}</SmallTabBtn>
                <SmallTabBtn active={experimentsMode === "pantry"} onClick={() => setExperimentsMode("pantry")}>{t("לפי מה שיש לי בבית", "By what I have at home")}</SmallTabBtn>
              </div>
              {experimentsMode === "browse" ? (
                <>
                  {cardSearch(EXPERIMENTS.map((e) => e.title), "experiments")}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 activity-card-grid-v92">
                    {EXPERIMENTS.map((item) => <ExperimentCandidateCard key={item.id} item={item} addLabel={addLabel} boardMode={boardMode} hidden={!nameVisible(item.title)} onAdd={() => handleAdd(item, "experiment")} />)}
                  </div>
                </>
              ) : (
                <div>
                  <div className="mb-6 space-y-3 rounded-3xl border border-border/60 bg-background p-5">
                    <p className="mb-1 text-sm text-muted-foreground">{t("סמני מה יש בקליניקה או בבית, ונבנה רשימת ניסויים אפשרית.", "Select what you have in the clinic or at home and we will create a list of possible experiments.")}</p>
                    {PANTRY_CATEGORIES.map((cat) => (
                      <div key={cat.key}>
                        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><span aria-hidden>{cat.emoji}</span>{cat.label}</div>
                        <div className="flex flex-wrap gap-2">
                          {cat.items.map((it) => (
                            <button key={it} onClick={() => togglePantryItem(it)} className={cn("rounded-full border px-3 py-1.5 text-sm", pantryHave.has(it) ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{it}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <h2 className="mb-3 font-display text-lg font-bold">{pantryHave.size > 0 ? t("מה אפשר להכין עם מה שיש לך", "What you can make with what you have") : t("כל הניסויים", "All experiments")}</h2>
                  {cardSearch(pantryResults.map((r) => r.e.title), "pantry")}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pantryResults.map(({ e, missing }) => (
                      <div key={e.id} className="relative" hidden={!nameVisible(e.title)}>
                        {pantryHave.size > 0 ? <span className={cn("absolute -top-2 right-3 z-10 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-sm", missing.length === 0 ? "bg-sage text-sage-foreground" : "bg-butter text-foreground/80")}>{missing.length === 0 ? t("יש לך הכל! ✓", "You have everything! ✓") : t(`חסר ${missing.length} פריטים`, `${missing.length} ${missing.length === 1 ? "item" : "items"} missing`)}</span> : null}
                        <ExperimentCandidateCard item={e} addLabel={addLabel} boardMode={boardMode} onAdd={() => handleAdd(e, "experiment")} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : mainTab === "recipes" ? (
            <div>
              <p className="mb-3 text-sm text-muted-foreground">{t("כל המתכונים בבנק, בלי סינון -", "All recipes in the library, without filtering —")}{" "}{RECIPES.length}{" "}{t("בסך הכל.", "in total.")}</p>
              {cardSearch(RECIPES.map((r) => r.title), "recipes")}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 activity-card-grid-v92">
                {RECIPES.map((item) => <RecipeCandidateCard key={item.id} item={item} addLabel={addLabel} boardMode={boardMode} hidden={!nameVisible(item.title)} onAdd={() => handleAdd(item, "recipe")} />)}
              </div>
            </div>
          ) : null}
        </div>

        {/* ---------- plan sidebar ---------- */}
        <aside data-treatment-plan-panel="" className="h-fit space-y-4 rounded-3xl border border-border/60 bg-card p-5 lg:sticky lg:top-6">
          <div>
            <h2 className="font-display text-lg font-bold">{t("תכנית הטיפול", "Session plan")}</h2>
            <p className="text-sm text-muted-foreground">{plan.length}{" "}{t("פריטים", "items")}{totalMinutes ? t(` · ${totalMinutes}+ דק' סה"כ`, ` · ${totalMinutes}+ min total`) : ""}</p>
          </div>
          <Link to={`/therapist/motor-trail?returnTo=plan${existingMotorTrail ? `&edit=${existingMotorTrail.uid}` : ""}`} className="flex items-center gap-2 rounded-2xl border border-dashed border-sage/50 bg-sage/5 px-3 py-2.5 text-foreground transition-colors hover:bg-sage/10">
            <Route className="h-4 w-4 shrink-0 text-sage-foreground" />
            <span className="flex-1 text-sm font-medium">{existingMotorTrail ? t("עריכת מסלול מוטורי", "Edit the Obstacle Course") : t("הוספת מסלול מוטורי", "Add an obstacle course")}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-sage-foreground" />
          </Link>
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-sage/50 bg-sage/5 px-3 py-2.5 text-foreground transition-colors hover:bg-sage/10">
            <Camera className="h-4 w-4 shrink-0 text-sage-foreground" />
            <span className="flex-1 text-sm font-medium">{t("צילום תמונה והוספה לתכנית", "Add a Photo to the Plan")}</span>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
          </label>
          {plan.length === 0 ? (
            <p className="rounded-2xl bg-muted/50 p-4 text-sm text-muted-foreground">{t("עדיין לא הוספת פעילויות. לחצי על \"הוסף לתכנית הטיפול\" כדי להתחיל.", "No activities have been added yet. Select Add to Session Plan to begin.")}</p>
          ) : (
            <ul className="space-y-2">
              {plan.map((item, i) => {
                const activity = item.kind === "activity" ? getActivity(item.id) : null;
                const recipe = item.kind === "recipe" ? getRecipe(item.id) : null;
                const experiment = item.kind === "experiment" ? getExperiment(item.id) : null;
                const hero = item.kind === "activity"
                  ? activityHero(item.id) || activity?.hero_image || (activity?.ai_generated ? "/icon-bank/crafts-new/seed-71-independent/material-pencil.webp" : null)
                  : item.kind === "photo" ? item.image
                    : item.kind === "recipe" ? recipe?.cover ?? null
                      : item.kind === "experiment" ? experimentHero(item.id)
                        : motorTrailItem(item.equipment?.[0], item)?.image;
                const key = item.kind === "activity" || item.kind === "recipe" || item.kind === "experiment" ? `${item.kind}-${item.id}` : item.uid;
                const linkTo = item.kind === "motor-trail" ? `/therapist/motor-trail?returnTo=plan&edit=${item.uid}` : item.kind === "recipe" ? `/therapist/recipes?r=${item.id}` : item.kind === "experiment" ? `/therapist/experiments?e=${item.id}` : null;
                const inner = (
                  <>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage/30 text-xs font-bold text-sage-foreground">{i + 1}</span>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      {hero ? <img src={hero} alt="" className={`h-full w-full ${item.kind === "photo" ? "object-cover" : "object-contain p-0.5"}`} />
                        : item.kind === "motor-trail" ? <Route className="h-5 w-5 text-muted-foreground" />
                          : item.kind === "recipe" ? (recipe?.coverIcon ? <recipe.coverIcon /> : <span className="text-xl">{recipe?.coverEmoji ?? "🍳"}</span>)
                            : item.kind === "experiment" ? <FlaskConical className="h-5 w-5 text-muted-foreground" />
                              : <span className="text-xl">{activity ? activityEmoji(activity) : "✨"}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium leading-snug">
                        {item.kind === "activity" ? activityTitle(activity, language) ?? t("פעילות", "Activity") : item.kind === "photo" ? boardItemLabel(item, language) || t("תמונה", "Photo") : item.kind === "recipe" ? recipe?.title ?? t("מתכון", "Recipe") : item.kind === "experiment" ? experiment?.title ?? t("ניסוי", "Experiment") : t("מסלול מוטורי", "Obstacle Course")}
                      </span>
                      {item.kind === "motor-trail" && item.equipment?.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.equipment.map((eid) => {
                            const it = motorTrailItem(eid, item);
                            return it ? <span key={eid} title={it.label} className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background"><img src={it.image} alt="" className="h-full w-full object-contain" /></span> : null;
                          })}
                        </div>
                      )}
                    </div>
                  </>
                );
                return (
                  <li key={key} className="flex items-center gap-2 rounded-2xl border border-border/60 bg-background p-2">
                    {linkTo ? <Link to={linkTo} className="flex flex-1 items-center gap-2 hover:opacity-80">{inner}</Link> : <div className="flex flex-1 items-center gap-2">{inner}</div>}
                    <div className="flex shrink-0 items-center">
                      <button type="button" onClick={() => moveItem(i, -1)} disabled={i === 0} aria-label={t("הזז למעלה", "Move up")} className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30"><ChevronUp className="h-3.5 w-3.5" /></button>
                      <button type="button" onClick={() => moveItem(i, 1)} disabled={i === plan.length - 1} aria-label={t("הזז למטה", "Move down")} className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30"><ChevronDown className="h-3.5 w-3.5" /></button>
                      <button type="button" onClick={() => removeFromPlan(item)} aria-label={t("הסר מהתוכנית", "Remove from Plan")} className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-4 w-4" /></button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="space-y-2 border-t border-border/60 pt-4">
            <Button onClick={startSession} disabled={!plan.length} className="w-full rounded-full bg-sage text-sage-foreground">
              <Play className="h-4 w-4" /> {boardMode ? t("הוסף למפגש", "Add to session") : sessionId ? t("התחל טיפול", "Start Session") : t("התחל מפגש", "Start Session")}
            </Button>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("שם התוכנית", "Name Your Plan")} />
            <Button onClick={handleSave} disabled={saving || !plan.length} variant="outline" className="w-full rounded-full">
              <Save className="h-4 w-4" /> {editingPlanId ? t("עדכון תכנית", "Update plan") : t("שמור תכנית", "Save Plan")}
            </Button>
            <Button variant="outline" onClick={() => window.print()} disabled={!plan.length} className="w-full rounded-full">
              <Printer className="h-4 w-4" />{" "}{t("הדפס", "Print")}
            </Button>
            <Link to="/therapist/plans" className="block">
              <Button variant="outline" className="w-full rounded-full"><FolderOpen className="h-4 w-4" />{" "}{t("התוכניות השמורות שלי", "Saved Plans")}</Button>
            </Link>
            <Button variant="ghost" onClick={handleResetPlan} disabled={!plan.length} className="w-full rounded-full text-muted-foreground">
              <RotateCcw className="h-4 w-4" />{" "}{t("איפוס תוכנית הטיפול", "Reset session plan")}
            </Button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

// Sign and game items keep their saved label, but are shown in the board language.
function boardItemLabel(item, language) {
  const sign = item.visualSign ? findSign(item.visualSign) : null;
  if (sign) return localizedLabel(sign, language);
  const game = item.boardGame ? findBoardGame(item.boardGame) : null;
  if (game) return localizedLabel(game, language);
  return item.label;
}

// ---------- Session board (the treatment board shown during the session) ----------
function SessionBoard({ plan, setPlan, language, t, sessionId, linkedPatient, patientBoardId, patientBoardInDraft, boardDate, hasDateParam, searchParams, onToggleCompleted, onFinishSession }) {
  const navigate = useNavigate();
  const boardRef = useRef(null);
  const photoInputRef = useRef(null);
  const [timerOpen, setTimerOpen] = useState(false);
  const [choiceMode, setChoiceMode] = useState(null); // "choice" | "firstThen" | null
  const [shareOpen, setShareOpen] = useState(false);
  const [myImagesOpen, setMyImagesOpen] = useState(false);
  const [myImages, setMyImages] = useState([]);
  useEffect(() => {
    if (!hasCloudSession()) return undefined;
    let cancelled = false;
    listMyImages().then((rows) => { if (!cancelled) setMyImages(rows); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const [fullscreen, setFullscreen] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [penEnabled, setPenEnabled] = useState(false);
  const [penTool, setPenTool] = useState("pen");
  const [penColor, setPenColor] = useState("#5a67a8");
  const [penWidth, setPenWidth] = useState(4);
  const [drawingStatus, setDrawingStatus] = useState("");
  const [strokes, setStrokes] = useState(() => {
    if (!patientBoardId) return getGuestBoardDrawing(boardDate);
    return patientBoardInDraft ? readJson(patientDrawingKey(patientBoardId, boardDate), []) : [];
  });
  const [cloudReady, setCloudReady] = useState(Boolean(patientBoardId && patientBoardInDraft));
  const [cloudStatus, setCloudStatus] = useState("saved");
  const [patientName, setPatientName] = useState(() => (patientBoardInDraft ? readActivePatient()?.name : ""));
  const [savedDates, setSavedDates] = useState(() => (patientBoardId ? [] : guestBoardDates(boardDate)));
  const saveTimer = useRef(0);
  const firstCloudSave = useRef(!patientBoardInDraft);

  useEffect(() => {
    document.body.classList.add("meeting-board-page");
    return () => document.body.classList.remove("meeting-board-page", "meeting-board-fullscreen");
  }, []);

  // Client board: load it from the cloud (unless it was already loaded before going to the search page).
  useEffect(() => {
    if (!patientBoardId) return undefined;
    let cancelled = false;
    listPatientBoardDates(patientBoardId).then((dates) => { if (!cancelled) setSavedDates(dates); }).catch(() => {});
    if (patientBoardInDraft) return () => { cancelled = true; };
    if (!hasCloudSession()) { setCloudStatus("error"); return () => { cancelled = true; }; }
    if (!readActivePatient()) localStorage.setItem(GUEST_BACKUP_KEY, JSON.stringify(getDraftPlan()));
    loadPatientBoard(patientBoardId, boardDate)
      .then((board) => {
        if (cancelled) return;
        localStorage.setItem(ACTIVE_PATIENT_KEY, JSON.stringify(board.patient));
        localStorage.setItem(patientDrawingKey(patientBoardId, boardDate), JSON.stringify(board.drawingData));
        setPatientName(board.patient.name);
        setStrokes(board.drawingData);
        setPlan(board.items);
        setCloudReady(true);
        const next = new URLSearchParams(window.location.search);
        next.set("cloudBoardReady", "1");
        navigate(`${window.location.pathname}?${next.toString()}`, { replace: true });
      })
      .catch(() => { if (!cancelled) setCloudStatus("error"); });
    return () => { cancelled = true; };
  }, []);

  // Save every change: guest boards in this browser, client boards in the cloud.
  useEffect(() => {
    if (!patientBoardId) {
      saveGuestBoard(boardDate, plan);
      return undefined;
    }
    if (!cloudReady) return undefined;
    if (firstCloudSave.current) { firstCloudSave.current = false; return undefined; }
    setCloudStatus("saving");
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      savePatientBoard(patientBoardId, boardDate, plan).then(() => setCloudStatus("saved")).catch(() => setCloudStatus("error"));
    }, 100);
    return () => window.clearTimeout(saveTimer.current);
  }, [plan, cloudReady]);

  function updateStrokes(next) {
    setStrokes(next);
    if (!patientBoardId) {
      saveGuestBoardDrawing(boardDate, next);
      setDrawingStatus(t("נשמר", "Saved"));
      return;
    }
    localStorage.setItem(patientDrawingKey(patientBoardId, boardDate), JSON.stringify(next));
    if (!cloudReady) return;
    setDrawingStatus(t("שומרת…", "Saving…"));
    savePatientBoard(patientBoardId, boardDate, plan, next)
      .then(() => setDrawingStatus(t("נשמר בענן", "Saved to cloud")))
      .catch(() => setDrawingStatus(t("השמירה נכשלה", "Save failed")));
  }
  function clearDrawing() {
    if (!strokes.length || !window.confirm(t("למחוק את כל הכתיבה מהלוח?", "Clear all drawing from the board?"))) return;
    updateStrokes([]);
  }

  // ---- dates ----
  const boardQuery = (date, extra = {}) => {
    const next = new URLSearchParams({ view: "session", boardDate: date });
    if (patientBoardId) next.set("patientBoard", patientBoardId);
    Object.entries(extra).forEach(([key, value]) => next.set(key, value));
    return `/therapist/build?${next.toString()}`;
  };
  function goToDate(date) {
    if (!DATE_PATTERN.test(date || "") || date === boardDate) return;
    if (!patientBoardId) saveGuestBoard(boardDate, plan);
    navigate(boardQuery(date));
    window.scrollTo(0, 0);
  }
  async function copyToNextWeek(nextDate) {
    if (patientBoardId) {
      if (!hasCloudSession()) throw new Error("signed-out");
      await savePatientBoard(patientBoardId, nextDate, plan, strokes);
    } else {
      saveGuestBoard(nextDate, plan);
    }
    goToDate(nextDate);
  }

  // ---- links ----
  const dateSuffix = hasDateParam ? `&boardDate=${encodeURIComponent(boardDate)}` : "";
  const patientSuffix = patientBoardId ? `&patientBoard=${encodeURIComponent(patientBoardId)}${dateSuffix}${cloudReady ? "&cloudBoardReady=1" : ""}` : dateSuffix;
  const returnPath = `/therapist/build?view=session${sessionId ? `&session=${sessionId}` : ""}${linkedPatient?.id ? `&patient=${linkedPatient.id}` : ""}${patientSuffix}`;
  const planningReturnUrl = (() => {
    const next = new URLSearchParams(searchParams);
    next.set("view", "session");
    next.set("planning", "1");
    ["patientBoard", "cloudBoardReady", "guest"].forEach((key) => next.delete(key));
    return `/therapist/build?${next.toString()}`;
  })();

  // ---- items ----
  function moveItem(itemIndex, direction) {
    const target = itemIndex + direction;
    if (target < 0 || target >= plan.length) return;
    const next = [...plan];
    const [item] = next.splice(itemIndex, 1);
    next.splice(target, 0, item);
    setPlan(next);
  }
  function removeItem(itemIndex) {
    setPlan(plan.filter((_, i) => i !== itemIndex));
  }
  async function addSign(sign) {
    try {
      const image = await renderSignCard(sign, language);
      setPlan((prev) => [...prev, { kind: "photo", uid: `sign-${sign.id}-${Date.now()}`, image, label: localizedLabel(sign, language), visualSign: sign.id }]);
    } catch { /* image failed to load */ }
  }
  function addGame(game) {
    setPlan((prev) => [...prev, { kind: "photo", uid: `game-${game.id}-${Date.now()}`, image: game.asset, label: localizedLabel(game, language), boardGame: game.id }]);
  }
  async function photoChosen(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try { setPhotoPreview(await readPhotoFile(file, 900, 0.82)); } catch { /* unreadable image */ }
  }
  function confirmPhoto() {
    setPlan((prev) => [...prev, { kind: "photo", uid: `photo-${Date.now()}`, image: photoPreview, label: t("תמונה", "Photo") }]);
    setPhotoPreview(null);
  }

  // Signs are saved as an image with the word in it; show them in the current language.
  const [signImages, setSignImages] = useState({});
  useEffect(() => {
    let cancelled = false;
    plan.forEach((item) => {
      const sign = item.visualSign ? findSign(item.visualSign) : null;
      if (!sign) return;
      renderSignCard(sign, language).then((image) => { if (!cancelled) setSignImages((all) => (all[sign.id] === image ? all : { ...all, [sign.id]: image })); }).catch(() => {});
    });
    return () => { cancelled = true; };
  }, [plan, language]);

  // ---- full screen ----
  function setFullscreenState(active) {
    setFullscreen(active);
    document.body.classList.toggle("meeting-board-fullscreen", active);
  }
  function toggleFullscreen() {
    const active = !fullscreen;
    setFullscreenState(active);
    if (active && boardRef.current?.requestFullscreen) boardRef.current.requestFullscreen().catch(() => {});
    if (!active && document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }
  function exitFullscreen() {
    setFullscreenState(false);
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }
  useEffect(() => {
    const onChange = () => { if (!document.fullscreenElement) setFullscreenState(false); };
    const onKey = (event) => { if (event.key === "Escape" && document.body.classList.contains("meeting-board-fullscreen")) exitFullscreen(); };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("fullscreenchange", onChange); document.removeEventListener("keydown", onKey); };
  }, []);

  const pen = { enabled: penEnabled, setEnabled: setPenEnabled, tool: penTool, setTool: setPenTool, color: penColor, setColor: setPenColor, width: penWidth, setWidth: setPenWidth, status: drawingStatus, onClear: clearDrawing };
  function openTimer() {
    setPenEnabled(false);
    setTimerOpen(true);
  }

  // Title and picture of a board item (also used by the choice and first-then boards).
  function boardItemView(item) {
    const activity = item.kind === "activity" ? getActivity(item.id) : null;
    const recipe = item.kind === "recipe" ? getRecipe(item.id) : null;
    const experiment = item.kind === "experiment" ? getExperiment(item.id) : null;
    const sign = item.visualSign ? findSign(item.visualSign) : null;
    const hero = item.kind === "activity"
      ? activityHero(item.id) || activity?.hero_image || (activity?.ai_generated ? "/icon-bank/crafts-new/seed-71-independent/material-pencil.webp" : null)
      : item.kind === "photo" ? (sign && signImages[sign.id]) || item.image
        : item.kind === "recipe" ? recipe?.cover ?? null
          : item.kind === "experiment" ? experimentHero(item.id)
            : MOTOR_TRAIL_HERO;
    const title = item.kind === "activity" ? activityTitle(activity, language) ?? t("פעילות", "Activity")
      : item.kind === "photo" ? boardItemLabel(item, language) || t("תמונה", "Photo")
        : item.kind === "recipe" ? recipe?.title ?? t("מתכון", "Recipe")
          : item.kind === "experiment" ? experiment?.title ?? t("ניסוי", "Experiment")
            : t("מסלול מוטורי", "Obstacle Course");
    return { activity, recipe, experiment, sign, hero, title };
  }

  // Options for the choice and first-then boards: what is on the board, then the built-in games.
  const pickerOptions = [
    ...plan.map((item) => {
      const view = boardItemView(item);
      return { key: `board:${boardItemKey(item)}`, title: view.title, image: view.hero, item };
    }),
    ...BOARD_GAMES.filter((game) => !plan.some((item) => item.boardGame === game.id))
      .map((game) => ({ key: `game:${game.id}`, title: localizedLabel(game, language), image: game.asset, game })),
    ...myImages.filter((image) => image.url && !plan.some((item) => item.myImage === image.id)).map((image) => ({ key: `mine:${image.id}`, title: image.name, image: image.url, mine: image })),
  ];
  // A photo from "my images" goes on the board as a copy, so it keeps showing after its address expires.
  async function myImageItem(image) {
    return { kind: "photo", uid: `mine-${image.id}-${Date.now()}`, image: image.url?.startsWith("data:") ? image.url : await imageAsDataUrl(image.url), label: image.name, myImage: image.id };
  }
  async function addMyImage(image) {
    try {
      const item = await myImageItem(image);
      setPlan((prev) => [...prev, item]);
      setMyImagesOpen(false);
      toast.success(t("התמונה נוספה ללוח", "The image was added to the board"));
    } catch {
      toast.error(t("לא הצלחנו להוסיף את התמונה. נסי שוב.", "We could not add the image. Please try again."));
    }
  }
  // Put the chosen option right after the activities already done, so it is the next one.
  async function makeNext(option) {
    let mineItem = null;
    if (option.mine) {
      try { mineItem = await myImageItem(option.mine); } catch { return; }
    }
    setPlan((prev) => {
      const rest = option.item ? prev.filter((item) => boardItemKey(item) !== boardItemKey(option.item)) : prev;
      const entry = option.item || mineItem || { kind: "photo", uid: `game-${option.game.id}-${Date.now()}`, image: option.game.asset, label: localizedLabel(option.game, language), boardGame: option.game.id };
      let at = 0;
      rest.forEach((item, index) => { if (item.completed) at = index + 1; });
      return [...rest.slice(0, at), entry, ...rest.slice(at)];
    });
  }

  const heading = linkedPatient ? t(`הטיפול של ${linkedPatient.name}`, `${linkedPatient.name}'s session`) : t("לוח המפגש", "Session board");

  return (
    <AppShell mode="therapist" fullScreen={false}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black">{heading}</h1>
          <p className="mt-1 text-muted-foreground">{t("בחרי פעילות כדי להתחיל בה. אפשר לחזור ללוח בכל רגע.", "Choose an activity to begin. You can return to the board at any time.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sessionId && <Button onClick={onFinishSession} className="rounded-full bg-foreground text-background"><Save className="h-4 w-4" /> {t("סיום טיפול", "Finish session")}</Button>}
        </div>
      </div>

      <BoardDateNavigation date={boardDate} savedDates={savedDates} language={language} onNavigate={goToDate} onCopyToNextWeek={copyToNextWeek} />
      <BoardDayAppointments boardDate={boardDate} patientBoardId={patientBoardId} language={language}
        onOpen={(id) => { if (id !== patientBoardId) navigate(`/therapist/build?view=session&patientBoard=${encodeURIComponent(id)}&boardDate=${boardDate}`); }} />

      <BoardToolbar
        language={language}
        patientBoardId={patientBoardId}
        patientName={patientName}
        cloudStatus={cloudStatus}
        planningReturnUrl={planningReturnUrl}
        openPlanningOnMount={searchParams.get("planning") === "1"}
        onSelectPatient={(id) => navigate(`/therapist/build?view=session&patientBoard=${encodeURIComponent(id)}${dateSuffix}`)}
        onUseGuestBoard={() => navigate("/therapist/build?view=session&guest=1")}
        addActivityHref={`/therapist/build?tab=search&boardMode=1${patientSuffix}`}
        motorTrailHref={`/therapist/motor-trail?returnTo=session${patientSuffix}`}
        pen={pen}
        onAddSign={addSign}
        onAddGame={addGame}
        onOpenTimer={openTimer}
        onOpenChoice={() => { setPenEnabled(false); setChoiceMode("choice"); }}
        onOpenFirstThen={() => { setPenEnabled(false); setChoiceMode("firstThen"); }}
        onShareWithParents={() => { setPenEnabled(false); setShareOpen(true); }}
        onOpenMyImages={() => { setPenEnabled(false); setMyImagesOpen(true); }}
        onPickPhoto={() => photoInputRef.current?.click()}
        fullscreen={fullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      <ol ref={boardRef} className="space-y-3 meeting-board-surface">
        {plan.map((item, i) => {
          const { activity, recipe, experiment, sign, hero, title: itemTitle } = boardItemView(item);
          const linkTo = item.kind === "activity"
            ? `/activity/${item.id}?mode=therapist&returnTo=session&returnPath=${encodeURIComponent(returnPath)}`
            : item.kind === "motor-trail" ? `/therapist/motor-trail?returnTo=session&edit=${item.uid}${patientSuffix}`
              : item.kind === "recipe" ? `/therapist/recipes?r=${item.id}`
                : item.kind === "experiment" ? `/therapist/experiments?e=${item.id}`
                  : null;
          const inner = (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage/30 text-sm font-bold">{i + 1}</span>
              <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white p-2">
                {hero ? <img src={hero} alt={sign ? itemTitle : ""} className={`max-h-full max-w-full drop-shadow-md ${item.kind === "photo" ? "h-full w-full object-cover" : "object-contain"}`} />
                  : item.kind === "motor-trail" ? <Route className="h-8 w-8 text-muted-foreground" />
                    : item.kind === "recipe" ? (recipe?.coverIcon ? <recipe.coverIcon /> : <span className="text-4xl">{recipe?.coverEmoji ?? "🍳"}</span>)
                      : item.kind === "experiment" ? <FlaskConical className="h-8 w-8 text-muted-foreground" />
                        : <span className="text-4xl">{activity ? activityEmoji(activity) : "✨"}</span>}
              </div>
              <div className="flex-1">
                <h3 className="font-display text-base font-bold leading-snug">{itemTitle}</h3>
                {item.kind === "motor-trail" && <p className="mt-1 truncate text-xs text-muted-foreground">{(item.equipment || []).map((eid) => motorTrailItem(eid, item)?.label).filter(Boolean).join(" · ")}</p>}
              </div>
            </>
          );
          return (
            <li
              key={boardItemKey(item)}
              className={cn("group relative overflow-hidden rounded-3xl border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md", item.completed ? "border-[#b7d8bd] bg-[#edf7ee]" : "border-border/60 bg-card", sign && "visual-sign-board-item")}
            >
              <div className="flex items-center gap-3 p-3">
                <button
                  type="button"
                  aria-pressed={Boolean(item.completed)}
                  aria-label={item.completed ? t(`ביטול סימון ${itemTitle} כפעילות שבוצעה`, `Mark ${itemTitle} as not completed`) : t(`סימון ${itemTitle} כפעילות שבוצעה`, `Mark ${itemTitle} as completed`)}
                  title={item.completed ? t("סומן כבוצע", "Completed") : t("סימון כבוצע", "Mark as completed")}
                  onClick={() => onToggleCompleted(i)}
                  className={cn("z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border-2 bg-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage", item.completed ? "border-[#7fb58a] bg-[#a9cfaa] text-[#234f35]" : "border-border text-transparent hover:border-[#9bc4a3] hover:bg-[#f3faf4]")}
                >
                  <Check className="h-5 w-5" strokeWidth={3} />
                </button>
                {linkTo ? <Link to={linkTo} className="flex min-w-0 flex-1 items-center gap-4">{inner}</Link> : <div className="flex min-w-0 flex-1 items-center gap-4">{inner}</div>}
                <div className="meeting-item-controls" data-meeting-item-controls="true" aria-label={t("שינוי סדר הפעילות", "Change activity order")}>
                  <button type="button" className="meeting-move-item" data-move-direction="-1" disabled={i === 0} aria-label={t("העלאת הפעילות למעלה", "Move activity up")} title={t("העלאה למעלה", "Move up")} onClick={() => moveItem(i, -1)}>↑</button>
                  <button type="button" className="meeting-move-item" data-move-direction="1" disabled={i === plan.length - 1} aria-label={t("הורדת הפעילות למטה", "Move activity down")} title={t("הורדה למטה", "Move down")} onClick={() => moveItem(i, 1)}>↓</button>
                  <button type="button" className="meeting-delete-item" aria-label={t("מחיקת הפעילות מלוח המפגש", "Remove activity from the session board")} title={t("מחיקה מהלוח", "Remove from board")} onClick={() => removeItem(i)}>×</button>
                </div>
              </div>
            </li>
          );
        })}
        <button type="button" className="meeting-fullscreen-exit" data-exit-board-fullscreen="true" aria-label={t("יציאה ממסך מלא", "Exit full screen")} title={t("יציאה ממסך מלא", "Exit full screen")} onClick={exitFullscreen}>×</button>
        {/* Inside the board so the timer and the toolbox stay visible in full screen. */}
        <div className="meeting-board-overlay">
          <VisualSessionTimer language={language} open={timerOpen} onOpenChange={setTimerOpen} hideTrigger />
          {fullscreen && <BoardToolbox language={language} pen={pen} onOpenTimer={openTimer} onAddSign={addSign} onOpenChoice={setChoiceMode} onOpenMyImages={() => setMyImagesOpen(true)} />}
          {myImagesOpen && <MyImagesDialog language={language} returnUrl={`${window.location.pathname}${window.location.search}`} onAdd={addMyImage} onChanged={setMyImages} onClose={() => setMyImagesOpen(false)} />}
          {shareOpen && <HomePracticeShare language={language} onClose={() => setShareOpen(false)}
            activities={plan.filter((item) => item.kind === "activity" && getActivity(item.id)).map((item) => ({ id: item.id, title: boardItemView(item).title, image: boardItemView(item).hero }))} />}
          {choiceMode && <ChoiceBoard key={choiceMode} mode={choiceMode} language={language} options={pickerOptions} onStart={makeNext} onClose={() => setChoiceMode(null)} />}
        </div>
        <BoardCanvas boardRef={boardRef} strokes={strokes} onStrokesChange={updateStrokes} enabled={penEnabled} tool={penTool} color={penColor} width={penWidth} language={language} />
      </ol>

      <input ref={photoInputRef} type="file" accept="image/*" capture="environment" hidden data-board-photo-input="true" onChange={photoChosen} />
      {photoPreview && (
        <BoardPhotoPreview
          image={photoPreview}
          language={language}
          onConfirm={confirmPhoto}
          onRepick={() => { setPhotoPreview(null); photoInputRef.current?.click(); }}
          onCancel={() => setPhotoPreview(null)}
        />
      )}
    </AppShell>
  );
}

// ---------- cards on the search page ----------
function SuggestedActivityCard({ activity, language, t, addLabel, boardMode, hidden, onAdd }) {
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm", boardMode && "meeting-search-activity-card")} hidden={hidden}>
      <div className="flex h-40 items-center justify-center bg-white">
        {activityHero(activity.id) || activity.hero_image ? (
          <div className="flex h-28 w-28 items-center justify-center"><img src={activityHero(activity.id) || activity.hero_image} alt="" className="max-h-full max-w-full object-contain" /></div>
        ) : activity.ai_generated ? <img src="/icon-bank/crafts-new/seed-71-independent/material-pencil.webp" alt="" className="h-24 w-24 object-contain" /> : <span className="text-6xl">{activityEmoji(activity)}</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-snug">{activityTitle(activity, language)}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {activity.duration_min}+ {t("דק'", "min")}</span>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Button onClick={onAdd} size="sm" className="rounded-full bg-sage text-sage-foreground"><Plus className="h-3.5 w-3.5" /> {addLabel}</Button>
          <Link to={`/activity/${activity.id}`} className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"><ExternalLink className="h-3 w-3" />{" "}{t("צפייה מלאה", "View Details")}</Link>
        </div>
      </div>
    </div>
  );
}

function ActivityCandidateCard({ activity, addLabel, boardMode, hidden, onAdd }) {
  const { language, t } = useTranslator();
  const location = useLocation();
  const query = new URLSearchParams({ mode: "therapist", returnPath: `${location.pathname}${location.search}`, returnLabel: t("חזרה לבניית הטיפול", "Back to Session Planner") });
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm", boardMode && "meeting-search-activity-card")} hidden={hidden}>
      <div className="flex h-40 items-center justify-center bg-white">
        {activityHero(activity.id) || activity.hero_image ? (
          <div className="flex h-28 w-28 items-center justify-center"><img src={activityHero(activity.id) || activity.hero_image} alt="" className="max-h-full max-w-full object-contain" /></div>
        ) : activity.ai_generated ? <img src="/icon-bank/crafts-new/seed-71-independent/material-pencil.webp" alt="" className="h-24 w-24 object-contain" /> : <span className="text-6xl">{activityEmoji(activity)}</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-snug">{activityTitle(activity, language)}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {activity.duration_min}+ {t("דק'", "min")}</span>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Button onClick={onAdd} size="sm" className="rounded-full bg-sage text-sage-foreground"><Plus className="h-3.5 w-3.5" /> {addLabel}</Button>
          <Link to={`/activity/${activity.id}?${query.toString()}`} className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"><ExternalLink className="h-3 w-3" /> {t("צפייה מלאה", "View details")}</Link>
        </div>
      </div>
    </div>
  );
}

function ExperimentCandidateCard({ item, addLabel, boardMode, hidden, onAdd }) {
  const { t } = useTranslator();
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm", boardMode && "meeting-search-activity-card")} hidden={hidden}>
      <div className="flex h-40 items-center justify-center bg-white p-3"><img src={experimentHero(item.id)} alt="" className="max-h-full max-w-full object-contain" /></div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-snug">{item.title}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {item.time}</span>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Button onClick={onAdd} size="sm" className="rounded-full bg-sage text-sage-foreground"><Plus className="h-3.5 w-3.5" /> {addLabel}</Button>
          <Link to={`/therapist/experiments?e=${item.id}`} className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"><ExternalLink className="h-3 w-3" />{" "}{t("צפייה מלאה", "View Details")}</Link>
        </div>
      </div>
    </div>
  );
}

function RecipeCandidateCard({ item, addLabel, boardMode, hidden, onAdd }) {
  const { t } = useTranslator();
  return (
    <div className={cn("flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm", boardMode && "meeting-search-activity-card")} hidden={hidden}>
      <div className="flex h-40 items-center justify-center bg-white">
        {item.cover ? <div className="flex h-28 w-28 items-center justify-center"><img src={item.cover} alt="" className="max-h-full max-w-full object-contain" /></div>
          : item.coverIcon ? <div className="h-20 w-20"><item.coverIcon /></div> : <span className="text-6xl">{item.coverEmoji ?? "🍳"}</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-snug">{item.title}</h3>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {item.duration}</span>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2">
          <Button onClick={onAdd} size="sm" className="rounded-full bg-sage text-sage-foreground"><Plus className="h-3.5 w-3.5" /> {addLabel}</Button>
          <Link to={`/therapist/recipes?r=${item.id}`} className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground"><ExternalLink className="h-3 w-3" />{" "}{t("צפייה מלאה", "View Details")}</Link>
        </div>
      </div>
    </div>
  );
}

function SideTabBtn({ active, children, onClick }) {
  return <button onClick={onClick} className={cn("mobile-search-category-tab shrink-0 whitespace-nowrap rounded-2xl border px-4 py-3 text-sm font-bold text-right transition-colors lg:whitespace-normal", active ? "border-primary bg-sage/20 text-foreground" : "border-border/60 bg-card text-muted-foreground hover:bg-muted")}>{children}</button>;
}

function SmallTabBtn({ active, children, onClick }) {
  return <button onClick={onClick} className={cn("rounded-full px-4 py-2 text-sm font-bold transition-colors", active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground")}>{children}</button>;
}
