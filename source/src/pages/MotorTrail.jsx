import { Fragment, useEffect, useMemo, useState } from "react";
import { normalizeBoardDate, saveGuestBoard } from "@/lib/session-board-storage";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Route, Printer, RotateCcw, X, ChevronUp, ChevronDown, ArrowRight, ListPlus, Play, Pause, Trash2, Undo2, Archive } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MOTOR_TRAIL_ITEMS, CREATIVE_ACCESSORIES, HOME_ITEMS } from "@/lib/motor-trail-items";
import { addMotorTrailToDraftPlan, updateMotorTrailInDraftPlan, getDraftPlan } from "@/lib/storage";
import { useTranslator } from "@/lib/language";

// English names for equipment, including items saved in a plan before (looked up by id or Hebrew name).
const ALL_ITEMS = [...MOTOR_TRAIL_ITEMS, ...CREATIVE_ACCESSORIES, ...HOME_ITEMS];
function englishItem(item) {
  return ALL_ITEMS.find((known) => known.id === item?.id) || ALL_ITEMS.find((known) => known.label === item?.label) || item || {};
}
const itemLabel = (item) => englishItem(item).labelEn || item?.label;
const itemAction = (item) => englishItem(item).actionEn || item?.action;

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
  const { t } = useTranslator();
  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl">{t(`איך משתמשים ב${item?.label}?`, `How to use the ${itemLabel(item)}?`)}</DialogTitle>
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
            <p className="text-center text-lg font-bold text-blue-600">{t(item.action, itemAction(item))}</p>
            <button type="button" onClick={() => onPlayingChange(!playing)} className="mx-auto flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-bold">
              {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
              {playing ? t("עצירה", "Pause") : t("הפעלה", "Play")}
            </button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default function MotorTrail({ mode }) {
  const { t } = useTranslator();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const returnTo = searchParams.get("returnTo"); // "plan" | "session" | null
  const requestedReturnPath = searchParams.get("returnPath");
  // Back to the same treatment board: same client board and date as the board that opened this page.
  const patientBoard = searchParams.get("patientBoard");
  const boardDate = searchParams.get("boardDate");
  const hasBoardDate = /^\d{4}-\d{2}-\d{2}$/.test(boardDate || "");
  const sessionReturn = new URLSearchParams({ view: "session" });
  if (hasBoardDate) sessionReturn.set("boardDate", boardDate);
  if (patientBoard) { sessionReturn.set("patientBoard", patientBoard); sessionReturn.set("cloudBoardReady", "1"); }
  if (searchParams.get("fullscreen") === "1") sessionReturn.set("fullscreen", "1");
  const fallbackReturnPath = returnTo === "session" ? `/therapist/build?${sessionReturn.toString()}` : "/therapist/build";
  const returnPath = requestedReturnPath?.startsWith("/") && !requestedReturnPath.startsWith("//")
    ? requestedReturnPath
    : fallbackReturnPath;
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
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [bankFilter, setBankFilter] = useState("all"); // "all" | "clinic" | "home" | "fine"
  const [editBank, setEditBank] = useState(false);
  const [selected, setSelected] = useState(null); // id of the station whose tools are open
  const [lastAdded, setLastAdded] = useState(null);
  const [hiddenEquipment, setHiddenEquipment] = useState(loadHiddenEquipment);
  const [demoItem, setDemoItem] = useState(null);
  const [demoFrame, setDemoFrame] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState(true);

  const allItems = useMemo(() => [...MOTOR_TRAIL_ITEMS, ...customItems], [customItems]);
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

  // Each bank item is either clinic equipment (added by its id) or a household / fine-motor item
  // (added as its own copy, remembering which bank item it came from).
  function stationIdFor(bankItem) {
    if (MOTOR_TRAIL_ITEMS.some((it) => it.id === bankItem.id)) return order.includes(bankItem.id) ? bankItem.id : null;
    return customItems.find((it) => it.source === bankItem.id && order.includes(it.id))?.id ?? null;
  }
  function addStation(bankItem) {
    let id = bankItem.id;
    if (!MOTOR_TRAIL_ITEMS.some((it) => it.id === bankItem.id)) {
      id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setCustomItems((prev) => [...prev, { id, label: bankItem.label, image: bankItem.image, emoji: bankItem.emoji, source: bankItem.id }]);
    }
    setOrder((prev) => [...prev, id]);
    setLastAdded(id);
    setSelected(null);
  }
  function toggleStation(bankItem) {
    const existing = stationIdFor(bankItem);
    if (existing) removeItem(existing);
    else addStation(bankItem);
  }
  useEffect(() => {
    if (!lastAdded) return undefined;
    document.querySelector(`[data-station="${lastAdded}"]`)?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    const timer = window.setTimeout(() => setLastAdded(null), 1600);
    return () => window.clearTimeout(timer);
  }, [lastAdded]);
  function removeItem(id) {
    setOrder((prev) => prev.filter((x) => x !== id));
    setSelected((current) => (current === id ? null : current));
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
    toast.success(t(`„${item.label}” הוסר ממאגר המתקנים`, `"${itemLabel(item)}" removed from the equipment library`));
  }
  function restoreToBank(id) {
    const next = new Set(hiddenEquipment);
    next.delete(id);
    saveHiddenEquipment(next);
    toast.success(t("המתקן הוחזר למאגר", "The equipment was returned to the library"));
  }
  function restoreAllEquipment() {
    saveHiddenEquipment(new Set());
    toast.success(t("כל המתקנים הוחזרו למאגר", "All equipment was returned to the library"));
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
    setSelected(null);
  }

  function handleAddToPlan() {
    if (!order.length) return;
    if (editUid) {
      updateMotorTrailInDraftPlan(editUid, order, customItems);
      toast.success(t("המסלול עודכן בתוכנית הטיפול", "Obstacle course updated in the session plan."));
    } else {
      addMotorTrailToDraftPlan(order, customItems);
      toast.success(t("המסלול נוסף לתוכנית הטיפול", "Obstacle course added to the session plan."));
    }
    // A board without a client is kept per date; store the updated board so the course stays on it.
    if (returnTo === "session" && !patientBoard) saveGuestBoard(normalizeBoardDate(boardDate), getDraftPlan());
    navigate(returnPath);
  }

  if (started) {
    return (
      <AppShell mode={mode}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-black md:text-4xl">{t("המסלול שלנו", "Our obstacle course")}</h1>
            <p className="mt-1 text-muted-foreground">{t("בהצלחה! עוברים תחנה אחרי תחנה, בסדר.", "Great! Move through the stations one at a time, in order.")}</p>
          </div>
          <Button variant="outline" onClick={() => setStarted(false)} className="rounded-full">
            <ArrowRight className="h-4 w-4" />{" "}{t("חזרה לעריכה", "Back to Editing")}
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
                <h3 className="text-center font-display text-lg font-bold">{t(it.label, itemLabel(it))}</h3>
                {it.demo ? (
                  <button type="button" onClick={() => openDemo(it)} className="mx-auto mt-2 flex items-center gap-1.5 rounded-full bg-sage/20 px-3 py-1.5 text-sm font-bold text-sage-foreground">
                    <Play className="h-4 w-4 fill-current" />{" "}{t("איך עושים?", "How Does It Work?")}
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

  const bankItems = [
    ...(bankFilter === "all" || bankFilter === "clinic" ? MOTOR_TRAIL_ITEMS.filter((it) => !hiddenEquipment.has(it.id)).map((it) => ({ ...it, group: "clinic" })) : []),
    ...(bankFilter === "all" || bankFilter === "home" ? HOME_ITEMS.map((it) => ({ ...it, group: "home" })) : []),
    ...(bankFilter === "all" || bankFilter === "fine" ? CREATIVE_ACCESSORIES.map((it) => ({ ...it, group: "fine" })) : []),
  ];
  const filters = [
    ["all", t("הכל", "All")],
    ["clinic", t("קליניקה", "Clinic")],
    ["home", t("🏠 בית", "🏠 Home")],
    ["fine", t("✋ מוטוריקה עדינה", "✋ Fine motor")],
  ];

  return (
    <AppShell mode={mode}>
      {returnTo && (
        <Link
          to={returnPath}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2.5 text-base font-bold text-foreground shadow-sm transition-colors hover:bg-sage/10 print:hidden"
        >
          <ArrowRight className="h-5 w-5" /> {returnTo === "session" ? t("חזרה למפגש", "Back to the session") : t("חזרה לתוכנית הטיפול", "Back to the session plan")}
        </Link>
      )}

      <div className="mb-4 print:hidden">
        <div className="flex items-center gap-2 text-sage">
          <Route className="h-5 w-5" />
          <span className="text-sm font-bold">{t("כלי יצירה", "Creative tool")}</span>
        </div>
        <h1 className="mt-1 font-display text-3xl font-black md:text-4xl">{t("מסלול מוטורי", "Obstacle Course")}</h1>
        <p className="mt-1 text-muted-foreground">{t("בוחרים מתקנים מהבנק, והם נכנסים לשביל לפי הסדר.", "Choose equipment from the library to add stations in order.")}</p>
      </div>

      {/* ---------- The trail: stations in order, always in view ---------- */}
      <section className="trail-panel print:hidden" aria-label={t("המסלול שלנו", "Our obstacle course")}>
        <div className="trail-head">
          <h2>{t("המסלול שלנו", "Our obstacle course")}{scheduled.length ? ` · ${t(`${scheduled.length} תחנות`, `${scheduled.length} stations`)}` : ""}</h2>
          {scheduled.length > 0 && <span>{t("לחיצה על תחנה: שינוי סדר או מחיקה", "Tap a station to move or remove it")}</span>}
        </div>
        {scheduled.length === 0 ? (
          <p className="trail-empty">{t("עוד אין תחנות. בוחרים מתקן מהבנק למטה.", "No stations yet. Choose equipment from the library below.")}</p>
        ) : (
          <ol className="trail-path">
            {scheduled.map((it, i) => (
              <li key={it.id} data-station={it.id} className={["trail-station", lastAdded === it.id && "new", selected === it.id && "selected"].filter(Boolean).join(" ")}>
                <button type="button" className="trail-circle" aria-expanded={selected === it.id} aria-label={t(`תחנה ${i + 1}: ${it.label}`, `Station ${i + 1}: ${itemLabel(it)}`)} onClick={() => setSelected((current) => (current === it.id ? null : it.id))}>
                  {it.image ? <img src={it.image} alt="" /> : <span aria-hidden>{it.emoji}</span>}
                  <span className="trail-num">{i + 1}</span>
                </button>
                <small>{t(it.label, itemLabel(it))}</small>
                {it.demo && selected !== it.id ? (
                  <button type="button" className="trail-demo" onClick={() => openDemo(it)} aria-label={t(`איך משתמשים ב${it.label}`, `How to use ${itemLabel(it)}`)}><Play className="h-3.5 w-3.5 fill-current" /></button>
                ) : null}
                {selected === it.id && (
                  <div className="trail-tools">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t("תחנה אחת קודם", "One station earlier")}><ChevronUp className="rotate-90 h-4 w-4" /></button>
                    <button type="button" onClick={() => removeItem(it.id)} aria-label={t("הסרה מהמסלול", "Remove from the course")} className="danger"><X className="h-4 w-4" /></button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === scheduled.length - 1} aria-label={t("תחנה אחת אחר כך", "One station later")}><ChevronDown className="rotate-90 h-4 w-4" /></button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
        {scheduled.length > 0 && (
          <div className="trail-actions">
            <button type="button" className="primary" onClick={() => setStarted(true)}><Play className="h-4 w-4" />{t("התחלת מסלול", "Start the course")}</button>
            <button type="button" onClick={() => window.print()} aria-label={t("הדפסה", "Print")}><Printer className="h-4 w-4" /><span className="print-label">{t("הדפסה", "Print")}</span></button>
            {mode === "therapist" && <button type="button" onClick={handleAddToPlan}><ListPlus className="h-4 w-4" />{editUid ? t("עדכון בתכנית", "Update plan") : t("לתכנית", "To the plan")}</button>}
            <button type="button" className="ghost" onClick={resetAll} aria-label={t("איפוס המסלול", "Reset the course")}><RotateCcw className="h-4 w-4" /></button>
          </div>
        )}
      </section>

      {/* ---------- The bank: one list with filters ---------- */}
      <section className="trail-bank print:hidden">
        <div className="trail-bank-head">
          <h2>{t("בוחרים תחנה", "Choose a station")}</h2>
          {mode === "therapist" && (
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setEditBank((v) => !v)} aria-pressed={editBank} className={editBank ? "trail-small on" : "trail-small"}>
                <Trash2 className="h-3.5 w-3.5" />{editBank ? t("סיום עריכה", "Done") : t("עריכת הבנק", "Edit the library")}
              </button>
              <button type="button" onClick={() => setArchiveOpen(true)} className="trail-small">
                <Archive className="h-3.5 w-3.5" />{t("ארכיון", "Archive")}
                {removedEquipment.length > 0 && <span className="trail-count">{removedEquipment.length}</span>}
              </button>
            </div>
          )}
        </div>
        <div className="trail-filters" role="tablist">
          {filters.map(([value, label]) => (
            <button key={value} type="button" role="tab" aria-selected={bankFilter === value} className={bankFilter === value ? "on" : ""} onClick={() => setBankFilter(value)}>{label}</button>
          ))}
        </div>
        <div className="trail-grid">
          {bankItems.map((it, index) => {
            const inTrail = Boolean(stationIdFor(it));
            // In "All", a title opens each group: the clinic first, then home, then fine motor.
            const groupTitle = bankFilter === "all" && it.group !== bankItems[index - 1]?.group
              ? { clinic: t("🏥 בקליניקה", "🏥 In the clinic"), home: t("🏠 בבית", "🏠 At home"), fine: t("✋ מוטוריקה עדינה", "✋ Fine motor") }[it.group]
              : null;
            return (
              <Fragment key={`${it.group}-${it.id}`}>
              {groupTitle && <h3 className="trail-group-title">{groupTitle}</h3>}
              <div className={inTrail ? "trail-tile in" : "trail-tile"}>
                <button type="button" onClick={() => toggleStation(it)} aria-pressed={inTrail}
                  aria-label={inTrail ? t(`הסרת ${it.label} מהמסלול`, `Remove ${itemLabel(it)} from the course`) : t(`הוספת ${it.label} למסלול`, `Add ${itemLabel(it)} to the course`)}>
                  <span className="trail-tile-img">{it.image ? <img src={it.image} alt="" /> : <span aria-hidden>{it.emoji}</span>}</span>
                  <small>{t(it.label, itemLabel(it))}</small>
                  {inTrail && <em>{t("✓ במסלול", "✓ In the course")}</em>}
                </button>
                {editBank && it.group === "clinic" && (
                  <button type="button" className="trail-tile-delete" onClick={() => deleteFromBank(it)} aria-label={t(`מחיקת ${it.label} מהמאגר`, `Remove ${itemLabel(it)} from the library`)}><Trash2 className="h-3.5 w-3.5" /></button>
                )}
              </div>
              </Fragment>
            );
          })}
        </div>
      </section>

      {/* ---------- Printed list ---------- */}
      <section className="hidden print:block">
        <h3 className="mb-1 text-center font-display text-sm font-bold">{t("מסלול מוטורי", "Obstacle Course")}</h3>
        <ol className="space-y-0.5">
          {scheduled.map((it, i) => (
            <li key={it.id} className="flex break-inside-avoid items-center gap-1.5 border border-border px-1.5 py-0.5">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sage/70 text-[9px] font-bold">{i + 1}</span>
              <div className="flex h-[92px] w-[92px] shrink-0 items-center justify-center">
                {it.image ? <img src={it.image} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-3xl" aria-hidden>{it.emoji}</span>}
              </div>
              <span className="flex-1 text-xs font-medium">{t(it.label, itemLabel(it))}</span>
            </li>
          ))}
        </ol>
      </section>

      <Dialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Archive className="h-5 w-5" />{" "}{t("ארכיון מתקנים", "Equipment Archive")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t("כאן נשמרים המתקנים שהוסרת מבנק הקליניקה. אפשר להחזיר אותם למאגר בכל שלב.", "Equipment removed from the clinic library is stored here. You can return it at any time.")}</p>
          {removedEquipment.length > 0 ? (
            <>
              <div className="max-h-[55vh] overflow-y-auto py-2">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {removedEquipment.map((it) => (
                    <div key={it.id} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-cream">
                      <div className="flex aspect-square items-center justify-center p-3">
                        <img src={it.image} alt={t(it.label, itemLabel(it))} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div className="border-t border-border bg-background p-2 text-center">
                        <p className="mb-2 text-sm font-bold">{t(it.label, itemLabel(it))}</p>
                        <Button type="button" size="sm" variant="outline" onClick={() => restoreToBank(it.id)} className="w-full rounded-full">
                          <Undo2 className="h-3.5 w-3.5" />{" "}{t("החזרה למאגר", "Return to Library")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="button" variant="outline" onClick={restoreAllEquipment} className="w-full rounded-full">
                <RotateCcw className="h-4 w-4" />{" "}{t("החזרת כל המתקנים למאגר", "Return All Equipment to the Library")}
              </Button>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center">
              <Archive className="mx-auto mb-3 h-9 w-9 text-muted-foreground/60" />
              <p className="font-bold">{t("הארכיון ריק", "The Archive Is Empty")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("מתקנים שתסירי מבנק הקליניקה יופיעו כאן.", "Equipment removed from the clinic library will appear here.")}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MotorDemoDialog item={demoItem} frame={demoFrame} playing={demoPlaying} onPlayingChange={setDemoPlaying} onClose={() => setDemoItem(null)} />
    </AppShell>
  );
}
