import { Component, lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useImageSeo } from "@/lib/image-seo";
import { SeoManager } from "@/components/SeoManager";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import { useRuntimeEnglishLoader } from "@/lib/runtime-ui-loader";
import Landing from "@/pages/Landing";

function lazyRoute(importer) {
  return lazy(() => Promise.race([
    importer(),
    new Promise((_, reject) => window.setTimeout(() => reject(new Error("Page loading timed out")), 12000)),
  ]).then((module) => {
    try { sessionStorage.removeItem("boo_chunk_retry"); } catch { /* storage may be blocked */ }
    return module;
  }).catch((error) => {
    let alreadyRetried = false;
    try { alreadyRetried = sessionStorage.getItem("boo_chunk_retry") === "1"; } catch { /* storage may be blocked */ }
    if (!alreadyRetried) {
      try { sessionStorage.setItem("boo_chunk_retry", "1"); } catch { /* storage may be blocked */ }
      const url = new URL(window.location.href);
      url.searchParams.set("refresh", Date.now().toString());
      window.location.replace(url.toString());
      return new Promise(() => {});
    }
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
const SessionNotes = lazyRoute(() => import("@/pages/SessionNotes"));
const BoardGames = lazyRoute(() => import("@/pages/BoardGames"));
const BoardGameDetail = lazyRoute(() => import("@/pages/BoardGameDetail"));
const SocialStories = lazyRoute(() => import("@/pages/SocialStories"));
const AllActivities = lazyRoute(() => import("@/pages/AllActivities"));
const ActivityDetail = lazyRoute(() => import("@/pages/ActivityDetail"));
const Favorites = lazyRoute(() => import("@/pages/Favorites"));
const Profile = lazyRoute(() => import("@/pages/Profile"));
const Auth = lazyRoute(() => import("@/pages/Auth"));
const CmsAdmin = lazyRoute(() => import("@/pages/CmsAdmin"));
const About = lazyRoute(() => import("@/pages/About"));
const TherapistDiary = lazyRoute(() => import("@/pages/TherapistDiary"));
const TherapistPatient = lazyRoute(() => import("@/pages/TherapistPatient"));
const HebrewCalendarGenerator = lazyRoute(() => import("@/pages/HebrewCalendarGenerator"));
const SharedHebrewCalendar = lazyRoute(() => import("@/pages/SharedHebrewCalendar"));
const LegalPage = lazyRoute(() => import("@/pages/LegalPage"));
const DeferredReportErrorButton = lazy(() => import("@/components/ReportErrorButton").then((module) => ({ default: module.ReportErrorButton })));
const DeferredToaster = lazy(() => import("sonner").then((module) => ({ default: module.Toaster })));

function PageLoader() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setSlow(true), 6000);
    return () => window.clearTimeout(id);
  }, []);
  return <div className="flex min-h-screen items-center justify-center bg-background"><div className="text-center"><div className="rounded-full bg-card px-5 py-3 text-sm font-bold text-muted-foreground shadow-sm">טוענת…</div>{slow && <button type="button" onClick={() => window.location.reload()} className="mt-4 rounded-full border border-border bg-white px-4 py-2 text-sm font-bold">הטעינה מתעכבת — רענון</button>}</div></div>;
}

class RouteErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div className="flex min-h-screen items-center justify-center bg-background px-6"><div className="max-w-md rounded-3xl bg-card p-6 text-center shadow-soft"><h1 className="text-xl font-black">העמוד לא נטען</h1><p className="mt-2 text-sm text-muted-foreground">כנראה נשאר בדפדפן קובץ ישן. רענון יטען את הגרסה המעודכנת.</p><button type="button" onClick={() => { try { sessionStorage.removeItem("boo_chunk_retry"); } catch { /* storage may be blocked */ } const url = new URL(window.location.href); url.searchParams.set("refresh", Date.now().toString()); window.location.replace(url.toString()); }} className="mt-4 rounded-full bg-primary px-5 py-2.5 font-bold text-primary-foreground">רענון העמוד</button></div></div>;
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
  return <Suspense fallback={null}><DeferredReportErrorButton /><DeferredToaster position="top-center" richColors dir="rtl" duration={1800} /></Suspense>;
}

export default function App() {
  useImageSeo();
  useRuntimeEnglishLoader();
  return (
    <RouteErrorBoundary><BrowserRouter>
      <ScrollToTop />
      <SeoManager />
      <AnalyticsConsent />
      <DeferredServices />
      <Suspense fallback={<PageLoader />}><Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/parent/play" element={<ParentPlay />} />
        <Route path="/parent/recipes" element={<TherapistRecipes mode="parent" />} />
        <Route path="/parent/experiments" element={<TherapistExperiments mode="parent" />} />
        <Route path="/therapist/build" element={<TherapistBuild />} />
        <Route path="/therapist/recipes" element={<TherapistRecipes />} />
        <Route path="/therapist/experiments" element={<TherapistExperiments />} />
        <Route path="/therapist/cipher" element={<CipherGenerator />} />
        <Route path="/parent/cipher" element={<CipherGenerator mode="parent" />} />
        <Route path="/therapist/morning-routine" element={<MorningRoutine mode="therapist" />} />
        <Route path="/therapist/evening-routine" element={<EveningRoutine mode="therapist" />} />
        <Route path="/therapist/weekly-board" element={<WeeklyBoard mode="therapist" />} />
        <Route path="/therapist/motor-trail" element={<MotorTrail mode="therapist" />} />
        <Route path="/therapist/plans" element={<TherapistPlans />} />
        <Route path="/therapist/session-notes" element={<SessionNotes />} />
        <Route path="/therapist/diary" element={<TherapistDiary />} />
        <Route path="/therapist/patient/:id" element={<TherapistPatient />} />
        <Route path="/therapist/board-games" element={<BoardGames mode="therapist" />} />
        <Route path="/parent/board-games" element={<BoardGames mode="parent" />} />
        <Route path="/board-game/:id" element={<BoardGameDetail />} />
        <Route path="/therapist/social-stories" element={<SocialStories mode="therapist" />} />
        <Route path="/parent/social-stories" element={<SocialStories mode="parent" />} />
        <Route path="/parent/morning-routine" element={<MorningRoutine mode="parent" />} />
        <Route path="/parent/evening-routine" element={<EveningRoutine mode="parent" />} />
        <Route path="/parent/weekly-board" element={<WeeklyBoard mode="parent" />} />
        <Route path="/parent/hebrew-calendar" element={<HebrewCalendarGenerator />} />
        <Route path="/parent/daily-sequences" element={<Navigate to="/" replace />} />
        <Route path="/therapist/hebrew-calendar" element={<HebrewCalendarGenerator />} />
        <Route path="/child/morning-routine" element={<ChildMorningRoutine />} />
        <Route path="/child/evening-routine" element={<ChildEveningRoutine />} />
        <Route path="/shared/weekly-board" element={<SharedWeeklyBoard />} />
        <Route path="/shared/hebrew-calendar" element={<SharedHebrewCalendar />} />
        <Route path="/therapist/all" element={<AllActivities mode="therapist" />} />
        <Route path="/parent/all" element={<AllActivities mode="parent" />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin/cms" element={<CmsAdmin />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<LegalPage type="privacy" />} />
        <Route path="/terms" element={<LegalPage type="terms" />} />
        <Route path="/cookies" element={<LegalPage type="cookies" />} />
        <Route path="*" element={<Landing />} />
      </Routes></Suspense>
    </BrowserRouter></RouteErrorBoundary>
  );
}
