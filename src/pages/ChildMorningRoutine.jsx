import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RotateCcw, PartyPopper, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { labelForStep, parseChildRoutineParams, imageForStep } from "@/lib/morning-routine-steps";

export default function ChildMorningRoutine() {
  const [searchParams] = useSearchParams();
  const { gender, characterId, steps } = useMemo(() => parseChildRoutineParams(searchParams), [searchParams]);

  const storageKey = `child-morning-routine:${searchParams.toString()}`;
  const [done, setDone] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...done]));
    } catch {
      // localStorage unavailable — progress just won't persist across reloads
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, storageKey]);

  function toggleStep(id) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function resetAll() {
    setDone(new Set());
  }

  if (steps.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream p-6 text-center" dir="rtl">
        <p className="text-lg text-muted-foreground">הקישור הזה לא תקין. בקשו מההורה/המטפל קישור חדש ללוח ההתארגנות.</p>
      </div>
    );
  }

  const allDone = steps.every((s) => done.has(s.id));

  return (
    <div className="min-h-screen bg-cream" dir="rtl">
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="mb-6 text-center">
          <span className="text-5xl">🌞</span>
          <h1 className="mt-2 font-display text-3xl font-black">הבוקר שלי</h1>
          <p className="mt-1 text-sm text-muted-foreground">לחצו על כל שלב אחרי שסיימתם אותו</p>
        </div>

        {allDone && (
          <div className="mb-5 flex flex-col items-center gap-3 rounded-3xl border border-sage/50 bg-sage/15 p-8 text-center">
            <PartyPopper className="h-12 w-12 text-sage-foreground" />
            <p className="font-display text-2xl font-bold">כל הכבוד! סיימתם הכל 🎉</p>
            <p className="text-sm text-muted-foreground">מוכנים ליום חדש!</p>
          </div>
        )}

        <ul className="space-y-3">
          {steps.map((s, i) => {
            const isDone = done.has(s.id);
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => toggleStep(s.id)}
                  className={`flex w-full items-center gap-4 rounded-3xl border-2 p-3 text-right shadow-sm transition-all duration-300 active:scale-[0.98] ${
                    isDone ? "border-sage bg-sage/40" : "border-border/60 bg-card active:border-sage active:bg-sage/10"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg font-bold transition-colors ${
                      isDone ? "bg-sage text-sage-foreground" : "bg-sage/70 text-sage-foreground"
                    }`}
                  >
                    {isDone ? <Check className="h-5 w-5" /> : i + 1}
                  </span>
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center">
                    <img src={imageForStep(s, characterId)} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <span
                    className={`flex-1 rounded-xl border px-3 py-2 text-sm font-bold leading-snug sm:text-base ${
                      isDone
                        ? "border-sage/25 bg-white/35 text-sage-foreground/80 line-through"
                        : "border-sky/25 bg-sky/10 text-blue-700"
                    }`}
                  >
                    {labelForStep(s, gender)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {done.size > 0 && (
          <div className="mt-8 flex justify-center">
            <Button variant="ghost" onClick={resetAll} className="rounded-full text-muted-foreground">
              <RotateCcw className="h-4 w-4" /> איפוס - התחלת בוקר חדש
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
