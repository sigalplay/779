import { useEffect, useState } from "react";
import { Check, Pause, Play, X } from "lucide-react";

// "What helps me calm down?" on the session board: breathing together, counting together,
// and the child's own card of what helps. The card is kept per client in this browser.
const LOCAL_KEY = "boo_calm_v1";

const HELPERS = [
  { id: "breathe", emoji: "🌬️", he: "לנשום עמוק", en: "Take deep breaths", tab: "breathe" },
  { id: "count", emoji: "🔢", he: "לספור עד 10", en: "Count to 10", tab: "count" },
  { id: "water", emoji: "💧", he: "לשתות מים", en: "Drink water" },
  { id: "bubbles", emoji: "🫧", he: "לנשוף בועות", en: "Blow bubbles" },
  { id: "squeeze", emoji: "✊", he: "ללחוץ על כדור", en: "Squeeze a ball" },
  { id: "self-hug", emoji: "🤗", he: "לחבק את עצמי חזק", en: "Give myself a tight hug" },
  { id: "teddy", emoji: "🧸", he: "לחבק בובה", en: "Hug a soft toy" },
  { id: "quiet", emoji: "🛋️", he: "לשבת בפינה שקטה", en: "Sit in a quiet corner" },
  { id: "music", emoji: "🎧", he: "לשמוע מוזיקה", en: "Listen to music" },
  { id: "jump", emoji: "🦘", he: "לקפוץ", en: "Jump" },
  { id: "wall", emoji: "🧱", he: "לדחוף את הקיר", en: "Push the wall" },
  { id: "draw", emoji: "🎨", he: "לצייר", en: "Draw" },
  { id: "break", emoji: "✋", he: "לבקש הפסקה", en: "Ask for a break" },
  { id: "help", emoji: "🙋", he: "לבקש עזרה", en: "Ask for help" },
];

function readAll() {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}; } catch { return {}; }
}

export function CalmDialog({ language, patientKey, patientName, onClose }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [tab, setTab] = useState("breathe");
  const [picked, setPicked] = useState(() => readAll()[patientKey] || []);

  useEffect(() => {
    try { localStorage.setItem(LOCAL_KEY, JSON.stringify({ ...readAll(), [patientKey]: picked })); } catch { /* storage blocked */ }
  }, [patientKey, picked]);

  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggle = (id) => setPicked((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));
  const tabs = [["breathe", "🌬️", t("נושמים", "Breathe")], ["count", "🔢", t("סופרים", "Count")], ["helps", "💛", t("מה עוזר לי?", "What helps me?")]];

  return (
    <div className="choice-board" role="dialog" aria-modal="true" aria-label={t("מה עוזר לי להירגע?", "What helps me calm down?")}>
      <div className="choice-board-card calm-card">
        <button type="button" className="choice-board-close" onClick={onClose} aria-label={t("סגירה", "Close")}><X /></button>
        <h2>{t("מה עוזר לי להירגע?", "What helps me calm down?")}{patientName ? ` · ${patientName}` : ""}</h2>
        <div className="farewell-tabs" role="tablist">
          {tabs.map(([id, icon, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
              <span aria-hidden="true">{icon}</span> {label}
            </button>
          ))}
        </div>
        {tab === "breathe" && <Breathing t={t} />}
        {tab === "count" && <Counting t={t} />}
        {tab === "helps" && (
          <div className="calm-helps">
            {picked.length > 0 && (
              <section className="calm-mine" aria-label={t("הכרטיס שלי", "My card")}>
                <strong>{t("כשקשה לי, זה עוזר לי:", "When it's hard, this helps me:")}</strong>
                <div className="calm-mine-list">
                  {picked.map((id) => HELPERS.find((helper) => helper.id === id)).filter(Boolean).map((helper) => (
                    <button key={helper.id} type="button" className="calm-mine-card" onClick={() => (helper.tab ? setTab(helper.tab) : undefined)} disabled={!helper.tab}>
                      <span aria-hidden="true">{helper.emoji}</span>{t(helper.he, helper.en)}
                    </button>
                  ))}
                </div>
              </section>
            )}
            <p className="choice-board-hint">{t("הילד בוחר מה עוזר לו. הבחירות נשמרות לילד הזה.", "The child picks what helps. The choices are kept for this child.")}</p>
            <div className="calm-options">
              {HELPERS.map((helper) => {
                const on = picked.includes(helper.id);
                return (
                  <button key={helper.id} type="button" aria-pressed={on} className={on ? "calm-option on" : "calm-option"} onClick={() => toggle(helper.id)}>
                    {on && <span className="calm-option-check"><Check aria-hidden="true" /></span>}
                    <span className="calm-option-emoji" aria-hidden="true">{helper.emoji}</span>
                    {t(helper.he, helper.en)}
                  </button>
                );
              })}
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
