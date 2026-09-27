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

// The certificate: an illustrated background (boy or girl) with the title, name and what the child
// learned written on it. Sizes are in container units so the preview and the printed page match.
const CERT_STYLE = `
.cert{position:relative;width:100%;aspect-ratio:1492/1054;container-type:inline-size;background:#fffdf7 center/100% 100% no-repeat;color:#40362f;font-family:Rubik,Arial,sans-serif}
.cert-title{position:absolute;left:25%;width:50%;top:6.2%;height:10%;display:grid;place-items:center;font-size:4.4cqw;font-weight:800;color:#8a6414}
.cert-body{position:absolute;left:22%;width:49%;top:25%;bottom:14%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2cqw;text-align:center}
.cert-name{font-size:6cqw;font-weight:800;color:#4f9670;line-height:1.1}
.cert-line{font-size:2.2cqw;font-weight:600}
.cert-list{margin:0;padding:0;list-style:none;font-size:var(--cert-item,2cqw);line-height:1.55}
`;

function certificateHtml({ language, gender, name, learned }) {
  const he = language !== "en";
  const line = he
    ? (gender === "girl" ? "סיימת את הטיפול בהצלחה! עכשיו את יודעת:" : "סיימת את הטיפול בהצלחה! עכשיו אתה יודע:")
    : "You finished therapy! Now you can:";
  const itemSize = learned.length > 6 ? "1.6cqw" : learned.length > 4 ? "1.8cqw" : "2.1cqw";
  const items = learned.map((item) => `<li>⭐ ${escapeHtml(item)}</li>`).join("");
  return `<div class="cert" dir="${he ? "rtl" : "ltr"}" style="background-image:url('${window.location.origin}/icon-bank/certificate/${gender === "girl" ? "girl" : "boy"}.webp');--cert-item:${itemSize}">
<div class="cert-title">${he ? "תעודת סיום" : "Certificate"}</div>
<div class="cert-body"><div class="cert-name">${escapeHtml(name || (he ? "כל הכבוד!" : "Well done!"))}</div>
<div class="cert-line">${line}</div>${items ? `<ul class="cert-list">${items}</ul>` : ""}</div></div>`;
}

// Opens the certificate on its own page, fitted to an A4 landscape sheet, and prints it.
function printCertificate(options) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${options.language === "en" ? "Certificate" : "תעודת סיום"}</title>
<style>@page{size:A4 landscape;margin:0}html,body{margin:0}body{display:grid;place-items:center;min-height:100vh;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{width:297mm;max-width:100vw}${CERT_STYLE}</style>
</head><body><div class="page">${certificateHtml(options)}</div><script>const img=new Image();img.onload=()=>setTimeout(()=>window.print(),200);img.src=document.querySelector(".cert").style.backgroundImage.slice(5,-2);<\/script></body></html>`);
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
  const gender = data.gender === "girl" ? "girl" : "boy";
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
            <div className="farewell-gender" role="radiogroup" aria-label={t("תעודה לבן או לבת", "Certificate for a boy or a girl")}>
              {[["boy", t("בן", "Boy")], ["girl", t("בת", "Girl")]].map(([value, label]) => (
                <button key={value} type="button" role="radio" aria-checked={gender === value} className={gender === value ? "active" : ""} onClick={() => setData((d) => ({ ...d, gender: value }))}>{label}</button>
              ))}
            </div>
            <style>{CERT_STYLE}</style>
            <div className="farewell-cert-preview" aria-label={t("תצוגה מקדימה של התעודה", "Certificate preview")}
              dangerouslySetInnerHTML={{ __html: certificateHtml({ language, gender, name, learned: data.learned }) }} />
            {!data.learned.length && <p className="choice-board-hint">{t("עוד לא סימנתם מה הילד למד. אפשר לסמן בלשונית \"מה למדנו\".", "Nothing is marked yet. Mark it under \"What we learned\".")}</p>}
            <div className="choice-board-actions">
              <button type="button" className="choice-primary" onClick={() => printCertificate({ language, gender, name, learned: data.learned })}>
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
