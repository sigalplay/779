import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Route, Printer, RotateCcw, X, ChevronUp, ChevronDown, Plus, ArrowRight, ListPlus, Play, Pause, Trash2, Undo2, Archive } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MOTOR_TRAIL_ITEMS, CREATIVE_ACCESSORIES, HOME_ITEMS } from "@/lib/motor-trail-items";
import { addMotorTrailToDraftPlan, updateMotorTrailInDraftPlan, getDraftPlan } from "@/lib/storage";

const HIDDEN_EQUIPMENT_KEY = "boo_motor_trail_hidden_equipment";

function loadHiddenEquipment() {
  try {
    const saved = JSON.parse(localStorage.getItem(HIDDEN_EQUIPMENT_KEY) || "[]");
    return new Set(Array.isArray(saved) ? saved : []);
  } catch {
    return new Set();
  }
}

function MotorDemoDialog({ item, frame, playing, onPlayingChange, onClose }) {
  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl">איך משתמשים ב{item?.label}?</DialogTitle>
        </DialogHeader>
        {item?.demo ? (
          <div className="space-y-3">
            <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl border border-border/60 bg-white">
              {item.demo.map((image, index) => (
                <img key={image} src={image} alt="" aria-hidden={index !== frame} className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-200 ${index === frame ? "opacity-100" : "opacity-0"}`} />
              ))}
            </div>
            <div className="flex items-center justify-center gap-2">
              {item.demo.map((_, index) => <span key={index} className={`h-2.5 w-2.5 rounded-full transition-colors ${index === frame ? "bg-sage" : "bg-muted"}`} />)}
            </div>
            <p className="text-center text-lg font-bold text-blue-600">{item.action}</p>
            <button type="button" onClick={() => onPlayingChange(!playing)} className="mx-auto flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-bold">
              {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
              {playing ? "עצירה" : "הפעלה"}
            </button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default function MotorTrail({ mode }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = searchParams.get("returnTo"); // "plan" | "session" | null
  const editUid = searchParams.get("edit");
  const [started, setStarted] = useState(false);

  const [order, setOrder] = useState(() => {
    if (!editUid) return [];
    const existing = getDraftPlan().find((p) => p.kind === "motor-trail" && p.uid === editUid);
    return existing?.equipment ?? [];
  });
  const [customItems, setCustomItems] = useState(() => {
    if (!editUid) return [];
    const existing = getDraftPlan().find((p) => p.kind === "motor-trail" && p.uid === editUid);
    return existing?.customItems ?? [];
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [bankTab, setBankTab] = useState("clinic"); // "clinic" | "home"
  const [hiddenEquipment, setHiddenEquipment] = useState(loadHiddenEquipment);
  const [demoItem, setDemoItem] = useState(null);
  const [demoFrame, setDemoFrame] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(true);

  const allItems = useMemo(() => [...MOTOR_TRAIL_ITEMS, ...customItems], [customItems]);
  const available = useMemo(() => MOTOR_TRAIL_ITEMS.filter((it) => !order.includes(it.id) && !hiddenEquipment.has(it.id)), [order, hiddenEquipment]);
  const removedEquipment = useMemo(() => MOTOR_TRAIL_ITEMS.filter((it) => hiddenEquipment.has(it.id)), [hiddenEquipment]);
  const scheduled = useMemo(() => order.map((id) => allItems.find((it) => it.id === id)).filter(Boolean), [order, allItems]);

  useEffect(() => {
    if (!demoItem?.demo?.length || !demoPlaying) return undefined;
    const timer = window.setInterval(() => {
      setDemoFrame((frame) => (frame + 1) % demoItem.demo.length);
    }, 900);
    return () => window.clearInterval(timer);
  }, [demoItem, demoPlaying]);

  function openDemo(item) {
    setDemoItem(item);
    setDemoFrame(0);
    setDemoPlaying(true);
  }

  function addItem(id) {
    setOrder((prev) => [...prev, id]);
  }
  function addAccessory(accessory) {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const item = { id, label: accessory.label, image: accessory.image };
    setCustomItems((prev) => [...prev, item]);
    setOrder((prev) => [...prev, id]);
    setPickerOpen(false);
    toast.success(`"${accessory.label}" נוסף למסלול`);
  }
  function addHomeItem(homeItem) {
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const item = { id, label: homeItem.label, emoji: homeItem.emoji };
    setCustomItems((prev) => [...prev, item]);
    setOrder((prev) => [...prev, id]);
    toast.success(`"${homeItem.label}" נוסף למסלול`);
  }
  function removeItem(id) {
    setOrder((prev) => prev.filter((x) => x !== id));
  }
  function saveHiddenEquipment(next) {
    setHiddenEquipment(next);
    try { localStorage.setItem(HIDDEN_EQUIPMENT_KEY, JSON.stringify([...next])); } catch { /* no persistence */ }
  }
  function deleteFromBank(item) {
    const next = new Set(hiddenEquipment);
    next.add(item.id);
    saveHiddenEquipment(next);
    setOrder((prev) => prev.filter((id) => id !== item.id));
    toast.success(`„${item.label}” הוסר ממאגר המתקנים`);
  }
  function restoreToBank(id) {
    const next = new Set(hiddenEquipment);
    next.delete(id);
    saveHiddenEquipment(next);
    toast.success("המתקן הוחזר למאגר");
  }
  function restoreAllEquipment() {
    saveHiddenEquipment(new Set());
    toast.success("כל המתקנים הוחזרו למאגר");
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

  function handleAddToPlan() {
    if (!order.length) return;
    if (editUid) {
      updateMotorTrailInDraftPlan(editUid, order, customItems);
      toast.success("המסלול עודכן בתוכנית הטיפול");
    } else {
      addMotorTrailToDraftPlan(order, customItems);
      toast.success("המסלול נוסף לתוכנית הטיפול");
    }
    navigate(`/therapist/build${returnTo === "session" ? "?view=session" : ""}`);
  }

  if (started) {
    return (
      <AppShell mode={mode}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-black md:text-4xl">המסלול שלנו</h1>
            <p className="mt-1 text-muted-foreground">בהצלחה! עוברים תחנה אחרי תחנה, בסדר.</p>
          </div>
          <Button variant="outline" onClick={() => setStarted(false)} className="rounded-full">
            <ArrowRight className="h-4 w-4" /> חזרה לעריכה
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {scheduled.map((it, i) => (
            <div key={it.id} className="flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
              <div className="relative flex aspect-square w-full items-center justify-center bg-gradient-to-br from-sage/25 via-sky/25 to-primary/15 p-4">
                <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-base font-bold shadow-sm">
                  {i + 1}
                </span>
                {it.image ? (
                  <img src={it.image} alt="" className="max-h-full max-w-full object-contain drop-shadow-md" />
                ) : (
                  <span className="text-6xl" aria-hidden>
                    {it.emoji}
                  </span>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-center font-display text-lg font-bold">{it.label}</h3>
                {it.demo ? (
                  <button type="button" onClick={() => openDemo(it)} className="mx-auto mt-2 flex items-center gap-1.5 rounded-full bg-sage/20 px-3 py-1.5 text-sm font-bold text-sage-foreground">
                    <Play className="h-4 w-4 fill-current" /> איך עושים?
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <MotorDemoDialog item={demoItem} frame={demoFrame} playing={demoPlaying} onPlayingChange={setDemoPlaying} onClose={() => setDemoItem(null)} />
      </AppShell>
    );
  }

  return (
    <AppShell mode={mode}>
      {returnTo && (
        <Link
          to={`/therapist/build${returnTo === "session" ? "?view=session" : ""}`}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2.5 text-base font-bold text-foreground shadow-sm transition-colors hover:bg-sage/10 print:hidden"
        >
          <ArrowRight className="h-5 w-5" /> {returnTo === "session" ? "חזרה למפגש" : "חזרה לתוכנית הטיפול"}
        </Link>
      )}

      <div className="mb-6 flex flex-col-reverse items-center gap-4 sm:flex-row print:hidden">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sage">
            <Route className="h-5 w-5" />
            <span className="text-sm font-bold">כלי יצירה</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-black md:text-4xl">מסלול מוטורי</h1>
          <p className="mt-1 text-muted-foreground">
            לוחצים על המתקנים מהבנק בסדר הרצוי לבניית המסלול - ומקבלים רשימה ממוספרת מוכנה להדפסה.
            <br />ניתן ללחוץ על סימן המשולש כדי לראות כיצד להשתמש במתקן.
          </p>
        </div>
        <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-sage/20 to-sky/20 p-2 sm:h-36 sm:w-36">
          <img src="/icon-bank/motor-trail/hero.webp" alt="" className="max-h-full max-w-full object-contain" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr] print:!grid-cols-1">
        {/* ---------- Bank of available equipment images ---------- */}
        <section className="print:hidden rounded-3xl border border-border/60 bg-card p-5 md:p-6">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold">בנק מתקנים</h2>
            {mode === "therapist" && (
              <button type="button" onClick={() => setArchiveOpen(true)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-sage hover:text-foreground">
                <Archive className="h-3.5 w-3.5" /> ארכיון מתקנים
                {removedEquipment.length > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sage/25 px-1 text-[10px] text-sage-foreground">{removedEquipment.length}</span>}
              </button>
            )}
          </div>
          <p className="mb-3 text-xs text-muted-foreground">לוחצים על מתקן כדי להוסיף אותו למסלול, בסדר שרוצים.</p>

          <div className="mb-4 inline-flex rounded-full bg-muted p-1">
            <button
              type="button"
              onClick={() => setBankTab("clinic")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                bankTab === "clinic" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              ציוד בקליניקה
            </button>
            <button
              type="button"
              onClick={() => setBankTab("home")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                bankTab === "home" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              🏠 מה יש לנו בבית?
            </button>
          </div>

          {bankTab === "clinic" ? (
            <div>
            <div className="grid grid-cols-3 gap-3">
              {available.map((it) => (
                <div key={it.id} className="group relative flex aspect-square flex-col overflow-hidden rounded-3xl border border-border/60 bg-cream transition-colors hover:border-sage/60">
                  <button type="button" onClick={() => addItem(it.id)} className="flex min-h-0 flex-1 items-center justify-center p-2" aria-label={`הוספת ${it.label} למסלול`}>
                    <img src={it.image} alt="" className="max-h-full max-w-full object-contain" />
                  </button>
                  {it.demo ? <button type="button" onClick={() => openDemo(it)} className="absolute left-1.5 top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sage-foreground shadow-md transition hover:scale-105" aria-label={`הדגמת ${it.label}`} title="איך עושים?">
                    <Play className="h-4 w-4 fill-current" />
                  </button> : null}
                  {mode === "therapist" && <button type="button" onClick={() => deleteFromBank(it)} className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-muted-foreground shadow-sm transition hover:bg-destructive/10 hover:text-destructive" aria-label={`מחיקת ${it.label} מהמאגר`} title="מחיקה מהמאגר">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>}
                  <button type="button" onClick={() => addItem(it.id)} className="w-full bg-background/90 px-1 py-1.5 text-center text-[11px] font-semibold leading-tight text-blue-600">
                    {it.label}
                  </button>
                </div>
              ))}
              {available.length === 0 && (
                <p className="col-span-3 py-6 text-center text-sm text-muted-foreground">כל המתקנים נוספו למסלול 🎉</p>
              )}
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="group relative flex aspect-square flex-col items-center justify-center gap-1.5 overflow-hidden rounded-3xl border-2 border-dashed border-sage/50 bg-sage/5 text-sage-foreground transition-colors hover:bg-sage/15"
              >
                <span className="text-4xl" aria-hidden>
                  🎨
                </span>
                <span className="px-1 text-center text-[11px] font-semibold leading-tight">הוסף אביזר יצירה</span>
              </button>
            </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {HOME_ITEMS.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => addHomeItem(it)}
                  className="group relative flex aspect-square flex-col overflow-hidden rounded-3xl border border-border/60 bg-cream transition-colors hover:border-sky/60"
                >
                  <div className="relative flex w-full flex-1 items-center justify-center p-2 text-5xl" aria-hidden>
                    {it.emoji}
                    <span className="absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sage text-sage-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      <Plus className="h-3 w-3" />
                    </span>
                  </div>
                  <span className="w-full bg-background/90 px-1 py-1.5 text-center text-[11px] font-semibold leading-tight text-blue-600">
                    {it.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ---------- Scheduled order / printable list ---------- */}
        <section className="rounded-3xl border border-border/60 bg-card p-5 md:p-6 print:!rounded-none print:!border-none print:!p-0">
          <div className="mb-4 flex items-center justify-between print:hidden">
            <h2 className="font-display text-lg font-bold">המסלול שלנו</h2>
            {scheduled.length > 0 && (
              <Button variant="ghost" size="sm" onClick={resetAll} className="rounded-full text-muted-foreground">
                <RotateCcw className="h-3.5 w-3.5" /> איפוס
              </Button>
            )}
          </div>

          <h3 className="mb-3 hidden text-center font-display text-xl font-bold print:!mb-1 print:block print:text-sm">מסלול מוטורי</h3>

          {scheduled.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground print:hidden">בחרו מתקנים מהבנק בצד כדי לבנות את המסלול.</p>
          ) : (
            <ol className="space-y-2 print:!space-y-0.5">
              {scheduled.map((it, i) => (
                <li
                  key={it.id}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-3 py-2 print:break-inside-avoid print:!gap-1.5 print:border print:border-border print:!px-1.5 print:!py-0.5"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sage/70 text-sm font-bold text-sage-foreground print:!h-4 print:!w-4 print:text-[9px]">
                    {i + 1}
                  </span>
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center print:!h-[92px] print:!w-[92px]">
                    {it.image ? (
                      <img src={it.image} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-5xl print:text-3xl" aria-hidden>
                        {it.emoji}
                      </span>
                    )}
                  </div>
                  <span className="flex-1 text-lg font-medium leading-snug print:text-xs">{it.label}</span>
                  <div className="flex shrink-0 items-center gap-1 print:hidden">
                    {it.demo ? <button type="button" onClick={() => openDemo(it)} aria-label={`איך משתמשים ב${it.label}`} className="me-1 flex h-8 items-center gap-1 rounded-full bg-sage/15 px-2.5 text-xs font-bold text-sage-foreground hover:bg-sage/25">
                      <Play className="h-3.5 w-3.5 fill-current" /> איך עושים?
                    </button> : null}
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
                      onClick={() => removeItem(it.id)}
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
              <Button onClick={() => setStarted(true)} className="w-full rounded-full bg-sage text-sage-foreground">
                <Play className="h-4 w-4" /> התחל מסלול
              </Button>
              {mode === "therapist" && (
                <Button onClick={handleAddToPlan} variant="outline" className="w-full rounded-full">
                  <ListPlus className="h-4 w-4" /> {editUid ? "עדכון המסלול בתוכנית" : "הוסף לתכנית הטיפול"}
                </Button>
              )}
              <Button onClick={() => window.print()} variant="outline" className="w-full rounded-full">
                <Printer className="h-4 w-4" /> הדפסה / שמירה כ-PDF
              </Button>
            </div>
          )}
        </section>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוספת אביזר יצירה למסלול</DialogTitle>
          </DialogHeader>
          <p className="mb-4 text-sm text-muted-foreground">בוחרים תחנת יצירה לסיום המסלול, מתוך מאגר התמונות של האתר.</p>
          <div className="grid grid-cols-3 gap-3">
            {CREATIVE_ACCESSORIES.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => addAccessory(acc)}
                className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-cream transition-colors hover:border-sage/60"
              >
                <div className="flex aspect-square w-full items-center justify-center p-2">
                  <img src={acc.image} alt="" className="max-h-full max-w-full object-contain" />
                </div>
                <span className="w-full bg-background/90 px-1 py-1.5 text-center text-[11px] font-semibold leading-tight text-blue-600">
                  {acc.label}
                </span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Archive className="h-5 w-5" /> ארכיון מתקנים</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">כאן נשמרים המתקנים שהוסרת מבנק הקליניקה. אפשר להחזיר אותם למאגר בכל שלב.</p>
          {removedEquipment.length > 0 ? (
            <>
              <div className="max-h-[55vh] overflow-y-auto py-2">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {removedEquipment.map((it) => (
                    <div key={it.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-cream">
                      <div className="flex aspect-square items-center justify-center p-3">
                        <img src={it.image} alt={it.label} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="border-t border-border bg-background p-2 text-center">
                        <p className="mb-2 text-sm font-bold">{it.label}</p>
                        <Button type="button" size="sm" variant="outline" onClick={() => restoreToBank(it.id)} className="w-full rounded-full">
                          <Undo2 className="h-3.5 w-3.5" /> החזרה למאגר
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="button" variant="outline" onClick={restoreAllEquipment} className="w-full rounded-full">
                <RotateCcw className="h-4 w-4" /> החזרת כל המתקנים למאגר
              </Button>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center">
              <Archive className="mx-auto mb-3 h-9 w-9 text-muted-foreground/60" />
              <p className="font-bold">הארכיון ריק</p>
              <p className="mt-1 text-sm text-muted-foreground">מתקנים שתסירי מבנק הקליניקה יופיעו כאן.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MotorDemoDialog item={demoItem} frame={demoFrame} playing={demoPlaying} onPlayingChange={setDemoPlaying} onClose={() => setDemoItem(null)} />
    </AppShell>
  );
}
