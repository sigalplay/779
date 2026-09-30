import { useEffect, useState } from "react";
import { ArrowRight, Check, Pause, Pin, Play, X } from "lucide-react";
import { CALM_HELPERS, calmHelperImage, getCalmGender, getCalmPicked, setCalmGender, setCalmPicked } from "@/lib/session-board-tools";

// "What helps me calm down?" on the session board: the child's own card of what helps (shown first),
// with breathing together and counting together one tap away. The card and the boy/girl pictures are
// kept per client in this browser. Chosen cards can also be placed on the board as round stickers.
export function CalmDialog({ language, patientKey, patientName, onAddToBoard, onClose }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [view, setView] = useState("helps"); // "helps" | "breathe" | "count"
  const [picked, setPicked] = useState(() => getCalmPicked(patientKey));
  const [gender, setGender] = useState(() => getCalmGender(patientKey));

  useEffect(() => { setCalmPicked(patientKey, picked); }, [patientKey, picked]);
  useEffect(() => { setCalmGender(patientKey, gender); }, [patientKey, gender]);

  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (id) => setPicked((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));
  const pickedHelpers = picked.map((id) => CALM_HELPERS.find((helper) => helper.id === id)).filter(Boolean);
  function addToBoard() {
    pickedHelpers.forEach((helper) => onAddToBoard({ ...helper, asset: calmHelperImage(helper, gender) }));
    onClose();
  }

  return (
    <div className="choice-board" role="dialog" aria-modal="true" aria-label={t("מה עוזר לי להירגע?", "What helps me calm down?")}>
      <div className="choice-board-card calm-card">
        <button type="button" className="choice-board-close" onClick={onClose} aria-label={t("סגירה", "Close")}><X /></button>
        <h2>{t("מה עוזר לי להירגע?", "What helps me calm down?")}{patientName ? ` · ${patientName}` : ""}</h2>
        {view !== "helps" && (
          <button type="button" className="calm-back" onClick={() => setView("helps")}><ArrowRight aria-hidden="true" />{t("חזרה למה עוזר לי", "Back to what helps me")}</button>
        )}
        {view === "breathe" && <Breathing t={t} />}
        {view === "count" && <Counting t={t} />}
        {view === "helps" && (
          <div className="calm-helps">
            {pickedHelpers.length > 0 && (
              <section className="calm-mine" aria-label={t("הכרטיס שלי", "My card")}>
                <strong>{t("כשקשה לי, זה עוזר לי:", "When it's hard, this helps me:")}</strong>
                <div className="calm-mine-list">
                  {pickedHelpers.map((helper) => (
                    <button key={helper.id} type="button" className="calm-mine-card" onClick={() => (helper.tab ? setView(helper.tab) : undefined)} disabled={!helper.tab}>
                      <img src={calmHelperImage(helper, gender)} alt="" />{t(helper.he, helper.en)}
                    </button>
                  ))}
                </div>
                {onAddToBoard && (
                  <button type="button" className="calm-add-board" onClick={addToBoard}><Pin aria-hidden="true" />{t("הוספה ללוח", "Add to the board")}</button>
                )}
              </section>
            )}
            <div className="calm-helps-head">
              <p className="choice-board-hint">{t("הילד בוחר מה עוזר לו. הבחירות נשמרות לילד הזה.", "The child picks what helps. The choices are kept for this child.")}</p>
              <div className="calm-settings" role="group" aria-label={t("בן או בת", "Boy or girl")}>
                {[["boy", t("👦 בן", "👦 Boy")], ["girl", t("👧 בת", "👧 Girl")]].map(([id, label]) => (
                  <button key={id} type="button" aria-pressed={gender === id} className={gender === id ? "on" : ""} onClick={() => setGender(id)}>{label}</button>
                ))}
              </div>
            </div>
            <div className="calm-options">
              {CALM_HELPERS.map((helper) => {
                const on = picked.includes(helper.id);
                return (
                  <button key={helper.id} type="button" aria-pressed={on} className={on ? "calm-option on" : "calm-option"} onClick={() => toggle(helper.id)}>
                    {on && <span className="calm-option-check"><Check aria-hidden="true" /></span>}
                    <img className="calm-option-image" src={calmHelperImage(helper, gender)} alt="" loading="lazy" />
                    {t(helper.he, helper.en)}
                  </button>
                );
              })}
            </div>
            <div className="calm-exercises">
              <button type="button" onClick={() => setView("breathe")}><span aria-hidden="true">🌸</span>{t("נושמים יחד", "Breathe together")}</button>
              <button type="button" onClick={() => setView("count")}><span aria-hidden="true">🔢</span>{t("סופרים יחד", "Count together")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Breathe in while the circle grows, breathe out while it shrinks.
function Breathing({ t }) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState("in");
  const [breath, setBreath] = useState(0);
  const [seconds, setSeconds] = useState(4);
  const [total, setTotal] = useState(5);
  const done = !running && breath >= total;

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setTimeout(() => {
      if (phase === "in") { setPhase("out"); return; }
      if (breath + 1 >= total) { setBreath(total); setRunning(false); setPhase("in"); return; }
      setBreath((n) => n + 1);
      setPhase("in");
    }, seconds * 1000);
    return () => window.clearTimeout(id);
  }, [running, phase, breath, seconds, total]);

  function start() {
    if (running) { setRunning(false); return; }
    if (breath >= total) setBreath(0);
    setPhase("in");
    // Let the circle start small, then grow.
    window.requestAnimationFrame(() => setRunning(true));
  }

  const big = running && phase === "in";
  return (
    <div className="calm-breathe">
      <div className="calm-circle-wrap">
        <div className={big ? "calm-circle big" : "calm-circle"} style={{ transitionDuration: `${seconds}s` }}>
          <span className="calm-circle-emoji" aria-hidden="true">{done ? "🌟" : running && phase === "out" ? "🕯️" : "🌸"}</span>
        </div>
      </div>
      <p className="calm-say" role="status">
        {done ? t("כל הכבוד! 🌟", "Well done! 🌟")
          : !running ? t("מוכנים? נושמים יחד", "Ready? Let's breathe together")
            : phase === "in" ? t("שואפים… מריחים את הפרח", "Breathe in… smell the flower")
              : t("נושפים… מכבים את הנר", "Breathe out… blow out the candle")}
      </p>
      <p className="calm-progress">{t(`נשימה ${Math.min(breath + (running ? 1 : 0), total)} מתוך ${total}`, `Breath ${Math.min(breath + (running ? 1 : 0), total)} of ${total}`)}</p>
      <div className="calm-settings">
        <span className="calm-setting-group">
          <span>{t("קצב:", "Pace:")}</span>
          {[[3, t("מהיר", "Quick")], [4, t("רגיל", "Regular")], [5, t("איטי", "Slow")]].map(([value, label]) => (
            <button key={value} type="button" aria-pressed={seconds === value} className={seconds === value ? "on" : ""} onClick={() => setSeconds(value)}>{label}</button>
          ))}
        </span>
        <span className="calm-setting-group">
          <span>{t("נשימות:", "Breaths:")}</span>
          {[3, 5, 10].map((value) => (
            <button key={value} type="button" aria-pressed={total === value} className={total === value ? "on" : ""} onClick={() => { setTotal(value); setRunning(false); setBreath(0); setPhase("in"); }}>{value}</button>
          ))}
        </span>
      </div>
      <div className="choice-board-actions">
        <button type="button" className="choice-primary calm-start" onClick={start}>
          {running ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          {running ? t("עצירה", "Stop") : done ? t("שוב", "Again") : t("התחלה", "Start")}
        </button>
      </div>
    </div>
  );
}

// Counting together, a number at a time, up or down.
function Counting({ t }) {
  const [total, setTotal] = useState(10);
  const [down, setDown] = useState(false);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const done = step >= total;

  useEffect(() => {
    if (!running) return undefined;
    if (step >= total) { setRunning(false); return undefined; }
    const id = window.setTimeout(() => setStep((n) => n + 1), step === 0 ? 300 : 1500);
    return () => window.clearTimeout(id);
  }, [running, step, total]);

  function start() {
    if (running) { setRunning(false); return; }
    if (done) setStep(0);
    setRunning(true);
  }
  const shown = step === 0 ? "" : down ? total - step + 1 : step;
  return (
    <div className="calm-count">
      <div className="calm-number" aria-live="polite">{done ? "🌟" : shown || "·"}</div>
      <div className="calm-dots" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => <span key={i} className={i < step ? "on" : ""} />)}
      </div>
      <p className="calm-say">{done ? t("כל הכבוד! אפשר להמשיך 🌟", "Well done! Ready to go on 🌟") : t("סופרים יחד, לאט ובשקט", "Count together, slowly and quietly")}</p>
      <div className="calm-settings">
        {[5, 10].map((value) => (
          <button key={value} type="button" aria-pressed={total === value} className={total === value ? "on" : ""} onClick={() => { setTotal(value); setStep(0); setRunning(false); }}>{t(`עד ${value}`, `To ${value}`)}</button>
        ))}
        <button type="button" aria-pressed={!down} className={!down ? "on" : ""} onClick={() => { setDown(false); setStep(0); setRunning(false); }}>{t("עולה ↑", "Up ↑")}</button>
        <button type="button" aria-pressed={down} className={down ? "on" : ""} onClick={() => { setDown(true); setStep(0); setRunning(false); }}>{t("ספירה לאחור ↓", "Countdown ↓")}</button>
      </div>
      <div className="choice-board-actions">
        <button type="button" className="choice-primary calm-start" onClick={start}>
          {running ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          {running ? t("עצירה", "Stop") : done ? t("שוב", "Again") : t("התחלה", "Start")}
        </button>
      </div>
    </div>
  );
}
