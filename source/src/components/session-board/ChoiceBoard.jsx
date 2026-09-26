import { useState } from "react";
import { Check, X } from "lucide-react";

// Choice board ("what do you choose?", 2–3 options) and first-then board, shown over the session
// board (also in full screen). The therapist picks the options from the board and the built-in games,
// then shows them to the child in large cards. `mode` is "choice" or "firstThen".
export function ChoiceBoard({ mode, language, options, onStart, onClose }) {
  const t = (he, en) => (language === "en" ? en : he);
  const isChoice = mode === "choice";
  const max = isChoice ? 3 : 2;
  const [picked, setPicked] = useState([]); // option keys, in the order picked
  const [showing, setShowing] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [firstDone, setFirstDone] = useState(false);
  const pickedOptions = picked.map((key) => options.find((option) => option.key === key)).filter(Boolean);
  const ready = isChoice ? pickedOptions.length >= 2 : pickedOptions.length === 2;

  function toggle(key) {
    setPicked((current) => (current.includes(key) ? current.filter((k) => k !== key) : current.length >= max ? current : [...current, key]));
  }
  function start(option) {
    onStart(option);
    onClose();
  }

  const title = isChoice ? t("לוח בחירה", "Choice board") : t("קודם - אחר כך", "First - then");

  return (
    <div className="choice-board" role="dialog" aria-modal="true" aria-label={title}>
      <div className={showing ? "choice-board-card showing" : "choice-board-card"}>
        <button type="button" className="choice-board-close" onClick={onClose} aria-label={t("סגירה", "Close")}><X /></button>

        {!showing ? (
          <>
            <h2>{title}</h2>
            <p className="choice-board-hint">
              {isChoice ? t("בחרי 2 או 3 אפשרויות להציע לילד.", "Pick 2 or 3 options to offer the child.") : t("בחרי מה קודם ומה אחר כך, לפי הסדר.", "Pick what comes first and what comes next, in order.")}
            </p>
            <div className="choice-board-options">
              {options.map((option) => {
                const index = picked.indexOf(option.key);
                return (
                  <button key={option.key} type="button" className={index >= 0 ? "choice-option picked" : "choice-option"} aria-pressed={index >= 0} onClick={() => toggle(option.key)}>
                    <span className="choice-option-image">{option.image ? <img src={option.image} alt="" /> : null}</span>
                    <span className="choice-option-title">{option.title}</span>
                    {index >= 0 && <span className="choice-option-badge">{isChoice ? <Check /> : index === 0 ? t("קודם", "First") : t("אחר כך", "Then")}</span>}
                  </button>
                );
              })}
              {!options.length && <p className="choice-board-hint">{t("הלוח ריק. הוסיפי פעילויות ללוח או בחרי משחקים.", "The board is empty. Add activities or pick games.")}</p>}
            </div>
            <div className="choice-board-actions">
              <button type="button" className="choice-primary" disabled={!ready} onClick={() => { setShowing(true); setChosen(null); setFirstDone(false); }}>{t("הצגה לילד", "Show the child")}</button>
              <button type="button" onClick={onClose}>{t("ביטול", "Cancel")}</button>
            </div>
          </>
        ) : isChoice ? (
          <>
            <h2 className="choice-board-question">{t("מה בוחרים?", "What do you choose?")}</h2>
            <div className={`choice-board-show count-${pickedOptions.length}`}>
              {pickedOptions.map((option) => (
                <button key={option.key} type="button" onClick={() => setChosen(option.key)} aria-pressed={chosen === option.key}
                  className={chosen ? (chosen === option.key ? "choice-big chosen" : "choice-big faded") : "choice-big"}>
                  <span className="choice-big-image">{option.image ? <img src={option.image} alt="" /> : null}</span>
                  <span className="choice-big-title">{option.title}</span>
                  {chosen === option.key && <span className="choice-big-check"><Check /></span>}
                </button>
              ))}
            </div>
            <div className="choice-board-actions">
              <button type="button" className="choice-primary" disabled={!chosen} onClick={() => start(pickedOptions.find((option) => option.key === chosen))}>{t("מתחילים!", "Let's start!")}</button>
              {chosen && <button type="button" onClick={() => setChosen(null)}>{t("בחירה מחדש", "Choose again")}</button>}
              <button type="button" onClick={() => setShowing(false)}>{t("חזרה לעריכה", "Back to editing")}</button>
            </div>
          </>
        ) : (
          <>
            <div className="choice-board-show first-then">
              {pickedOptions.map((option, index) => (
                <div key={option.key} className="first-then-slot">
                  <strong className="first-then-label">{index === 0 ? t("קודם", "First") : t("אחר כך", "Then")}</strong>
                  <button type="button" disabled={index !== 0} onClick={() => setFirstDone((done) => !done)} aria-pressed={index === 0 ? firstDone : undefined}
                    className={index === 0 && firstDone ? "choice-big chosen" : "choice-big"}>
                    <span className="choice-big-image">{option.image ? <img src={option.image} alt="" /> : null}</span>
                    <span className="choice-big-title">{option.title}</span>
                    {index === 0 && firstDone && <span className="choice-big-check"><Check /></span>}
                  </button>
                </div>
              ))}
            </div>
            <p className="choice-board-hint">{t("לחיצה על \"קודם\" מסמנת שסיימנו אותו.", "Tap \"First\" when it is done.")}</p>
            <div className="choice-board-actions">
              <button type="button" className="choice-primary" onClick={() => start(pickedOptions[0])}>{t("מתחילים!", "Let's start!")}</button>
              <button type="button" onClick={() => setShowing(false)}>{t("חזרה לעריכה", "Back to editing")}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
