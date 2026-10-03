import { useEffect, useRef, useState } from "react";
import { Camera, ImageOff, Plus, RotateCcw, X } from "lucide-react";

// "Who starts?" on the session board: eeny meeny (אן דן דינו), a draw, or rock paper scissors.
// The players' names, and photos if added, are kept per client in this browser only. Photos are never uploaded.
const STORAGE_KEY = "boo_who_starts_v1";
const PHOTOS_KEY = "boo_who_starts_photos_v1";
const PHOTO_SIZE = 192;
const ART = "/icon-bank/who-starts/";
const ANIMALS = ["dog", "cat", "rabbit", "fox", "panda", "frog", "lion", "bear"].map((id) => `${ART}${id}.webp`);
// Shown next to the names in the rock paper scissors menus, where pictures cannot go.
const AVATARS = ["🐶", "🐱", "🐰", "🦊", "🐼", "🐸", "🦁", "🐻"];
const COLORS = ["#f9d0de", "#bcdcf2", "#bfe6d1", "#fbe7a1", "#e6dcf5", "#f6c3b5", "#d8ecc6", "#f8df9a"];
const MAX_PLAYERS = 8;
const RHYME_HE = ["אֶן", "דֶּן", "דִּינוֹ", "סָק", "לָה", "מִינוֹ", "סָק", "לָה", "טָקָה", "אֶן", "דֶּן", "דּוֹ"];
const RHYME_EN = ["Eeny", "meeny", "miny", "moe", "catch", "a", "tiger", "by", "the", "toe"];
const HANDS = [
  { id: "rock", image: `${ART}rock.webp`, he: "אבן", en: "Rock", beats: "scissors" },
  { id: "paper", image: `${ART}paper.webp`, he: "נייר", en: "Paper", beats: "rock" },
  { id: "scissors", image: `${ART}scissors.webp`, he: "מספריים", en: "Scissors", beats: "paper" },
];

function readPlayers(patientKey) {
  try {
    const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")[patientKey];
    return Array.isArray(list) && list.length >= 2 ? list.slice(0, MAX_PLAYERS).map(String) : null;
  } catch { return null; }
}

function savePlayers(patientKey, players) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    all[patientKey] = players;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch { /* storage is optional */ }
}

function readPhotos(patientKey) {
  try {
    const list = JSON.parse(localStorage.getItem(PHOTOS_KEY) || "{}")[patientKey];
    return Array.isArray(list) ? list.map((photo) => (typeof photo === "string" && photo.startsWith("data:image/") ? photo : null)) : [];
  } catch { return []; }
}

function savePhotos(patientKey, photos) {
  try {
    const all = JSON.parse(localStorage.getItem(PHOTOS_KEY) || "{}");
    if (photos.some(Boolean)) all[patientKey] = photos; else delete all[patientKey];
    localStorage.setItem(PHOTOS_KEY, JSON.stringify(all));
  } catch { /* storage is optional */ }
}

// A small square photo, cropped to the middle, so it fits in the browser's storage.
function photoFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const side = Math.min(image.naturalWidth, image.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = PHOTO_SIZE; canvas.height = PHOTO_SIZE;
      canvas.getContext("2d").drawImage(image, (image.naturalWidth - side) / 2, (image.naturalHeight - side) / 2, side, side, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image")); };
    image.src = url;
  });
}

function Avatar({ photo, index }) {
  return photo ? <img className="who-photo" src={photo} alt="" /> : <img className="who-avatar" src={ANIMALS[index]} alt="" />;
}

const randomIndex = (length) => Math.floor(Math.random() * length);

export function WhoStartsDialog({ language, patientKey, patientName, onClose }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [mode, setMode] = useState("rhyme"); // "rhyme" | "draw" | "rps"
  const [players, setPlayers] = useState(() => readPlayers(patientKey) || [patientName || t("אני", "Me"), t("המטפלת", "Therapist")]);
  const [photos, setPhotos] = useState(() => readPhotos(patientKey));
  const [editing, setEditing] = useState(false);

  useEffect(() => { savePlayers(patientKey, players); }, [patientKey, players]);
  useEffect(() => { savePhotos(patientKey, photos.slice(0, players.length)); }, [patientKey, photos, players.length]);

  const setPhoto = (i, photo) => setPhotos((list) => { const next = [...list]; while (next.length <= i) next.push(null); next[i] = photo; return next; });
  async function pickPhoto(i, event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try { setPhoto(i, await photoFromFile(file)); } catch { /* not an image */ }
  }
  function removePlayer(i) {
    setPlayers((list) => list.filter((_, j) => j !== i));
    setPhotos((list) => list.filter((_, j) => j !== i));
  }

  useEffect(() => {
    const onKey = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const names = players.map((name, i) => name.trim() || t(`שחקן ${i + 1}`, `Player ${i + 1}`));
  const modes = [
    ["rhyme", `${ART}rhyme.webp`, t("אן דן דינו", "Eeny meeny")],
    ["draw", `${ART}draw.webp`, t("הגרלה", "Draw")],
    ["rps", `${ART}rock.webp`, t("אבן, נייר ומספריים", "Rock paper scissors")],
  ];

  return (
    <div className="choice-board" role="dialog" aria-modal="true" aria-label={t("מי מתחיל?", "Who starts?")}>
      <div className="choice-board-card who-card">
        <button type="button" className="choice-board-close" onClick={onClose} aria-label={t("סגירה", "Close")}><X /></button>
        <h2>{t("מי מתחיל?", "Who starts?")}</h2>
        <div className="who-modes" role="tablist">
          {modes.map(([id, image, label]) => (
            <button key={id} type="button" role="tab" aria-selected={mode === id} className={mode === id ? "on" : ""} onClick={() => setMode(id)}>
              <img src={image} alt="" />{label}
            </button>
          ))}
        </div>
        <section className="who-players" aria-label={t("המשתתפים", "Players")}>
          {editing ? (
            <div className="who-edit">
              {players.map((name, i) => (
                <span key={i} className="who-edit-row" style={{ background: COLORS[i] }}>
                  <label className="who-photo-pick" title={t("הוספת תמונה", "Add a photo")}>
                    <Avatar photo={photos[i]} index={i} />
                    <span className="who-photo-badge" aria-hidden="true"><Camera /></span>
                    <input type="file" accept="image/*" className="sr-only" aria-label={t(`תמונה של ${names[i]}`, `Photo of ${names[i]}`)} onChange={(e) => pickPhoto(i, e)} />
                  </label>
                  <input value={name} maxLength={20} aria-label={t(`שם משתתף ${i + 1}`, `Player ${i + 1} name`)} onChange={(e) => setPlayers((list) => list.map((item, j) => (j === i ? e.target.value : item)))} />
                  {photos[i] && <button type="button" title={t("הסרת התמונה", "Remove the photo")} aria-label={t(`הסרת התמונה של ${names[i]}`, `Remove ${names[i]}'s photo`)} onClick={() => setPhoto(i, null)}><ImageOff aria-hidden="true" /></button>}
                  {players.length > 2 && <button type="button" aria-label={t(`הסרת ${names[i]}`, `Remove ${names[i]}`)} onClick={() => removePlayer(i)}><X aria-hidden="true" /></button>}
                </span>
              ))}
              {players.length < MAX_PLAYERS && (
                <button type="button" className="who-add" onClick={() => setPlayers((list) => [...list, ""])}><Plus aria-hidden="true" />{t("משתתף", "Player")}</button>
              )}
              <div className="who-photo-note">{t("📷 התמונות נשמרות רק במכשיר הזה ולא עולות לאתר.", "📷 Photos stay on this device only and are never uploaded.")}</div>
              <button type="button" className="who-done" onClick={() => { setPlayers((list) => list.map((name, i) => name.trim() || names[i])); setEditing(false); }}>{t("סיום", "Done")}</button>
            </div>
          ) : (
            <button type="button" className="who-edit-open" onClick={() => setEditing(true)}>
              {t(`${players.length} משתתפים`, `${players.length} players`)} · {t("שמות ותמונות", "Names and photos")}
            </button>
          )}
        </section>
        {!editing && mode === "rhyme" && <Rhyme key={players.length} t={t} names={names} photos={photos} language={language} />}
        {!editing && mode === "draw" && <Draw key={players.length} t={t} names={names} photos={photos} />}
        {!editing && mode === "rps" && <RockPaperScissors key={players.length} t={t} names={names} photos={photos} />}
      </div>
    </div>
  );
}

function PlayerCircles({ names, photos, active, winner }) {
  return (
    <div className="who-circles">
      {names.map((name, i) => (
        <div key={i} className={`who-player${active === i ? " active" : ""}${winner === i ? " winner" : ""}`} style={{ "--who-color": COLORS[i] }}>
          <Avatar photo={photos[i]} index={i} />
          <strong>{name}</strong>
        </div>
      ))}
    </div>
  );
}

function Winner({ t, name, photo, onAgain }) {
  return (
    <div className="who-winner" role="status">
      {photo ? <img className="who-winner-photo" src={photo} alt="" /> : <span aria-hidden="true">🎉</span>}
      <strong>{t(`התור של ${name}!`, `${name} goes first!`)}</strong>
      <button type="button" className="who-again" onClick={onAgain}><RotateCcw aria-hidden="true" />{t("שוב", "Again")}</button>
    </div>
  );
}

// Says the rhyme word by word, pointing at the next player on every word.
function Rhyme({ t, names, photos, language }) {
  const words = language === "en" ? RHYME_EN : RHYME_HE;
  const [step, setStep] = useState(-1);
  const [start, setStart] = useState(0);
  const running = step >= 0 && step < words.length;
  const done = step >= words.length;
  const pointAt = (n) => (start + n) % names.length;

  useEffect(() => {
    if (!running) return undefined;
    const id = window.setTimeout(() => setStep((n) => n + 1), 650);
    return () => window.clearTimeout(id);
  }, [running, step]);

  function go() { setStart(randomIndex(names.length)); setStep(0); }
  const winner = pointAt(words.length - 1);
  return (
    <div className="who-stage">
      <PlayerCircles names={names} photos={photos} active={running ? pointAt(step) : -1} winner={done ? winner : -1} />
      {!done && <div className="who-word" aria-live="polite">{running ? words[step] : words.slice(0, 3).join(" ") + "…"}</div>}
      {done ? <Winner t={t} name={names[winner]} onAgain={go} /> : (
        <div className="choice-board-actions"><button type="button" className="choice-primary" onClick={go} disabled={running}>{t("מתחילים לספור", "Start counting")}</button></div>
      )}
    </div>
  );
}

// Runs around the players, slowing down, and stops on a random one.
function Draw({ t, names, photos }) {
  const [active, setActive] = useState(-1);
  const [winner, setWinner] = useState(-1);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function go() {
    window.clearTimeout(timer.current);
    setWinner(-1);
    const target = randomIndex(names.length);
    const from = randomIndex(names.length);
    const total = names.length * 3 + ((target - from + names.length) % names.length);
    let n = 0;
    const tick = () => {
      setActive((from + n) % names.length);
      if (n >= total) { setWinner(target); return; }
      n += 1;
      timer.current = window.setTimeout(tick, 70 + (n / total) ** 3 * 450);
    };
    tick();
  }
  const spinning = active >= 0 && winner < 0;
  return (
    <div className="who-stage">
      <PlayerCircles names={names} photos={photos} active={spinning ? active : -1} winner={winner} />
      {winner >= 0 ? <Winner t={t} name={names[winner]} onAgain={go} /> : (
        <div className="choice-board-actions"><button type="button" className="choice-primary" onClick={go} disabled={spinning}><img className="who-button-art" src={`${ART}draw.webp`} alt="" />{t("מגרילים!", "Draw!")}</button></div>
      )}
    </div>
  );
}

// Two players each pick in secret, then "rock… paper… scissors!" shows both hands.
function RockPaperScissors({ t, names, photos }) {
  const [sides, setSides] = useState([0, 1]);
  const [picks, setPicks] = useState([null, null]);
  const [count, setCount] = useState(-1);
  const sayings = [t("אבן…", "Rock…"), t("נייר…", "Paper…"), t("ומספריים!", "Scissors!")];
  const revealed = count >= sayings.length;

  useEffect(() => {
    if (count < 0 || revealed) return undefined;
    const id = window.setTimeout(() => setCount((n) => n + 1), 700);
    return () => window.clearTimeout(id);
  }, [count, revealed]);

  const pick = (side, hand) => setPicks((list) => list.map((p, i) => (i === side ? hand : p)));
  const again = () => { setPicks([null, null]); setCount(-1); };
  const [a, b] = picks.map((id) => HANDS.find((hand) => hand.id === id));
  const result = revealed ? (a.id === b.id ? -1 : a.beats === b.id ? 0 : 1) : null;

  return (
    <div className="who-stage">
      <div className="who-rps">
        {[0, 1].map((side) => (
          <div key={side} className="who-rps-side" style={{ "--who-color": COLORS[sides[side]] }}>
            <div className="who-rps-who">
            <Avatar photo={photos[sides[side]]} index={sides[side]} />
            <select aria-label={t("מי משחק", "Who plays")} value={sides[side]} onChange={(e) => { setSides((list) => list.map((p, i) => (i === side ? Number(e.target.value) : p))); again(); }}>
              {names.map((name, i) => <option key={i} value={i} disabled={i === sides[1 - side]}>{AVATARS[i]} {name}</option>)}
            </select>
            </div>
            {revealed ? (
              <div className={`who-rps-hand${result === side ? " winner" : ""}`}><img src={(side ? b : a).image} alt="" />{t((side ? b : a).he, (side ? b : a).en)}</div>
            ) : picks[side] ? (
              <div className="who-rps-hand hidden"><img src={`${ART}secret.webp`} alt="" />{t("בחרתי!", "Picked!")}</div>
            ) : (
              <div className="who-rps-picks">
                {HANDS.map((hand) => (
                  <button key={hand.id} type="button" onClick={() => pick(side, hand.id)} disabled={count >= 0}>
                    <img src={hand.image} alt="" />{t(hand.he, hand.en)}
                  </button>
                ))}
                <button type="button" className="who-rps-random" onClick={() => pick(side, HANDS[randomIndex(3)].id)} disabled={count >= 0}><img className="who-button-art" src={`${ART}draw.webp`} alt="" />{t("אקראי", "Random")}</button>
              </div>
            )}
          </div>
        ))}
      </div>
      {count >= 0 && !revealed && <div className="who-word" aria-live="polite">{sayings[count]}</div>}
      {revealed ? (result < 0 ? (
        <div className="who-winner" role="status"><img className="who-tie-art" src={`${ART}tie.webp`} alt="" /><strong>{t("תיקו! עוד פעם", "A tie! Once more")}</strong><button type="button" className="who-again" onClick={again}><RotateCcw aria-hidden="true" />{t("שוב", "Again")}</button></div>
      ) : <Winner t={t} name={names[sides[result]]} photo={photos[sides[result]]} onAgain={again} />) : count < 0 && (
        <div className="choice-board-actions">
          <button type="button" className="choice-primary" disabled={!picks[0] || !picks[1]} onClick={() => setCount(0)}>{t("אבן, נייר ומספריים!", "Rock, paper, scissors!")}</button>
        </div>
      )}
    </div>
  );
}
