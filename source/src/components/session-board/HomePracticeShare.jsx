import { useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { ShareLinkField } from "@/components/ShareLinkField";

// "Send to parents": the therapist ticks activities from the board and gets a link to a page with
// them (/shared/home-practice?a=...). The link holds only activity ids, never the child's name.
export function HomePracticeShare({ language, activities, onClose }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [picked, setPicked] = useState(() => activities.map((activity) => activity.id));
  const [copied, setCopied] = useState(false);
  const prefix = language === "en" ? "/en" : "";
  const link = picked.length ? `${window.location.origin}${prefix}/shared/home-practice?a=${picked.join(",")}` : "";
  const message = t("פעילויות לתרגול בבית מלוח המפגש:", "Activities to practice at home:");

  function toggle(id) {
    setCopied(false);
    setPicked((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  }
  async function copy() {
    try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setCopied(false); }
  }

  return (
    <div className="choice-board" role="dialog" aria-modal="true" aria-label={t("שליחה להורים", "Send to parents")}>
      <div className="choice-board-card home-practice-card">
        <button type="button" className="choice-board-close" onClick={onClose} aria-label={t("סגירה", "Close")}><X /></button>
        <h2>{t("שליחה להורים", "Send to parents")}</h2>
        <p className="choice-board-hint">{t("סמני אילו פעילויות לשלוח לתרגול בבית. הקישור לא כולל את שם הילד.", "Tick the activities to practice at home. The link does not include the child's name.")}</p>
        {activities.length ? (
          <div className="choice-board-options">
            {activities.map((activity) => (
              <button key={activity.id} type="button" className={picked.includes(activity.id) ? "choice-option picked" : "choice-option"} aria-pressed={picked.includes(activity.id)} onClick={() => toggle(activity.id)}>
                <span className="choice-option-image">{activity.image ? <img src={activity.image} alt="" /> : null}</span>
                <span className="choice-option-title">{activity.title}</span>
                {picked.includes(activity.id) && <span className="choice-option-badge"><Check /></span>}
              </button>
            ))}
          </div>
        ) : (
          <p className="choice-board-hint">{t("אין עדיין פעילויות בלוח. הוסיפי פעילויות ואז אפשר לשלוח אותן.", "There are no activities on the board yet. Add some, then send them.")}</p>
        )}
        {link && (
          <div className="home-practice-link">
            <ShareLinkField value={link} className="home-practice-input" />
            <div className="choice-board-actions">
              <button type="button" className="choice-primary" onClick={copy}>{copied ? <><Check className="inline h-4 w-4" /> {t("הקישור הועתק", "Link copied")}</> : <><Copy className="inline h-4 w-4" /> {t("העתקת הקישור", "Copy the link")}</>}</button>
              <a className="home-practice-whatsapp" href={`https://wa.me/?text=${encodeURIComponent(`${message}\n${link}`)}`} target="_blank" rel="noopener noreferrer">{t("שליחה בוואטסאפ", "Send on WhatsApp")}</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
