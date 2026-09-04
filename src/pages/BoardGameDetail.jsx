import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Share2, Printer, Clock, Layers, RotateCcw, ArrowRight, Dices } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleFavorite, isSignedIn, isFavorite } from "@/lib/storage";
import { getBoardGame } from "@/lib/board-games-data";
import { TagList } from "@/components/TagList";
import { BOARD_GAMES_EN } from "@/lib/board-games-en";
import { useTranslator } from "@/lib/language";
import { translatedTerm } from "@/lib/content-translations";

const NIKUD_KEY = "board-game:nikud";

function useNikud() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    try {
      setOn(window.localStorage.getItem(NIKUD_KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);
  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(NIKUD_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);
  return { on, toggle };
}

function useStepChecklist(gameId, total) {
  const key = `board-game-steps:${gameId}`;
  const [checked, setChecked] = useState(() => new Set());
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      setChecked(new Set(raw ? JSON.parse(raw) : []));
    } catch {
      setChecked(new Set());
    }
  }, [key]);
  const toggle = useCallback(
    (n) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(n)) next.delete(n);
        else next.add(n);
        try {
          window.localStorage.setItem(key, JSON.stringify([...next]));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key],
  );
  const reset = useCallback(() => {
    setChecked(new Set());
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  }, [key]);
  return { checked, toggle, reset, done: checked.size, total };
}

function useMaterialsChecklist(gameId) {
  const key = `board-game-materials:${gameId}`;
  const [checked, setChecked] = useState(() => new Set());
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      setChecked(new Set(raw ? JSON.parse(raw) : []));
    } catch {
      setChecked(new Set());
    }
  }, [key]);
  const toggle = useCallback(
    (i) => {
      setChecked((prev) => {
        const next = new Set(prev);
        if (next.has(i)) next.delete(i);
        else next.add(i);
        try {
          window.localStorage.setItem(key, JSON.stringify([...next]));
        } catch {
          /* ignore */
        }
        return next;
      });
    },
    [key],
  );
  return { checked, toggle };
}

export default function BoardGameDetail() {
  const { language } = useTranslator();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "parent" ? "parent" : "therapist";
  const nikud = useNikud();
  const pick = (t, tn) => (nikud.on && tn ? tn : t);

  const [saved, setSaved] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const game = getBoardGame(id);

  useEffect(() => {
    if (game) setSaved(isFavorite(`board-game-${game.id}`));
  }, [game]);

  function handleFav() {
    if (!isSignedIn()) {
      toast.error("צריך להתחבר כדי לשמור למועדפים");
      return;
    }
    const res = toggleFavorite(`board-game-${game.id}`);
    setSaved(res.favored);
    toast.success(res.favored ? "נשמר למועדפים" : "הוסר מהמועדפים");
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: game?.title, url });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("קישור הועתק");
    }
  }

  if (!game) {
    return (
      <AppShell mode={mode}>
        <div className="py-20 text-center text-muted-foreground">
          המשחק לא נמצא.
          <div className="mt-4">
            <Link to="/therapist/board-games" className="text-primary underline">
              חזרה למשחקי קופסא
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const g = language === "en" ? { ...game, ...(BOARD_GAMES_EN[game.id] || {}), materials: (BOARD_GAMES_EN[game.id]?.materials || game.materials).map((text) => typeof text === "string" ? { text } : text), steps: (BOARD_GAMES_EN[game.id]?.steps || game.steps).map((text, index) => typeof text === "string" ? { n: index + 1, text } : text), goals: game.goals?.map((item) => translatedTerm(item, language)), functions: game.functions?.map((item) => translatedTerm(item, language)), sensory_systems: game.sensory_systems?.map((item) => translatedTerm(item, language)), tags: game.tags?.map((item) => translatedTerm(item, language)) } : game;

  return (
    <AppShell mode={mode}>
      <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <Link
          to="/therapist/board-games"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" /> חזרה למשחקי קופסא
        </Link>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          aria-hidden
          className="flex h-56 items-center justify-center overflow-hidden rounded-3xl bg-white p-4 md:h-72"
        >
          {g.image ? (
            <img src={g.image} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-8xl leading-none drop-shadow-md md:text-9xl">{g.emoji}</span>
          )}
        </motion.div>

        <header className="rounded-3xl bg-gradient-to-br from-sage/20 to-sky/30 p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm text-muted-foreground">משחק קופסא</div>
              <h1 className="mt-1 font-display text-3xl font-black md:text-4xl">{pick(g.title, g.titleN)}</h1>
              {g.short_description && (
                <p className="mt-2 max-w-2xl text-muted-foreground">{pick(g.short_description, g.short_descriptionN)}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleFav} variant="outline" size="icon" className="h-11 w-11 rounded-full">
                <Heart className={`h-5 w-5 ${saved ? "fill-current text-primary" : ""}`} />
              </Button>
              <Button onClick={share} variant="outline" size="icon" className="h-11 w-11 rounded-full">
                <Share2 className="h-5 w-5" />
              </Button>
              <Button onClick={() => window.print()} variant="outline" size="icon" className="h-11 w-11 rounded-full">
                <Printer className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <Pill>
              גיל {g.age_min}–{g.age_max}
            </Pill>
            <Pill>
              <Clock className="h-3.5 w-3.5" /> {g.duration_min} דק'
            </Pill>
            <span className="inline-flex items-center gap-1 rounded-full bg-warm px-3 py-1 text-foreground/80">
              <Layers className="h-3.5 w-3.5" /> {g.difficulty === "easy" ? "קל" : g.difficulty === "medium" ? "בינוני" : "מתקדם"}
            </span>
            {language === "he" && <button
              type="button"
              onClick={nikud.toggle}
              aria-pressed={nikud.on}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold transition-colors ${
                nikud.on ? "bg-sage text-sage-foreground" : "bg-white/80 hover:bg-white"
              }`}
            >
              אָ ניקוד {nikud.on ? "פעיל" : "כבוי"}
            </button>}
          </div>
        </header>

        {(g.description || g.short_description) && (
          <Section title="תיאור המשחק">
            <div className="flex items-start gap-3">
              <div
                aria-hidden
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky/40 to-sage/30 text-3xl leading-none"
              >
                <Dices className="h-6 w-6" />
              </div>
              <div className="flex-1">{pick(g.description || g.short_description, g.descriptionN || g.short_descriptionN)}</div>
            </div>
          </Section>
        )}

        {g.materials?.length ? <MaterialsChecklist gameId={g.id} materials={g.materials} pick={pick} /> : null}

        {g.steps?.length ? <StepsChecklist gameId={g.id} steps={g.steps} pick={pick} /> : null}

        {g.adaptations && <Section title="הורדת רמת הקושי">{pick(g.adaptations, g.adaptationsN)}</Section>}
        {g.extensions && <Section title="העלאת רמת הקושי / שדרוג">{pick(g.extensions, g.extensionsN)}</Section>}

        {g.goals?.length || g.functions?.length || g.sensory_systems?.length ? (
          <Section title="על מה עובד (מבחינה התפתחותית)">
            <div className="space-y-3">
              {g.goals?.length ? <TagList items={g.goals} /> : null}
              {g.functions?.length ? <TagList items={g.functions} tone="sky" /> : null}
              {g.sensory_systems?.length ? <TagList items={g.sensory_systems} tone="sage" /> : null}
            </div>
          </Section>
        ) : null}

        {g.tags?.length ? (
          <div>
            <button
              type="button"
              onClick={() => setShowTags((v) => !v)}
              className="text-sm font-medium text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
            >
              {showTags ? "הסתר תגיות" : "הצג תגיות"}
            </button>
            {showTags ? (
              <Section title="תגיות">
                <TagList items={g.tags} />
              </Section>
            ) : null}
          </div>
        ) : null}
      </motion.article>
    </AppShell>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-5 md:p-6">
      <h2 className="mb-2 font-display text-lg font-bold">{title}</h2>
      <div className="text-base leading-relaxed text-foreground/90 md:text-lg">{children}</div>
    </section>
  );
}
function Pill({ children }) {
  return <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-3 py-1">{children}</span>;
}

function StepsChecklist({ gameId, steps, pick }) {
  const { checked, toggle, reset, done, total } = useStepChecklist(gameId, steps.length);
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;
  const [expandedStep, setExpandedStep] = useState(null);
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-bold">איך משחקים</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            סמני כל שלב לאחר ביצועו · לחצו על שלב כדי להגדיל · {done}/{total}
          </p>
        </div>
        {done > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} className="rounded-full text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5" /> אפס
          </Button>
        )}
      </div>
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-sage transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <ol className="space-y-3">
        {steps.map((s) => {
          const isChecked = checked.has(s.n);
          const isExpanded = expandedStep === s.n;
          return (
            <li
              key={s.n}
              className={`relative rounded-2xl border p-3 transition-all duration-300 print:scale-100 print:shadow-none ${
                isExpanded
                  ? "z-10 scale-[1.02] border-sky/80 bg-sky/10 shadow-lg"
                  : isChecked
                    ? "border-sage/60 bg-sage/10"
                    : "border-border/60 bg-background"
              }`}
            >
              <div className="flex items-center gap-3">
                <Checkbox
                  id={`bg-step-${s.n}`}
                  checked={isChecked}
                  onCheckedChange={() => toggle(s.n)}
                  aria-label={`סימון שלב ${s.n} כהושלם`}
                  className="h-5 w-5 shrink-0 print:hidden"
                />
                <button
                  type="button"
                  onClick={() => setExpandedStep((current) => (current === s.n ? null : s.n))}
                  aria-pressed={isExpanded}
                  className={`flex-1 cursor-zoom-in text-right leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky ${
                    isExpanded ? "py-3 text-xl md:text-2xl" : "text-base md:text-lg"
                  } ${isChecked ? "text-muted-foreground line-through" : ""}`}
                >
                  <span className="me-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sage/70 align-middle text-xs font-bold text-sage-foreground">
                    {s.n}
                  </span>
                  {pick(s.text, s.textN)}
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function MaterialsChecklist({ gameId, materials, pick }) {
  const { checked, toggle } = useMaterialsChecklist(gameId);
  const done = materials.filter((_, i) => checked.has(i)).length;
  return (
    <section className="rounded-3xl border border-border/60 bg-card p-5 md:p-6">
      <div className="mb-4">
        <h2 className="font-display text-lg font-bold">אביזרי המשחק</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          סמני כל פריט שיש לך · {done}/{materials.length}
        </p>
      </div>
      <ol className="space-y-2">
        {materials.map((m, i) => {
          const isChecked = checked.has(i);
          return (
            <li
              key={i}
              className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
                isChecked ? "border-sage/60 bg-sage/10" : "border-border/60 bg-background"
              }`}
            >
              <Checkbox id={`bg-mat-${i}`} checked={isChecked} onCheckedChange={() => toggle(i)} className="h-5 w-5 shrink-0" />
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky/60 text-xs font-bold">
                {i + 1}
              </span>
              <label
                htmlFor={`bg-mat-${i}`}
                className={`flex-1 cursor-pointer text-base leading-relaxed md:text-lg ${isChecked ? "text-muted-foreground line-through" : ""}`}
              >
                {pick(m.text, m.textN)}
              </label>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
