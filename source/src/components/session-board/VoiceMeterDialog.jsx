import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, RotateCcw, X } from "lucide-react";

// A voice volume meter on the session board, for practicing a whisper, a talking voice or a big voice.
// The microphone level is measured in the browser moment by moment; nothing is recorded, saved or sent.
// The therapist picks the target zone; time spent in it fills a progress bar toward a short goal.

const ZONES = [
  { id: "whisper", he: "לחישה", en: "Whisper", color: "#7cc79a" },
  { id: "talk", he: "קול רגיל", en: "Talking voice", color: "#f2c94c" },
  { id: "loud", he: "קול חזק", en: "Big voice", color: "#ef8a7a" },
];
const ART = "/icon-bank/voice-meter/";
const GENDER_KEY = "boo_voice_meter_gender";
const SILENCE = 14; // below this it is room noise, not the child's voice
const GOALS = [3, 5, 10];

function zoneOf(level, limits) {
  if (level < SILENCE) return null;
  if (level < limits[0]) return "whisper";
  if (level < limits[1]) return "talk";
  return "loud";
}

export function VoiceMeterDialog({ language, onClose }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [status, setStatus] = useState("idle"); // idle | listening | denied | unsupported
  const [level, setLevel] = useState(0);
  const [target, setTarget] = useState("talk");
  const [sensitivity, setSensitivity] = useState(50);
  const [goal, setGoal] = useState(5);
  const [held, setHeld] = useState(0);
  const [gender, setGender] = useState(() => { try { return localStorage.getItem(GENDER_KEY) === "boy" ? "boy" : "girl"; } catch { return "girl"; } });
  const audio = useRef(null);
  const frame = useRef(0);
  const last = useRef(0);
  const settings = useRef({ target, sensitivity, goal });
  settings.current = { target, sensitivity, goal };

  // The two zone limits on the 0–100 scale; higher sensitivity makes a quieter voice reach the zones.
  const shift = (sensitivity - 50) * 0.3;
  const limits = [Math.max(15, 38 - shift), Math.max(35, 68 - shift)];
  const zone = zoneOf(level, limits);
  const done = held >= goal;

  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); stop(); };
  }, [onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  function stop() {
    cancelAnimationFrame(frame.current);
    const current = audio.current;
    audio.current = null;
    current?.stream.getTracks().forEach((track) => track.stop());
    current?.context.close().catch(() => {});
  }

  async function start() {
    if (!navigator.mediaDevices?.getUserMedia || !(window.AudioContext || window.webkitAudioContext)) { setStatus("unsupported"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = context.createAnalyser();
      analyser.fftSize = 1024;
      context.createMediaStreamSource(stream).connect(analyser);
      audio.current = { stream, context, analyser, data: new Float32Array(analyser.fftSize), smooth: 0 };
      last.current = performance.now();
      setHeld(0);
      setStatus("listening");
      tick();
    } catch {
      setStatus("denied");
    }
  }

  function tick() {
    const current = audio.current;
    if (!current) return;
    current.analyser.getFloatTimeDomainData(current.data);
    let sum = 0;
    for (const value of current.data) sum += value * value;
    const db = 20 * Math.log10(Math.sqrt(sum / current.data.length) || 1e-8); // dBFS: about -60 in a quiet room, -35 to -25 for talking, -15 and up for shouting
    const raw = Math.max(0, Math.min(100, ((db + 65) / 55) * 100 + (settings.current.sensitivity - 50) * 0.4));
    current.smooth = current.smooth * 0.8 + raw * 0.2;
    const now = performance.now();
    const elapsed = (now - last.current) / 1000;
    last.current = now;
    const { target: wanted, sensitivity: s, goal: g } = settings.current;
    const shiftNow = (s - 50) * 0.3;
    const inZone = zoneOf(current.smooth, [Math.max(15, 38 - shiftNow), Math.max(35, 68 - shiftNow)]) === wanted;
    setLevel(current.smooth);
    if (inZone) setHeld((value) => Math.min(g, value + elapsed));
    frame.current = requestAnimationFrame(tick);
  }

  function chooseGender(next) {
    setGender(next);
    try { localStorage.setItem(GENDER_KEY, next); } catch { /* storage may be blocked */ }
  }
  const picture = (name) => `${ART}${name}-${gender}.webp`;
  const facePicture = done && status === "listening" ? picture("celebrate") : picture(status === "listening" && zone ? zone : "quiet");
  const targetZone = ZONES.find((item) => item.id === target);
  const currentZone = ZONES.find((item) => item.id === zone);

  return (
    <div className="choice-board" role="dialog" aria-modal="true" aria-label={t("מד עוצמת קול", "Voice volume meter")}>
      <div className="choice-board-card voice-card">
        <button type="button" className="choice-board-close" onClick={onClose} aria-label={t("סגירה", "Close")}><X /></button>
        <h2>{t("מד עוצמת קול", "Voice volume meter")}</h2>

        <div className="voice-targets" role="group" aria-label={t("באיזה קול מתרגלים?", "Which voice are we practicing?")}>
          {ZONES.map((item) => (
            <button key={item.id} type="button" aria-pressed={target === item.id} onClick={() => { setTarget(item.id); setHeld(0); }}
              className={target === item.id ? "active" : ""} style={{ "--zone": item.color }}>
              <img src={picture(item.id)} alt="" />{t(item.he, item.en)}
            </button>
          ))}
        </div>

        <div className="voice-stage">
          <div className="voice-meter" aria-hidden="true">
            {[...ZONES].reverse().map((item) => {
              const [from, to] = item.id === "whisper" ? [0, limits[0]] : item.id === "talk" ? [limits[0], limits[1]] : [limits[1], 100];
              return <span key={item.id} className={`voice-zone${item.id === target ? " target" : ""}`} style={{ bottom: `${from}%`, height: `${to - from}%`, background: item.color }} />;
            })}
            <span className="voice-level" style={{ bottom: `${level}%` }} />
          </div>
          <div className="voice-face" style={{ "--zone": done && status === "listening" ? "#fff3c4" : currentZone?.color || "#ece6dc" }}>
            <span><img src={facePicture} alt="" /></span>
            <strong role="status">{status !== "listening" ? "" : currentZone ? t(currentZone.he, currentZone.en) : t("שקט", "Quiet")}</strong>
          </div>
        </div>

        {status === "listening" && (
          <div className={`voice-goal${done ? " done" : ""}`}>
            <div className="voice-goal-bar"><span style={{ width: `${(held / goal) * 100}%`, background: targetZone.color }} /></div>
            <p>{done
              ? t(`כל הכבוד! החזקת ${t(targetZone.he, targetZone.en)} ${goal} שניות 🌟`, `Great job! You held a ${targetZone.en.toLowerCase()} for ${goal} seconds 🌟`)
              : t(`להחזיק ${targetZone.he}: ${Math.floor(held)} מתוך ${goal} שניות`, `Hold a ${targetZone.en.toLowerCase()}: ${Math.floor(held)} of ${goal} seconds`)}</p>
            {done && <button type="button" className="voice-again" onClick={() => setHeld(0)}><RotateCcw aria-hidden="true" />{t("שוב", "Again")}</button>}
          </div>
        )}

        {status !== "listening" ? (
          <button type="button" className="voice-start" onClick={start}><Mic aria-hidden="true" />{t("הפעלת המיקרופון", "Turn on the microphone")}</button>
        ) : (
          <button type="button" className="voice-stop" onClick={() => { stop(); setStatus("idle"); setLevel(0); }}><MicOff aria-hidden="true" />{t("עצירה", "Stop")}</button>
        )}
        {status === "denied" && <p className="voice-error">{t("אין גישה למיקרופון. אפשר לאשר את המיקרופון בהגדרות הדפדפן ולנסות שוב.", "No access to the microphone. Allow the microphone in the browser settings and try again.")}</p>}
        {status === "unsupported" && <p className="voice-error">{t("הדפדפן הזה לא תומך במיקרופון. נסו דפדפן אחר.", "This browser does not support the microphone. Try another browser.")}</p>}

        <div className="voice-gender" role="group" aria-label={t("בן או בת", "Boy or girl")}>
          {[["girl", t("👧 בת", "👧 Girl")], ["boy", t("👦 בן", "👦 Boy")]].map(([id, label]) => (
            <button key={id} type="button" aria-pressed={gender === id} className={gender === id ? "active" : ""} onClick={() => chooseGender(id)}>{label}</button>
          ))}
        </div>

        <details className="voice-settings">
          <summary>{t("הגדרות למטפל/ת", "Therapist settings")}</summary>
          <label>{t("רגישות (לפי החדר והמכשיר)", "Sensitivity (depends on the room and device)")}
            <input type="range" min="0" max="100" value={sensitivity} onChange={(e) => setSensitivity(Number(e.target.value))} />
          </label>
          <div className="voice-goals" role="group" aria-label={t("כמה זמן להחזיק?", "How long to hold?")}>
            <span>{t("כמה זמן להחזיק:", "How long to hold:")}</span>
            {GOALS.map((value) => (
              <button key={value} type="button" aria-pressed={goal === value} className={goal === value ? "active" : ""} onClick={() => { setGoal(value); setHeld(0); }}>{t(`${value} שניות`, `${value} sec`)}</button>
            ))}
          </div>
          <p>{t("כדאי לכוון את הרגישות בתחילת המפגש: לבקש מהילד לדבר בקול רגיל ולהזיז עד שהמד בצהוב.", "Set the sensitivity at the start of the session: ask the child to talk in a normal voice and adjust until the meter is in yellow.")}</p>
        </details>
        <p className="voice-privacy">🔒 {t("שום דבר לא מוקלט או נשמר. המד רק מודד את עוצמת הקול ברגע זה.", "Nothing is recorded or saved. The meter only measures how loud it is right now.")}</p>
      </div>
    </div>
  );
}
