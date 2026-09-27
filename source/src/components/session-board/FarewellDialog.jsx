import { useEffect, useRef, useState } from "react";
import { Check, Plus, Printer, Star, X } from "lucide-react";
import { loadFarewell, saveFarewell } from "@/lib/farewell-storage";

const LEARNED_PRESETS = [
  ["לגזור לאורך קו", "Cut along a line"],
  ["לאחוז עיפרון נכון", "Hold a pencil correctly"],
  ["לכתוב את השם שלי", "Write my name"],
  ["לשבת יפה ליד השולחן", "Sit well at the table"],
  ["לבקש הפסקה כשצריך", "Ask for a break when I need one"],
  ["להירגע כשקשה לי", "Calm down when things are hard"],
  ["לחכות לתור שלי", "Wait for my turn"],
  ["לסיים משימה עד הסוף", "Finish a task"],
  ["לקפוץ על רגל אחת", "Hop on one foot"],
  ["לתפוס ולזרוק כדור", "Catch and throw a ball"],
];

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Opens the certificate on its own page and prints it.
function printCertificate({ language, name, learned }) {
  const he = language !== "en";
  const win = window.open("", "_blank");
  if (!win) return;
  const items = learned.map((item) => `<li>⭐ ${escapeHtml(item)}</li>`).join("");
  win.document.write(`<!doctype html><html lang="${he ? "he" : "en"}" dir="${he ? "rtl" : "ltr"}"><head><meta charset="utf-8"><title>${he ? "תעודת סיום" : "Certificate"}</title>
<style>
@page{size:A4 landscape;margin:12mm}
body{margin:0;font-family:Rubik,Arial,sans-serif;color:#40362f}
.c{box-sizing:border-box;min-height:180mm;padding:16mm 20mm;border:6mm solid #f8df9a;border-radius:12mm;text-align:center;background:#fffdf9;outline:2mm solid #bfe6d1;outline-offset:-10mm}
h1{margin:0 0 4mm;font-size:34pt}
.n{margin:6mm 0;font-size:40pt;font-weight:800;color:#5f9f7c}
p{margin:0 0 6mm;font-size:16pt}
ul{display:inline-block;margin:0;padding:0;list-style:none;text-align:${he ? "right" : "left"};font-size:15pt;line-height:1.8}
.s{margin-top:8mm;font-size:30pt}
</style></head><body><div class="c">
<div class="s">🏆</div>
<h1>${he ? "תעודת סיום" : "Certificate of Completion"}</h1>
<div class="n">${escapeHtml(name || (he ? "כל הכבוד!" : "Well done!"))}</div>
<p>${he ? "סיימת את הטיפול בהצלחה! עכשיו את/ה יודע/ת:" : "You finished therapy! Now you can:"}</p>
<ul>${items}</ul>
<div class="s">🌟 🌟 🌟</div>
</div><script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`);
  win.document.close();
}

// The farewell window: a star countdown of the sessions left, what the child learned, and a certificate.
export function FarewellDialog({ language, patientKey, patientName, onClose }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [tab, setTab] = useState("countdown");
  const [data, setData] = useState(() => loadFarewell(patientKey));
  const [custom, setCustom] = useState("");
  const [name, setName] = useState(patientName || "");
  const [message, setMessage] = useState("");
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    const timer = window.setTimeout(() => {
      saveFarewell(patientKey, data).catch(() => setMessage(t("השמירה נכשלה. נסי שוב.", "Saving failed. Please try again.")));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [data, patientKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const left = Math.max(0, data.total - data.filled);
  const presetLabel = (preset) => (language === "en" ? preset[1] : preset[0]);
  const toggleLearned = (label) => setData((d) => ({ ...d, learned: d.learned.includes(label) ? d.learned.filter((x) => x !== label) : [...d.learned, label] }));
  function addCustom(event) {
    event.preventDefault();
    const label = custom.trim();
    if (!label) return;
    if (!data.learned.includes(label)) setData((d) => ({ ...d, learned: [...d.learned, label] }));
    setCustom("");
  }
  const customItems = data.learned.filter((label) => !LEARNED_PRESETS.some((preset) => presetLabel(preset) === label));

  return (
    <div className="choice-board" role="dialog" aria-modal="true" aria-label={t("פרידה", "Farewell")}>
      <div className="choice-board-card farewell-card">
        <button type="button" className="choice-board-close" onClick={onClose} aria-label={t("סגירה", "Close")}><X /></button>
        <h2>{t("פרידה", "Farewell")}{patientName ? ` · ${patientName}` : ""}</h2>
        <div className="farewell-tabs" role="tablist">
          {[["countdown", "⭐", t("ספירה לאחור", "Countdown")], ["learned", "🌱", t("מה למדנו", "What we learned")], ["certificate", "🏆", t("תעודת סיום", "Certificate")]].map(([id, icon, label]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
              <span aria-hidden="true">{icon}</span> {label}
            </button>
          ))}
        </div>

        {tab === "countdown" && (
          <div className="farewell-countdown">
            <label className="farewell-total">
              {t("כמה מפגשים נשארו עד הסיום?", "How many sessions until the end?")}
              <select value={data.total} onChange={(e) => { const total = Number(e.target.value); setData((d) => ({ ...d, total, filled: Math.min(d.filled, total) })); }}>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <div className="farewell-stars">
              {Array.from({ length: data.total }, (_, i) => (
                <button key={i} type="button" className={i < data.filled ? "farewell-star filled" : "farewell-star"}
                  aria-label={t(`מפגש ${i + 1}`, `Session ${i + 1}`)} aria-pressed={i < data.filled}
                  onClick={() => setData((d) => ({ ...d, filled: i < d.filled ? i : i + 1 }))}>
                  <Star aria-hidden="true" />
                  <small>{i + 1}</small>
                </button>
              ))}
            </div>
            <p className="farewell-left">
              {left === 0 ? t("זה המפגש האחרון! 🎉", "This is the last session! 🎉") : left === 1 ? t("נשאר עוד מפגש אחד", "One more session left") : t(`נשארו עוד ${left} מפגשים`, `${left} more sessions left`)}
            </p>
            <p className="choice-board-hint">{t("בסוף כל מפגש הילד צובע כוכב.", "At the end of each session, the child colors a star.")}</p>
          </div>
        )}

        {tab === "learned" && (
          <div className="farewell-learned">
            <p className="choice-board-hint">{t("סמנו מה הילד יודע לעשות היום. זה ייכנס לתעודת הסיום.", "Mark what the child can do now. It goes on the certificate.")}</p>
            <div className="farewell-chips">
              {[...LEARNED_PRESETS.map(presetLabel), ...customItems].map((label) => {
                const on = data.learned.includes(label);
                return (
                  <button key={label} type="button" aria-pressed={on} className={on ? "farewell-chip on" : "farewell-chip"} onClick={() => toggleLearned(label)}>
                    {on ? <Check aria-hidden="true" /> : null}{label}
                  </button>
                );
              })}
            </div>
            <form className="farewell-add" onSubmit={addCustom}>
              <input value={custom} maxLength={60} onChange={(e) => setCustom(e.target.value)} placeholder={t("להוסיף משהו אחר...", "Add something else...")} />
              <button type="submit" disabled={!custom.trim()}><Plus aria-hidden="true" />{t("הוספה", "Add")}</button>
            </form>
          </div>
        )}

        {tab === "certificate" && (
          <div className="farewell-certificate">
            <label className="farewell-name">
              {t("שם על התעודה (שם פרטי)", "Name on the certificate (first name)")}
              <input value={name} maxLength={30} onChange={(e) => setName(e.target.value)} />
            </label>
            <div className="farewell-cert-preview" aria-label={t("תצוגה מקדימה של התעודה", "Certificate preview")}>
              <div className="farewell-cert-trophy" aria-hidden="true">🏆</div>
              <strong>{t("תעודת סיום", "Certificate of Completion")}</strong>
              <span className="farewell-cert-name">{name || t("כל הכבוד!", "Well done!")}</span>
              <span>{t("סיימת את הטיפול בהצלחה! עכשיו את/ה יודע/ת:", "You finished therapy! Now you can:")}</span>
              {data.learned.length
                ? <ul>{data.learned.map((item) => <li key={item}>⭐ {item}</li>)}</ul>
                : <em>{t("עוד לא סימנתם מה הילד למד. אפשר לסמן בלשונית \"מה למדנו\".", "Nothing is marked yet. Mark it under \"What we learned\".")}</em>}
            </div>
            <div className="choice-board-actions">
              <button type="button" className="choice-primary" onClick={() => printCertificate({ language, name, learned: data.learned })}>
                <Printer aria-hidden="true" /> {t("הדפסת התעודה", "Print the certificate")}
              </button>
            </div>
          </div>
        )}
        {message && <p className="my-images-error" role="alert">{message}</p>}
      </div>
    </div>
  );
}
