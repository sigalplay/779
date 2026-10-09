import { Component, lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MotionGlobalConfig } from "framer-motion";
import { useImageSeo } from "@/lib/image-seo";
import { SeoManager } from "@/components/SeoManager";
import { ScrollToTop } from "@/components/ScrollToTop";
import Landing from "@/pages/Landing";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import { getLanguage, routerBasename } from "@/lib/language";



// After a new version of the site is published, a tab that was opened earlier still asks for the old
// page files, which no longer exist. Reload once to get the new version. The retry is remembered with a
// time, so it can happen again after a later update, but never twice in a row (no reload loop).
const CHUNK_RETRY_KEY = "boo_chunk_retry";
function reloadForNewVersion() {
  let lastRetry = 0;
  try { lastRetry = Number(sessionStorage.getItem(CHUNK_RETRY_KEY)) || 0; } catch { /* storage may be blocked */ }
  if (Date.now() - lastRetry < 30000) return false;
  try { sessionStorage.setItem(CHUNK_RETRY_KEY, String(Date.now())); } catch { /* storage may be blocked */ }
  const url = new URL(window.location.href);
  url.searchParams.set("refresh", Date.now().toString());
  window.location.replace(url.toString());
  return true;
}
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => { if (reloadForNewVersion()) event.preventDefault(); });
}

function lazyRoute(importer) {
  return lazy(() => Promise.race([
    importer(),
    // A slow phone connection is not a missing file: wait long enough before giving up.
    new Promise((_, reject) => window.setTimeout(() => reject(new Error("Page loading timed out")), 30000)),
  ]).catch((error) => {
    if (reloadForNewVersion()) return new Promise(() => {});
    throw error;
  }));
}

const ParentPlay = lazyRoute(() => import("@/pages/ParentPlay"));
const TherapistBuild = lazyRoute(() => import("@/pages/TherapistBuild"));
const TherapistRecipes = lazyRoute(() => import("@/pages/TherapistRecipes"));
const TherapistExperiments = lazyRoute(() => import("@/pages/TherapistExperiments"));
const CipherGenerator = lazyRoute(() => import("@/pages/CipherGenerator"));
const MorningRoutine = lazyRoute(() => import("@/pages/MorningRoutine"));
const ChildMorningRoutine = lazyRoute(() => import("@/pages/ChildMorningRoutine"));
const EveningRoutine = lazyRoute(() => import("@/pages/EveningRoutine"));
const ChildEveningRoutine = lazyRoute(() => import("@/pages/ChildEveningRoutine"));
const WeeklyBoard = lazyRoute(() => import("@/pages/WeeklyBoard"));
const SharedWeeklyBoard = lazyRoute(() => import("@/pages/SharedWeeklyBoard"));
const MotorTrail = lazyRoute(() => import("@/pages/MotorTrail"));
const TherapistPlans = lazyRoute(() => import("@/pages/TherapistPlans"));
const BoardGames = lazyRoute(() => import("@/pages/BoardGames"));
const BoardGameDetail = lazyRoute(() => import("@/pages/BoardGameDetail"));
const SocialStories = lazyRoute(() => import("@/pages/SocialStories"));
const ActivityGenerator = lazyRoute(() => import("@/pages/ActivityGenerator"));
const CommunityActivities = lazyRoute(() => import("@/pages/CommunityActivities"));
const AllActivities = lazyRoute(() => import("@/pages/AllActivities"));
const ActivityDetail = lazyRoute(() => import("@/pages/ActivityDetail"));
const Favorites = lazyRoute(() => import("@/pages/Favorites"));
const Profile = lazyRoute(() => import("@/pages/Profile"));
const Auth = lazyRoute(() => import("@/pages/Auth"));
const CmsAdmin = lazyRoute(() => import("@/pages/CmsAdmin"));
const About = lazyRoute(() => import("@/pages/About"));
const BlogIndex = lazyRoute(() => import("@/pages/Blog").then((module) => ({ default: module.BlogIndex })));
const BlogPost = lazyRoute(() => import("@/pages/Blog").then((module) => ({ default: module.BlogPost })));
const SharedHomePractice = lazyRoute(() => import("@/pages/SharedHomePractice"));
const TherapistDiary = lazyRoute(() => import("@/pages/TherapistDiary"));
const HebrewCalendarGenerator = lazyRoute(() => import("@/pages/HebrewCalendarGenerator"));
const SharedHebrewCalendar = lazyRoute(() => import("@/pages/SharedHebrewCalendar"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const DeferredReportErrorButton = lazy(() => import("@/components/ReportErrorButton").then((module) => ({ default: module.ReportErrorButton })));
const DeferredToaster = lazy(() => import("sonner").then((module) => ({ default: module.Toaster })));

function PageLoader() {
  const english = getLanguage() === "en";
  const [slow, setSlow] = useState(false);
  // On the first load of a page saved by the build, keep showing the saved page instead of "loading".
  const [savedPage] = useState(() => window.__prerenderedPage || null);
  useEffect(() => {
    const id = window.setTimeout(() => setSlow(true), 6000);
    return () => {
      window.clearTimeout(id);
      if (savedPage) {
        window.__prerenderedPage = null;
        window.setTimeout(() => { MotionGlobalConfig.skipAnimations = false; }, 300);
      }
    };
  }, [savedPage]);
  if (savedPage) return <div style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: savedPage }} />;
  return <div className="flex min-h-screen items-center justify-center bg-background"><div className="text-center"><div className="rounded-full bg-card px-5 py-3 text-sm font-bold text-muted-foreground shadow-sm">{english ? "Loading…" : "טוענת…"}</div>{slow && <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-full border border-border bg-white px-4 py-2 text-sm font-bold">{english ? "Loading is taking longer — refresh" : "הטעינה מתעכבת — רענון"}</button>}</div></div>;
}

class RouteErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    const english = getLanguage() === "en";
    return <div className="flex min-h-screen items-center justify-center bg-background px-6"><div className="max-w-md rounded-3xl bg-card p-6 text-center shadow-soft"><h1 className="text-xl font-black">{english ? "The page did not load" : "העמוד לא נטען"}</h1><p className="mt-2 text-sm text-muted-foreground">{english ? "Your browser may still have an older file. Refresh to load the latest version." : "כנראה נשאר בדפדפן קובץ ישן. רענון יטען את הגרסה המעודכנת."}</p><button type="button" onClick={() => { try { sessionStorage.removeItem(CHUNK_RETRY_KEY); } catch { /* storage may be blocked */ } const url = new URL(window.location.href); url.searchParams.set("refresh", Date.now().toString()); window.location.replace(url.toString()); }} className="mt-4 rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground">{english ? "Refresh page" : "רענון העמוד"}</button></div></div>;
  }
}

function DeferredServices() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const show = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(show, { timeout: 1800 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(show, 1200);
    return () => window.clearTimeout(id);
  }, []);
  if (!ready) return null;
  return <Suspense fallback={null}><DeferredReportErrorButton /><DeferredToaster position="top-center" richColors dir={getLanguage() === "en" ? "ltr" : "rtl"} duration={1800} /></Suspense>;
}

// "/therapist", the old "/therapist/board" and a bare "/therapist/build" all open the treatment board.
function TherapistBoardEntry() {
  return <Navigate to="/therapist/build?view=session" replace />;
}
function TherapistBuildEntry() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  if (!params.has("tab") && !params.has("view")) return <TherapistBoardEntry />;
  // Moving to another board date or client board starts the builder afresh.
  return <TherapistBuild key={`${params.get("boardDate") || ""}|${params.get("patientBoard") || ""}`} />;
}

// The main areas' code, fetched quietly a few seconds after the first page is ready, so moving to the
// therapist area, the activities or an activity page does not wait for a download. Skipped when the
// device asks to save data or the connection is very slow.
const PRELOAD = [
  () => import("@/pages/TherapistBuild"),
  () => import("@/pages/ParentPlay"),
  () => import("@/pages/AllActivities"),
  () => import("@/pages/ActivityDetail"),
];
function usePreloadMainAreas() {
  useEffect(() => {
    const connection = navigator.connection;
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "")) return undefined;
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      PRELOAD.reduce((chain, load) => chain.then(() => (cancelled ? null : load().catch(() => null))), Promise.resolve());
    };
    const timer = window.setTimeout(() => (window.requestIdleCallback ? window.requestIdleCallback(run, { timeout: 4000 }) : run()), 2500);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, []);
}

export default function App() {
  useImageSeo();
  usePreloadMainAreas();
  // English pages keep their /en/ address: the router runs under /en, so every link stays in English.
  return (
    <RouteErrorBoundary><BrowserRouter basename={routerBasename()}>
      <ScrollToTop />
      <SeoManager />
      <AnalyticsConsent />
      <DeferredServices />
      <Suspense fallback={<PageLoader />}><Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/parent/play" element={<ParentPlay />} />
        <Route path="/parent/recipes" element={<TherapistRecipes mode="parent" />} />
        <Route path="/parent/recipes/:recipeId" element={<TherapistRecipes mode="parent" />} />
        <Route path="/parent/experiments" element={<TherapistExperiments mode="parent" />} />
        <Route path="/parent/experiments/:experimentId" element={<TherapistExperiments mode="parent" />} />
        <Route path="/therapist" element={<TherapistBoardEntry />} />
        <Route path="/therapist/board" element={<TherapistBoardEntry />} />
        <Route path="/therapist/build" element={<TherapistBuildEntry />} />
        <Route path="/therapist/recipes" element={<TherapistRecipes />} />
        <Route path="/therapist/recipes/:recipeId" element={<TherapistRecipes />} />
        <Route path="/therapist/experiments" element={<TherapistExperiments />} />
        <Route path="/therapist/experiments/:experimentId" element={<TherapistExperiments />} />
        <Route path="/therapist/cipher" element={<CipherGenerator />} />
        <Route path="/parent/cipher" element={<CipherGenerator mode="parent" />} />
        <Route path="/therapist/morning-routine" element={<MorningRoutine mode="therapist" />} />
        <Route path="/therapist/evening-routine" element={<EveningRoutine mode="therapist" />} />
        <Route path="/therapist/weekly-board" element={<WeeklyBoard mode="therapist" />} />
        <Route path="/therapist/motor-trail" element={<MotorTrail mode="therapist" />} />
        <Route path="/therapist/plans" element={<TherapistPlans />} />
        <Route path="/therapist/session-notes" element={<Navigate to="/therapist/diary" replace />} />
        <Route path="/therapist/diary" element={<TherapistDiary />} />
        <Route path="/therapist/patient/:id" element={<Navigate to="/therapist/diary" replace />} />
        <Route path="/therapist/board-games" element={<BoardGames mode="therapist" />} />
        <Route path="/parent/board-games" element={<BoardGames mode="parent" />} />
        <Route path="/board-game/:id" element={<BoardGameDetail />} />
        <Route path="/therapist/social-stories" element={<SocialStories mode="therapist" />} />
        <Route path="/therapist/activity-generator" element={<ActivityGenerator />} />
        <Route path="/therapist/community-activities" element={<CommunityActivities />} />
        <Route path="/parent/social-stories" element={<SocialStories mode="parent" />} />
        <Route path="/parent/morning-routine" element={<MorningRoutine mode="parent" />} />
        <Route path="/parent/evening-routine" element={<EveningRoutine mode="parent" />} />
        <Route path="/parent/weekly-board" element={<WeeklyBoard mode="parent" />} />
        <Route path="/parent/hebrew-calendar" element={<HebrewCalendarGenerator />} />
        {/* רצפי ADL הם עמוד עצמאי (/parent/daily-sequences/) שנטען מחוץ לאפליקציה */}
        <Route path="/parent/daily-sequences" element={<Navigate to="/" replace />} />
        <Route path="/therapist/hebrew-calendar" element={<HebrewCalendarGenerator />} />
        <Route path="/child/morning-routine" element={<ChildMorningRoutine />} />
        <Route path="/child/evening-routine" element={<ChildEveningRoutine />} />
        <Route path="/shared/weekly-board" element={<SharedWeeklyBoard />} />
        <Route path="/shared/home-practice" element={<SharedHomePractice />} />
        <Route path="/shared/hebrew-calendar" element={<SharedHebrewCalendar />} />
        <Route path="/therapist/all" element={<AllActivities mode="therapist" />} />
        <Route path="/parent/all" element={<AllActivities mode="parent" />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin/cms" element={<CmsAdmin />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/cookies" element={<LegalPage type="cookies" />} />
        <Route path="*" element={<Landing />} />
      </Routes></Suspense>
    </BrowserRouter></RouteErrorBoundary>
  );
}
