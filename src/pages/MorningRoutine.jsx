import { useMemo, useState } from "react";
import { Printer, RotateCcw, X, ChevronUp, ChevronDown, Plus, Smartphone, Copy, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  MORNING_ROUTINE_STEPS as STEPS,
  labelForStep as labelFor,
  imageForStep,
  charactersForGender,
  buildChildRoutineUrl,
} from "@/lib/morning-routine-steps";

export default function MorningRoutine({ mode }) {
  const [gender, setGender] = useState("girl");
  const characters = useMemo(() => charactersForGender(gender), [gender]);
  const [characterId, setCharacterId] = useState(() => charactersForGender("girl")[0]?.id ?? null);
  const [order, setOrder] = useState([]); // array of step ids, in chosen sequence
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const available = useMemo(
    () => STEPS.filter((s) => imageForStep(s, characterId) && !order.includes(s.id)),
    [characterId, order],
  );
  const scheduled = useMemo(() => order.map((id) => STEPS.find((s) => s.id === id)).filter(Boolean), [order]);
  const childUrl = useMemo(
    () => (order.length > 0 && characterId ? buildChildRoutineUrl(gender, characterId, order) : ""),
    [gender, characterId, order],
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(childUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — link is still shown and selectable manually
    }
  }

  function addStep(id) {
    setOrder((prev) => [...prev, id]);
  }
  function removeStep(id) {
    setOrder((prev) => prev.filter((x) => x !== id));
  }
  function move(index, dir) {
    setOrder((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  function resetAll() {
    setOrder([]);
  }
  function switchGender(g) {
    setGender(g);
    setCharacterId(charactersForGender(g)[0]?.id ?? null);
    setOrder([]);
  }
  function switchCharacter(id) {
    if (id === characterId) return;
    setCharacterId(id);
    setOrder([]);
  }

  return (
    <AppShell mode={mode}>
      <div className="mb-6 print:hidden">
        <h1 className="font-display text-3xl font-black md:text-4xl">לוח התארגנות בוקר</h1>
        <p className="mt-1 text-muted-foreground">
          בחרו בן או בת, בחרו את הדמות שהכי מתאימה לילד/ה שלכם, ואז לחצו על התמונות לפי סדר ההתארגנות - ותקבלו לוח מוכן להדפסה.
        </p>
      </div>

      <div className="print:hidden mb-6 rounded-3xl border border-sky/50 bg-sky/10 p-5 md:p-6">
        <h2 className="mb-2 font-display text-base font-bold">למה לוח התארגנות בוקר עוזר?</h2>
        <p className="text-sm leading-relaxed text-foreground/90">
          לוח חזותי עם תמונות של שלבי הבוקר מפחית עומס על הזיכרון וההתארגנות, ומחליף את הצורך בהוראות מילוליות חוזרות. כשהילד/ה
          יכולים לראות בעצמם מה השלב הבא, זה מחזק עצמאות, מפחית מאבקי כוח סביב השעון, ויוצר שגרה קבועה ובטוחה שמתחילה את היום
          ברוגע - גם עבור הילד/ה וגם עבורכם.
        </p>
      </div>

      <div className="print:hidden mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => switchGender("girl")}
          className={`flex-1 rounded-2xl border px-4 py-3 text-center font-bold transition-colors ${
            gender === "girl" ? "border-sage bg-sage/15 text-foreground" : "border-border/60 bg-card text-muted-foreground"
          }`}
        >
          👧 בת
        </button>
        <button
          type="button"
          onClick={() => switchGender("boy")}
          className={`flex-1 rounded-2xl border px-4 py-3 text-center font-bold transition-colors ${
            gender === "boy" ? "border-sage bg-sage/15 text-foreground" : "border-border/60 bg-card text-muted-foreground"
          }`}
        >
          👦 בן
        </button>
      </div>

      {characters.length > 1 && (
        <div className="print:hidden mb-6">
          <h2 className="mb-2 font-display text-base font-bold">בחרו את הדמות שהכי דומה לילד/ה שלכם</h2>
          <div className="flex flex-wrap gap-3">
            {characters.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => switchCharacter(c.id)}
                className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 bg-cream transition-colors ${
                  characterId === c.id ? "border-sage" : "border-transparent hover:border-sage/40"
                }`}
              >
                <img src={c.avatar} alt={c.name || "בחירת דמות"} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] print:!grid-cols-1">
        {/* ---------- Bank of available step images ---------- */}
        <section className="print:hidden rounded-3xl border border-border/60 bg-card p-5 md:p-6">
          <h2 className="mb-1 font-display text-lg font-bold">בנק שלבים</h2>
          <p className="mb-4 text-xs text-muted-foreground">לוחצים על תמונה כדי להוסיף אותה ללוח, בסדר שרוצים.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {available.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => addStep(s.id)}
                className="group relative flex aspect-[4/3] items-stretch overflow-hidden rounded-3xl border border-border/60 bg-cream text-right transition-colors hover:border-sage/60"
              >
                <div className="relative flex min-w-0 flex-1 items-center justify-center p-2">
                  <img src={imageForStep(s, characterId)} alt="" className="max-h-full max-w-full object-contain" />
                  <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sage text-sage-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    <Plus className="h-3 w-3" />
                  </span>
                </div>
                <span className="flex w-[42%] shrink-0 items-center justify-center border-r border-sage/20 bg-white/90 px-1.5 text-center text-[10px] font-bold leading-snug text-blue-700 sm:text-[11px]">
                  {labelFor(s, gender)}
                </span>
              </button>
            ))}
            {available.length === 0 && (
              <p className="col-span-3 py-6 text-center text-sm text-muted-foreground">כל השלבים נוספו ללוח 🎉</p>
            )}
          </div>
        </section>

        {/* ---------- Scheduled order / printable table ---------- */}
        <section className="routine-print-sheet rounded-3xl border border-border/60 bg-card p-5 md:p-6 print:!rounded-none print:!border-none print:!p-0">
          <div className="mb-4 flex items-center justify-between print:hidden">
            <h2 className="font-display text-lg font-bold">הלוח שלנו</h2>
            {scheduled.length > 0 && (
              <Button variant="ghost" size="sm" onClick={resetAll} className="rounded-full text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" /> איפוס
              </Button>
            )}
          </div>

          <h3 className="mb-3 hidden text-center font-display text-xl font-bold print:!mb-1 print:block print:text-sm">לוח התארגנות בוקר</h3>

          {scheduled.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground print:hidden">בחרו שלבים מהבנק בצד כדי לבנות את הלוח.</p>
          ) : (
            <ol className="space-y-2 print:!space-y-0.5">
              {scheduled.map((s, i) => (
                <li
                  key={s.id}
                  className="routine-print-item flex items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-2 print:break-inside-avoid print:!gap-1.5 print:border print:border-border print:!px-1.5 print:!py-0.5"
                >
                  <span className="routine-print-number flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage/70 text-sm font-bold text-sage-foreground print:!h-4 print:!w-4 print:text-[9px]">
                    {i + 1}
                  </span>
                  <div className="routine-print-image flex h-24 w-24 shrink-0 items-center justify-center print:!h-[92px] print:!w-[92px]">
                    <img src={imageForStep(s, characterId)} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className="routine-print-label flex-1 rounded-xl border border-sky/25 bg-sky/10 px-3 py-2 text-sm font-bold leading-snug text-blue-700 print:border-0 print:bg-transparent print:px-1 print:py-0 print:text-xs">
                    {labelFor(s, gender)}
                  </span>
                  <div className="flex shrink-0 items-center gap-1 print:hidden">
                    <button
                      type="button"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="הזז למעלה"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, 1)}
                      disabled={i === scheduled.length - 1}
                      aria-label="הזז למטה"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStep(s.id)}
                      aria-label="הסרה"
                      className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {scheduled.length > 0 && (
            <div className="mt-5 space-y-2 print:hidden">
              <Button onClick={() => setShareOpen(true)} variant="outline" className="w-full rounded-full">
                <Smartphone className="h-4 w-4" /> קישור לילד/ה - סימון בפלאפון
              </Button>
              <Button onClick={() => window.print()} className="w-full rounded-full">
                <Printer className="h-4 w-4" /> הדפסה / שמירה כ-PDF
              </Button>
            </div>
          )}
        </section>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>קישור ללוח האינטראקטיבי</DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-sm text-muted-foreground">
            שלחו את הקישור הזה לפלאפון של הילד/ה, או תנו לו/ה לסרוק את קוד ה-QR. בכל פעם שהוא/היא מסיימים שלב, לוחצים עליו
            והוא נעלם מהרשימה.
          </p>
          {childUrl && (
            <>
              <div className="mb-4 flex justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(childUrl)}`}
                  alt="קוד QR לקישור הילד"
                  width={180}
                  height={180}
                  className="rounded-2xl border border-border/60 bg-white p-2"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/50 p-2">
                <input readOnly value={childUrl} className="flex-1 bg-transparent px-2 text-sm text-muted-foreground sm:text-xs" onFocus={(e) => e.target.select()} />
                <Button type="button" size="sm" variant="ghost" onClick={copyLink} className="shrink-0 rounded-full">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "הועתק" : "העתקה"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
